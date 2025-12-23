/**
 * Hooks filtrados para usuários do tipo Artista
 * Estes hooks automaticamente filtram dados para mostrar apenas
 * informações relacionadas ao artista vinculado ao usuário
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useArtistFilter } from './useLinkedArtist';

/**
 * Hook para buscar artistas - retorna apenas o artista do usuário se for artista
 */
export function useFilteredArtists() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredArtists', artistId, shouldFilter],
    queryFn: async () => {
      if (shouldFilter && artistId) {
        // Artista vê apenas seu próprio perfil
        const { data, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', artistId);
        
        if (error) throw error;
        return data || [];
      }
      
      // Admin/Gestor vê todos
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar projetos filtrados por artista
 */
export function useFilteredProjects() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredProjects', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar contratos filtrados por artista
 */
export function useFilteredContracts() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredContracts', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('contracts')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar lançamentos filtrados por artista
 */
export function useFilteredReleases() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredReleases', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('releases')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar obras (music_registry) filtradas por artista
 */
export function useFilteredMusicRegistry() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredMusicRegistry', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('music_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        // Filtra por artist_ids que contém o artistId
        query = query.contains('artist_ids', [artistId]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar fonogramas filtrados por artista
 */
export function useFilteredPhonograms() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredPhonograms', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('phonograms')
        .select('*')
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar eventos de agenda filtrados por artista
 */
export function useFilteredAgendaEvents() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredAgendaEvents', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('agenda_events')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('start_date', { ascending: true });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar transações financeiras filtradas por artista
 */
export function useFilteredFinancialTransactions() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredFinancialTransactions', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('date', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar gestão de shares filtrada por artista
 */
export function useFilteredShares() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredShares', artistId, shouldFilter],
    queryFn: async () => {
      // Busca royalty_splits que têm o artista como participante
      let query = supabase
        .from('royalty_splits')
        .select(`
          *,
          releases:release_id (id, title, artist_id),
          music_registry:music_registry_id (id, title)
        `)
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        // Filtra por artist_id no split ou no release associado
        query = query.or(`artist_id.eq.${artistId},releases.artist_id.eq.${artistId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook para buscar campanhas de marketing filtradas por artista
 */
export function useFilteredMarketingCampaigns() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredMarketingCampaigns', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('marketing_campaigns')
        .select(`
          *,
          artists:artist_id (id, name, stage_name)
        `)
        .order('created_at', { ascending: false });

      if (shouldFilter && artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !isLoadingFilter,
  });
}

/**
 * Hook genérico para obter contagens filtradas
 */
export function useFilteredCounts() {
  const { shouldFilter, artistId, isLoading: isLoadingFilter } = useArtistFilter();

  return useQuery({
    queryKey: ['filteredCounts', artistId, shouldFilter],
    queryFn: async () => {
      const baseFilter = shouldFilter && artistId;

      const [
        artistsCount,
        projectsCount,
        contractsCount,
        releasesCount,
        worksCount,
        eventsCount,
      ] = await Promise.all([
        baseFilter
          ? supabase.from('artists').select('id', { count: 'exact', head: true }).eq('id', artistId)
          : supabase.from('artists').select('id', { count: 'exact', head: true }),
        baseFilter
          ? supabase.from('projects').select('id', { count: 'exact', head: true }).eq('artist_id', artistId)
          : supabase.from('projects').select('id', { count: 'exact', head: true }),
        baseFilter
          ? supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('artist_id', artistId).in('status', ['assinado', 'ativo', 'active'])
          : supabase.from('contracts').select('id', { count: 'exact', head: true }).in('status', ['assinado', 'ativo', 'active']),
        baseFilter
          ? supabase.from('releases').select('id', { count: 'exact', head: true }).eq('artist_id', artistId)
          : supabase.from('releases').select('id', { count: 'exact', head: true }),
        baseFilter
          ? supabase.from('music_registry').select('id', { count: 'exact', head: true }).contains('artist_ids', [artistId])
          : supabase.from('music_registry').select('id', { count: 'exact', head: true }),
        baseFilter
          ? supabase.from('agenda_events').select('id', { count: 'exact', head: true }).eq('artist_id', artistId)
          : supabase.from('agenda_events').select('id', { count: 'exact', head: true }),
      ]);

      return {
        artists: artistsCount.count || 0,
        projects: projectsCount.count || 0,
        contracts: contractsCount.count || 0,
        releases: releasesCount.count || 0,
        works: worksCount.count || 0,
        events: eventsCount.count || 0,
      };
    },
    enabled: !isLoadingFilter,
  });
}
