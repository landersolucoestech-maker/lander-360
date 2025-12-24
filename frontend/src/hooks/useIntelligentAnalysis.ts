import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Insight {
  id: string;
  type: 'insight' | 'inconsistency' | 'opportunity' | 'alert';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  module: string;
  actionable: boolean;
  suggestedAction?: string;
  relatedEntities?: { type: string; id: string; name: string }[];
  createdAt: Date;
}

interface AnalysisResult {
  insights: Insight[];
  inconsistencies: Insight[];
  opportunities: Insight[];
  alerts: Insight[];
  summary: {
    totalIssues: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export const useIntelligentAnalysis = () => {
  return useQuery({
    queryKey: ['intelligent-analysis'],
    queryFn: async (): Promise<AnalysisResult> => {
      const insights: Insight[] = [];
      const inconsistencies: Insight[] = [];
      const opportunities: Insight[] = [];
      const alerts: Insight[] = [];

      // Fetch all necessary data in parallel
      const [
        { data: artists },
        { data: contracts },
        { data: releases },
        { data: transactions },
        { data: projects },
        { data: musicRegistry },
        { data: phonograms },
        { data: goals },
        { data: events }
      ] = await Promise.all([
        supabase.from('artists').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('releases').select('*'),
        supabase.from('financial_transactions').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('music_registry').select('*'),
        supabase.from('phonograms').select('*'),
        supabase.from('artist_goals').select('*'),
        supabase.from('agenda_events').select('*')
      ]);

      const now = new Date();

      // === ANÁLISE DE CONTRATOS ===
      contracts?.forEach(contract => {
        // Contratos próximos do vencimento
        if (contract.end_date || contract.effective_to) {
          const endDate = new Date(contract.end_date || contract.effective_to);
          const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
            alerts.push({
              id: `contract-expiry-${contract.id}`,
              type: 'alert',
              severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
              title: 'Contrato Próximo do Vencimento',
              description: `O contrato "${contract.title}" vence em ${daysUntilExpiry} dias.`,
              module: 'Contratos',
              actionable: true,
              suggestedAction: 'Iniciar processo de renovação ou encerramento',
              relatedEntities: [{ type: 'contract', id: contract.id, name: contract.title }],
              createdAt: now
            });
          }
        }

        // Contratos sem valor definido
        if (contract.status === 'ativo' && !contract.value && !contract.royalty_rate) {
          inconsistencies.push({
            id: `contract-no-value-${contract.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Contrato Ativo Sem Valor',
            description: `O contrato "${contract.title}" está ativo mas não possui valor ou royalty definido.`,
            module: 'Contratos',
            actionable: true,
            suggestedAction: 'Definir valor ou percentual de royalties',
            relatedEntities: [{ type: 'contract', id: contract.id, name: contract.title }],
            createdAt: now
          });
        }
      });

      // === ANÁLISE DE ARTISTAS ===
      artists?.forEach(artist => {
        const artistContracts = contracts?.filter(c => c.artist_id === artist.id && c.status === 'ativo') || [];
        const artistReleases = releases?.filter(r => r.artist_id === artist.id) || [];
        const artistGoals = goals?.filter(g => g.artist_id === artist.id) || [];

        // Artista sem contrato ativo
        if (artistContracts.length === 0 && artistReleases.length > 0) {
          inconsistencies.push({
            id: `artist-no-contract-${artist.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Artista Sem Contrato Ativo',
            description: `${artist.name} tem lançamentos mas não possui contrato ativo.`,
            module: 'Artistas',
            actionable: true,
            suggestedAction: 'Regularizar situação contratual',
            relatedEntities: [{ type: 'artist', id: artist.id, name: artist.name }],
            createdAt: now
          });
        }

        // Artista sem metas definidas
        if (artistContracts.length > 0 && artistGoals.length === 0) {
          opportunities.push({
            id: `artist-no-goals-${artist.id}`,
            type: 'opportunity',
            severity: 'info',
            title: 'Oportunidade de Definir Metas',
            description: `${artist.name} possui contrato mas não tem metas definidas.`,
            module: 'Artistas',
            actionable: true,
            suggestedAction: 'Definir OKRs e metas de crescimento',
            relatedEntities: [{ type: 'artist', id: artist.id, name: artist.name }],
            createdAt: now
          });
        }

        // Artista sem redes sociais
        if (!artist.instagram && !artist.spotify_url && !artist.youtube_url) {
          inconsistencies.push({
            id: `artist-no-social-${artist.id}`,
            type: 'inconsistency',
            severity: 'info',
            title: 'Perfil Incompleto',
            description: `${artist.name} não possui redes sociais cadastradas.`,
            module: 'Artistas',
            actionable: true,
            suggestedAction: 'Completar perfil com links de redes sociais',
            relatedEntities: [{ type: 'artist', id: artist.id, name: artist.name }],
            createdAt: now
          });
        }
      });

      // === ANÁLISE DE LANÇAMENTOS ===
      releases?.forEach(release => {
        // Lançamentos sem data definida
        if (!release.release_date && release.status !== 'cancelled') {
          inconsistencies.push({
            id: `release-no-date-${release.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Lançamento Sem Data',
            description: `O lançamento "${release.title}" não possui data definida.`,
            module: 'Lançamentos',
            actionable: true,
            suggestedAction: 'Definir data de lançamento',
            relatedEntities: [{ type: 'release', id: release.id, name: release.title }],
            createdAt: now
          });
        }

        // Lançamentos próximos sem preparação completa
        if (release.release_date) {
          const releaseDate = new Date(release.release_date);
          const daysUntilRelease = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilRelease > 0 && daysUntilRelease <= 14 && release.status === 'planning') {
            alerts.push({
              id: `release-unprepared-${release.id}`,
              type: 'alert',
              severity: 'critical',
              title: 'Lançamento Próximo Sem Aprovação',
              description: `"${release.title}" lança em ${daysUntilRelease} dias mas ainda está em planejamento.`,
              module: 'Lançamentos',
              actionable: true,
              suggestedAction: 'Acelerar processo de aprovação e distribuição',
              relatedEntities: [{ type: 'release', id: release.id, name: release.title }],
              createdAt: now
            });
          }
        }
      });

      // === ANÁLISE FINANCEIRA ===
      const pendingTransactions = transactions?.filter(t => t.status === 'pendente') || [];
      const overdueTransactions = pendingTransactions.filter(t => {
        if (!t.date) return false;
        return new Date(t.date) < now;
      });

      if (overdueTransactions.length > 0) {
        const totalOverdue = overdueTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        alerts.push({
          id: 'overdue-transactions',
          type: 'alert',
          severity: 'critical',
          title: 'Transações Vencidas',
          description: `${overdueTransactions.length} transações vencidas totalizando R$ ${totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
          module: 'Financeiro',
          actionable: true,
          suggestedAction: 'Regularizar pagamentos pendentes',
          createdAt: now
        });
      }

      // Análise de receita por artista
      const revenueByArtist = new Map<string, number>();
      transactions?.filter(t => t.type === 'receitas' && t.artist_id).forEach(t => {
        const current = revenueByArtist.get(t.artist_id!) || 0;
        revenueByArtist.set(t.artist_id!, current + (t.amount || 0));
      });

      // === ANÁLISE DE OBRAS E FONOGRAMAS ===
      musicRegistry?.forEach(obra => {
        // Obras sem ISRC
        if (!obra.isrc && obra.status === 'registrado') {
          inconsistencies.push({
            id: `obra-no-isrc-${obra.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Obra Registrada Sem ISRC',
            description: `A obra "${obra.title}" está registrada mas não possui ISRC.`,
            module: 'Registro de Músicas',
            actionable: true,
            suggestedAction: 'Solicitar ou cadastrar código ISRC',
            relatedEntities: [{ type: 'music_registry', id: obra.id, name: obra.title }],
            createdAt: now
          });
        }

        // Obras sem participantes definidos
        if (!obra.participants || (Array.isArray(obra.participants) && obra.participants.length === 0)) {
          inconsistencies.push({
            id: `obra-no-participants-${obra.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Obra Sem Participantes',
            description: `A obra "${obra.title}" não possui participantes/splits definidos.`,
            module: 'Registro de Músicas',
            actionable: true,
            suggestedAction: 'Definir compositores e percentuais de participação',
            relatedEntities: [{ type: 'music_registry', id: obra.id, name: obra.title }],
            createdAt: now
          });
        }
      });

      // === ANÁLISE DE PROJETOS ===
      projects?.forEach(project => {
        if (project.status === 'em_andamento') {
          // Projetos sem prazo
          if (!project.end_date) {
            inconsistencies.push({
              id: `project-no-deadline-${project.id}`,
              type: 'inconsistency',
              severity: 'info',
              title: 'Projeto Sem Prazo',
              description: `O projeto "${project.name}" está em andamento mas não possui prazo definido.`,
              module: 'Projetos',
              actionable: true,
              suggestedAction: 'Definir prazo de entrega',
              relatedEntities: [{ type: 'project', id: project.id, name: project.name }],
              createdAt: now
            });
          }
        }
      });

      // === ANÁLISE DE EVENTOS ===
      const upcomingEvents = events?.filter(e => {
        const eventDate = new Date(e.start_date);
        return eventDate > now && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }) || [];

      upcomingEvents.forEach(event => {
        if (!event.venue_name || !event.location) {
          inconsistencies.push({
            id: `event-incomplete-${event.id}`,
            type: 'inconsistency',
            severity: 'warning',
            title: 'Evento Sem Local Definido',
            description: `O evento "${event.title}" está próximo mas não possui local definido.`,
            module: 'Agenda',
            actionable: true,
            suggestedAction: 'Definir local e endereço do evento',
            relatedEntities: [{ type: 'event', id: event.id, name: event.title }],
            createdAt: now
          });
        }
      });

      // === INSIGHTS AUTOMÁTICOS ===
      
      // Insight de crescimento
      const thisMonth = now.getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisMonthReleases = releases?.filter(r => new Date(r.created_at).getMonth() === thisMonth).length || 0;
      const lastMonthReleases = releases?.filter(r => new Date(r.created_at).getMonth() === lastMonth).length || 0;

      if (thisMonthReleases > lastMonthReleases && lastMonthReleases > 0) {
        const growth = ((thisMonthReleases - lastMonthReleases) / lastMonthReleases * 100).toFixed(0);
        insights.push({
          id: 'release-growth',
          type: 'insight',
          severity: 'info',
          title: 'Crescimento em Lançamentos',
          description: `Volume de lançamentos cresceu ${growth}% em relação ao mês anterior.`,
          module: 'Lançamentos',
          actionable: false,
          createdAt: now
        });
      }

      // Oportunidades de cross-selling
      artists?.forEach(artist => {
        const artistProjects = projects?.filter(p => p.artist_id === artist.id) || [];
        const hasReleases = releases?.some(r => r.artist_id === artist.id);

        if (hasReleases && artistProjects.length === 0) {
          opportunities.push({
            id: `opportunity-project-${artist.id}`,
            type: 'opportunity',
            severity: 'info',
            title: 'Oportunidade de Novo Projeto',
            description: `${artist.name} tem lançamentos mas nenhum projeto ativo.`,
            module: 'Projetos',
            actionable: true,
            suggestedAction: 'Propor produção de novo projeto',
            relatedEntities: [{ type: 'artist', id: artist.id, name: artist.name }],
            createdAt: now
          });
        }
      });

      // Calcular sumário
      const allItems = [...insights, ...inconsistencies, ...opportunities, ...alerts];
      const summary = {
        totalIssues: allItems.length,
        criticalCount: allItems.filter(i => i.severity === 'critical').length,
        warningCount: allItems.filter(i => i.severity === 'warning').length,
        infoCount: allItems.filter(i => i.severity === 'info').length
      };

      return {
        insights,
        inconsistencies,
        opportunities,
        alerts,
        summary
      };
    },
    refetchInterval: 5 * 60 * 1000, // Atualiza a cada 5 minutos
    staleTime: 2 * 60 * 1000
  });
};
