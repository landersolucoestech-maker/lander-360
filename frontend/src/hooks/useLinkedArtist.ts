import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LinkedArtist {
  id: string;
  name: string;
  stage_name: string | null;
  avatar_url: string | null;
}

/**
 * Hook para obter o artista vinculado ao usuário atual
 * Usado quando o usuário tem role "artista" para filtrar dados
 */
export function useLinkedArtist() {
  const { user, permissions } = useAuth();
  const isArtist = permissions.roles.includes('artista') && !permissions.isAdmin;

  return useQuery({
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

      console.log('[useLinkedArtist] Linked artist:', artistData);
      return artistData;
    },
    enabled: !!user?.id && isArtist,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter estatísticas do dashboard filtradas para um artista específico
 */
export function useArtistDashboardStats(artistId: string | null) {
  return useQuery({
    queryKey: ['artistDashboardStats', artistId],
    queryFn: async () => {
      if (!artistId) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Buscar dados específicos do artista em paralelo
      const [
        projectsResult,
        contractsResult,
        releasesResult,
        eventsResult,
        worksResult,
      ] = await Promise.all([
        // Projetos do artista
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('artist_id', artistId),
        
        // Contratos do artista
        supabase
          .from('contracts')
          .select('id, value', { count: 'exact' })
          .eq('artist_id', artistId)
          .in('status', ['assinado', 'ativo', 'active']),
        
        // Lançamentos do artista
        supabase
          .from('releases')
          .select('id, spotify_streams, apple_music_streams, deezer_streams, youtube_views')
          .eq('artist_id', artistId),
        
        // Eventos do artista para hoje
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
          .select('id', { count: 'exact', head: true })
          .contains('artist_ids', [artistId]),
      ]);

      // Calcular streams totais
      const totalStreams = (releasesResult.data || []).reduce((sum, r) => {
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

      return {
        totalProjects: projectsResult.count || 0,
        activeContracts: contractsResult.count || 0,
        contractsValue,
        totalReleases: (releasesResult.data || []).length,
        totalStreams,
        totalWorks: worksResult.count || 0,
        upcomingEvents: eventsResult.data || [],
      };
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
}
