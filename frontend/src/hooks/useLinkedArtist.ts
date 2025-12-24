import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LinkedArtist {
  id: string;
  name: string;
  stage_name: string | null;
  avatar_url: string | null;
}

interface ArtistFilterContext {
  isArtistUser: boolean;
  artistId: string | null;
  artistName: string | null;
  isLoading: boolean;
  shouldFilter: boolean; // true se deve filtrar por artista
}

/**
 * Hook para obter o artista vinculado ao usuário atual
 * Usado quando o usuário tem role "artista" para filtrar dados
 */
export function useLinkedArtist() {
  const { user, permissions } = useAuth();
  const isArtistUser = permissions.roles.includes('artista') && !permissions.isAdmin;

  const query = useQuery({
    queryKey: ['linkedArtist', user?.id],
    queryFn: async (): Promise<LinkedArtist | null> => {
      if (!user?.id) return null;

      // Buscar vínculo na tabela user_artists
      const { data: linkData, error: linkError } = await supabase
        .from('user_artists')
        .select('artist_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (linkError) {
        console.error('[useLinkedArtist] Error fetching link:', linkError);
        return null;
      }

      if (!linkData?.artist_id) {
        console.log('[useLinkedArtist] No artist linked to user');
        return null;
      }

      // Buscar dados do artista
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('id, name, stage_name, avatar_url')
        .eq('id', linkData.artist_id)
        .single();

      if (artistError) {
        console.error('[useLinkedArtist] Error fetching artist:', artistError);
        return null;
      }

      return artistData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isArtistUser,
  };
}

/**
 * Hook que retorna o contexto de filtragem por artista
 * Use em qualquer página/componente que precisa filtrar dados por artista
 */
export function useArtistFilter(): ArtistFilterContext {
  const { user, permissions, isFullyLoaded } = useAuth();
  const isArtistUser = permissions.roles.includes('artista') && !permissions.isAdmin;
  
  const { data: linkedArtist, isLoading: isLoadingArtist } = useLinkedArtist();

  return {
    isArtistUser,
    artistId: isArtistUser ? (linkedArtist?.id || null) : null,
    artistName: linkedArtist?.name || linkedArtist?.name || null,
    isLoading: !isFullyLoaded || (isArtistUser && isLoadingArtist),
    shouldFilter: isArtistUser && !!linkedArtist?.id,
  };
}

/**
 * Hook para obter estatísticas do dashboard filtradas para um artista específico
 * Inclui: Minha Carteira, Minha Carreira, Meus Lançamentos, Desempenho
 */
export function useArtistDashboardStats(artistId: string | null) {
  return useQuery({
    queryKey: ['artistDashboardStats', artistId],
    queryFn: async () => {
      if (!artistId) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Buscar dados específicos do artista em paralelo
      const [
        projectsResult,
        contractsResult,
        releasesResult,
        eventsResult,
        worksResult,
        phonogramsResult,
        financialResult,
      ] = await Promise.all([
        // Projetos do artista
        supabase
          .from('projects')
          .select('id, title, status', { count: 'exact' })
          .eq('artist_id', artistId),
        
        // Contratos do artista
        supabase
          .from('contracts')
          .select('id, value, status', { count: 'exact' })
          .eq('artist_id', artistId)
          .in('status', ['assinado', 'ativo', 'active']),
        
        // Lançamentos do artista (com mais detalhes)
        supabase
          .from('releases')
          .select('id, title, status, release_date, spotify_streams, apple_music_streams, deezer_streams, youtube_views')
          .eq('artist_id', artistId)
          .order('release_date', { ascending: false }),
        
        // Eventos do artista
        supabase
          .from('agenda_events')
          .select('id, title, start_date, start_time, end_time, location, status, event_type')
          .eq('artist_id', artistId)
          .gte('start_date', now.toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(5),
        
        // Obras do artista
        supabase
          .from('music_registry')
          .select('id, title, type', { count: 'exact' })
          .contains('artist_ids', [artistId]),
        
        // Fonogramas do artista
        supabase
          .from('phonograms')
          .select('id', { count: 'exact', head: true })
          .eq('artist_id', artistId),
        
        // Transações financeiras do artista
        supabase
          .from('financial_transactions')
          .select('id, amount, type, status, created_at')
          .eq('artist_id', artistId),
      ]);

      // Calcular streams totais
      const releases = releasesResult.data || [];
      const totalStreams = releases.reduce((sum, r) => {
        return sum + 
          (Number(r.spotify_streams) || 0) + 
          (Number(r.apple_music_streams) || 0) + 
          (Number(r.deezer_streams) || 0) + 
          (Number(r.youtube_views) || 0);
      }, 0);

      // Calcular valor total de contratos
      const contractsValue = (contractsResult.data || []).reduce((sum, c) => 
        sum + Number(c.value || 0), 0
      );

      // Calcular saldos financeiros
      const transactions = financialResult.data || [];
      const availableBalance = transactions
        .filter(t => t.status === 'pago' || t.status === 'completed')
        .reduce((sum, t) => sum + (t.type === 'receita' ? Number(t.amount) : -Number(t.amount)), 0);
      
      const pendingBalance = transactions
        .filter(t => t.status === 'pendente' || t.status === 'pending')
        .reduce((sum, t) => sum + (t.type === 'receita' ? Number(t.amount) : 0), 0);
      
      const totalEarnings = transactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Ganhos do mês
      const monthlyEarnings = transactions
        .filter(t => t.type === 'receita' && new Date(t.created_at) >= new Date(startOfMonth))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // Lançamentos publicados vs agendados
      const publishedReleases = releases.filter(r => 
        r.status === 'publicado' || r.status === 'published' || r.status === 'released'
      ).length;
      
      const scheduledReleases = releases.filter(r => 
        r.status === 'agendado' || r.status === 'scheduled' || r.status === 'pending'
      ).length;

      // Top obras por streams (mock - na prática seria de outra tabela)
      const works = worksResult.data || [];
      const topWorks = works.slice(0, 5).map((w, i) => ({
        id: w.id,
        title: w.title,
        streams: Math.floor(totalStreams / (works.length || 1) * (1 - i * 0.15)) // Distribuição simulada
      }));

      return {
        // Minha Carreira
        totalProjects: projectsResult.count || 0,
        activeContracts: contractsResult.count || 0,
        contractsValue,
        totalWorks: worksResult.count || 0,
        totalPhonograms: phonogramsResult.count || 0,
        
        // Meus Lançamentos
        totalReleases: releases.length,
        publishedReleases,
        scheduledReleases,
        recentReleases: releases.slice(0, 5),
        
        // Desempenho
        totalStreams,
        monthlyEarnings,
        topWorks,
        
        // Minha Carteira
        availableBalance,
        pendingBalance,
        totalEarnings,
        
        // Minha Agenda
        upcomingEvents: eventsResult.data || [],
      };
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
}
