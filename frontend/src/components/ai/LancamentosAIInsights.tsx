import { useMemo } from "react";
import { AIInsightsCard, AIInsight } from "./AIInsightsCard";
import { useReleases } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";
import { useNavigate } from "react-router-dom";

export function LancamentosAIInsights() {
  const navigate = useNavigate();
  const { data: releases = [] } = useReleases();
  const { data: artists = [] } = useArtists();

  const dataContext = useMemo(() => {
    const now = new Date();

    // Status breakdown
    const statusCount: Record<string, number> = {};
    releases.forEach((r: any) => {
      const status = r.status || 'indefinido';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Upcoming releases (next 30 days)
    const upcoming = releases.filter((r: any) => {
      if (!r.release_date) return false;
      const releaseDate = new Date(r.release_date);
      const daysUntilRelease = (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilRelease > 0 && daysUntilRelease <= 30;
    }).map((r: any) => ({
      titulo: r.title,
      dataLancamento: r.release_date,
      artista: artists.find((a: any) => a.id === r.artist_id)?.name || r.artist_name || 'N/A',
      tipo: r.release_type,
      diasRestantes: Math.ceil((new Date(r.release_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Recent releases (last 30 days)
    const recent = releases.filter((r: any) => {
      if (!r.release_date) return false;
      const releaseDate = new Date(r.release_date);
      const daysSinceRelease = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceRelease >= 0 && daysSinceRelease <= 30;
    });

    // Pending approval
    const pendingApproval = releases.filter((r: any) => 
      r.status === 'pending' || r.status === 'planning' || r.approval_status === 'pending'
    );

    // Releases by type
    const typeCount: Record<string, number> = {};
    releases.forEach((r: any) => {
      const type = r.release_type || 'outro';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Releases without distributor
    const semDistribuidor = releases.filter((r: any) => 
      !r.distributors || (Array.isArray(r.distributors) && r.distributors.length === 0)
    ).length;

    return {
      totalLancamentos: releases.length,
      porStatus: statusCount,
      porTipo: typeCount,
      proximosLancamentos: upcoming,
      lancamentosRecentes: recent.length,
      aguardandoAprovacao: pendingApproval.length,
      semDistribuidor,
      artistasMaisAtivos: Object.entries(
        releases.reduce((acc: Record<string, number>, r: any) => {
          const artist = r.artist_name || 'Desconhecido';
          acc[artist] = (acc[artist] || 0) + 1;
          return acc;
        }, {})
      ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 5),
    };
  }, [releases, artists]);

  const context = `
Analise os lançamentos da gravadora e identifique:
1. Lançamentos próximos que precisam de atenção
2. Status de aprovações pendentes
3. Lacunas na distribuição
4. Oportunidades de marketing/timing
5. Recomendações para otimizar o calendário de lançamentos
`;

  const handleInsightAction = (insight: AIInsight) => {
    if (insight.action?.toLowerCase().includes('lançamento')) {
      navigate('/lancamentos');
    }
  };

  return (
    <AIInsightsCard
      title="Insights de Lançamentos"
      description="Análise automática do calendário"
      context={context}
      dataContext={dataContext}
      onInsightAction={handleInsightAction}
    />
  );
}
