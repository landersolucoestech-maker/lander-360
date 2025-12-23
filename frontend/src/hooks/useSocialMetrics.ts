import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SocialMetrics {
  id: string;
  artist_id: string;
  platform: string;
  metric_type: string;
  date: string;
  followers: number;
  value: number; // For YouTube views
  reach: number; // For YouTube video count
  created_at: string;
}

export interface ArtistSocialMetrics {
  youtube?: {
    subscribers: number;
    views: number;
    videoCount: number;
  };
  instagram?: {
    followers: number;
  };
  tiktok?: {
    followers: number;
  };
  deezer?: {
    followers: number;
  };
  apple?: {
    followers: number;
  };
}

// Get latest social metrics for an artist
export const useArtistSocialMetrics = (artistId: string | undefined) => {
  return useQuery({
    queryKey: ['social-metrics', artistId],
    queryFn: async (): Promise<ArtistSocialMetrics> => {
      if (!artistId) return {};
      
      const { data, error } = await supabase
        .from('social_media_metrics')
        .select('*')
        .eq('artist_id', artistId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return {};
      
      // Group by platform and get latest for each
      const metrics: ArtistSocialMetrics = {};
      const seenPlatforms = new Set<string>();
      
      for (const item of data) {
        if (seenPlatforms.has(item.platform)) continue;
        seenPlatforms.add(item.platform);
        
        if (item.platform === 'youtube') {
          // followers = subscribers, value = views, reach = videoCount
          metrics.youtube = {
            subscribers: item.followers || 0,
            views: item.value || 0,
            videoCount: item.reach || 0,
          };
        } else if (item.platform === 'instagram') {
          metrics.instagram = {
            followers: item.followers || 0,
          };
        } else if (item.platform === 'tiktok') {
          metrics.tiktok = {
            followers: item.followers || 0,
          };
        } else if (item.platform === 'deezer') {
          metrics.deezer = {
            followers: item.followers || 0,
          };
        } else if (item.platform === 'apple') {
          metrics.apple = {
            followers: item.followers || 0,
          };
        }
      }
      
      return metrics;
    },
    enabled: !!artistId,
  });
};

// Fetch fresh metrics from social platforms
export const useFetchSocialMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      artistId, 
      youtubeUrl, 
      instagramUrl, 
      tiktokUrl,
      deezerUrl,
      appleMusicUrl,
    }: { 
      artistId: string; 
      youtubeUrl?: string; 
      instagramUrl?: string; 
      tiktokUrl?: string;
      deezerUrl?: string;
      appleMusicUrl?: string;
    }) => {
      try {
        const { data, error } = await supabase.functions.invoke('social-metrics', {
          body: { artistId, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl, appleMusicUrl },
        });

        if (error) {
          console.warn('Social metrics edge function not available:', error.message);
          return { success: false, message: 'Função de métricas sociais não disponível' };
        }
        if (data?.error) {
          console.warn('Social metrics returned error:', data.error);
          return { success: false, message: data.error };
        }

        return data;
      } catch (err) {
        console.warn('Failed to fetch social metrics:', err);
        return { success: false, message: 'Não foi possível buscar métricas sociais' };
      }
    },
    onSuccess: (data, variables) => {
      if (data?.success !== false) {
        queryClient.invalidateQueries({ queryKey: ['social-metrics', variables.artistId] });
      }
    },
    onError: (error: Error) => {
      console.warn('Error fetching social metrics:', error);
    },
  });
};
