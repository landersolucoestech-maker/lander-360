import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SpotifyMetrics {
  id: string;
  artist_id: string;
  spotify_artist_id: string;
  followers: number;
  monthly_listeners: number;
  popularity: number;
  total_streams: number;
  top_tracks: TopTrack[];
  fetched_at: string;
  created_at: string;
}

export interface TopTrack {
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  spotify_url: string;
  album_name: string;
  album_image: string;
}

export interface FetchSpotifyMetricsResponse {
  success: boolean;
  data: SpotifyMetrics & {
    artist_name: string;
    artist_image: string;
  };
  error?: string;
}

// Get latest metrics for an artist
export const useArtistSpotifyMetrics = (artistId: string | undefined) => {
  return useQuery({
    queryKey: ['spotify-metrics', artistId],
    queryFn: async () => {
      if (!artistId) return null;
      
      const { data, error } = await supabase
        .from('spotify_metrics')
        .select('*')
        .eq('artist_id', artistId)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        top_tracks: (data.top_tracks || []) as unknown as TopTrack[],
      } as SpotifyMetrics;
    },
    enabled: !!artistId,
  });
};

// Get metrics history for an artist
export const useArtistSpotifyMetricsHistory = (artistId: string | undefined, limit = 30) => {
  return useQuery({
    queryKey: ['spotify-metrics-history', artistId, limit],
    queryFn: async () => {
      if (!artistId) return [];
      
      const { data, error } = await supabase
        .from('spotify_metrics')
        .select('*')
        .eq('artist_id', artistId)
        .order('fetched_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        top_tracks: (item.top_tracks || []) as unknown as TopTrack[],
      })) as SpotifyMetrics[];
    },
    enabled: !!artistId,
  });
};

// Fetch fresh metrics from Spotify API
export const useFetchSpotifyMetrics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ artistId, spotifyUrl }: { artistId: string; spotifyUrl?: string }) => {
      const { data, error } = await supabase.functions.invoke('spotify-metrics', {
        body: { artistId, spotifyUrl },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data as FetchSpotifyMetricsResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify-metrics', variables.artistId] });
      queryClient.invalidateQueries({ queryKey: ['spotify-metrics-history', variables.artistId] });
      
      toast({
        title: 'Sucesso',
        description: 'Métricas do Spotify atualizadas com sucesso.',
      });
    },
    onError: (error: Error) => {
      console.error('Error fetching Spotify metrics:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao buscar métricas do Spotify.',
        variant: 'destructive',
      });
    },
  });
};

// Update monthly listeners manually
export const useUpdateMonthlyListeners = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ artistId, monthlyListeners }: { artistId: string; monthlyListeners: number }) => {
      // Check if metrics record exists
      const { data: existing } = await supabase
        .from('spotify_metrics')
        .select('id')
        .eq('artist_id', artistId)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('spotify_metrics')
          .update({ monthly_listeners: monthlyListeners })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record with manual data
        const { error } = await supabase
          .from('spotify_metrics')
          .insert({
            artist_id: artistId,
            spotify_artist_id: 'manual-entry',
            monthly_listeners: monthlyListeners,
            followers: 0,
            popularity: 0,
            total_streams: 0,
            top_tracks: [],
            fetched_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spotify-metrics', variables.artistId] });
      toast({
        title: 'Sucesso',
        description: 'Ouvintes mensais atualizados.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar ouvintes mensais.',
        variant: 'destructive',
      });
    },
  });
};
