import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReleaseMetric {
  id: string;
  release_id: string;
  platform: string;
  streams: number;
  views: number;
  saves: number;
  playlist_adds: number;
  fetched_at: string;
  created_at: string;
}

export interface MetricsSummary {
  totalStreams: number;
  totalViews: number;
  totalSaves: number;
  byPlatform: {
    spotify: ReleaseMetric | null;
    apple_music: ReleaseMetric | null;
    youtube: ReleaseMetric | null;
    deezer: ReleaseMetric | null;
  };
  lastUpdated: string | null;
}

export const useReleaseMetrics = (releaseId: string | undefined) => {
  return useQuery({
    queryKey: ['release-metrics', releaseId],
    queryFn: async (): Promise<MetricsSummary> => {
      if (!releaseId) {
        return {
          totalStreams: 0,
          totalViews: 0,
          totalSaves: 0,
          byPlatform: { spotify: null, apple_music: null, youtube: null, deezer: null },
          lastUpdated: null,
        };
      }

      // Get latest metrics for each platform
      const { data, error } = await supabase
        .from('release_streaming_metrics')
        .select('*')
        .eq('release_id', releaseId)
        .order('fetched_at', { ascending: false });

      if (error) {
        throw error;
      }



      if (!data || data.length === 0) {
        return {
          totalStreams: 0,
          totalViews: 0,
          totalSaves: 0,
          byPlatform: { spotify: null, apple_music: null, youtube: null, deezer: null },
          lastUpdated: null,
        };
      }

      const metrics = data as unknown as ReleaseMetric[];
      
      // Get latest metric per platform
      const platformMetrics: { [key: string]: ReleaseMetric } = {};
      for (const metric of metrics) {
        if (!platformMetrics[metric.platform]) {
          platformMetrics[metric.platform] = metric;
        }
      }

      const spotify = platformMetrics['spotify'] || null;
      const apple_music = platformMetrics['apple_music'] || null;
      const youtube = platformMetrics['youtube'] || null;
      const deezer = platformMetrics['deezer'] || null;

      const totalStreams = (spotify?.streams || 0) + (apple_music?.streams || 0) + (deezer?.streams || 0);
      const totalViews = youtube?.views || 0;
      const totalSaves = (spotify?.saves || 0) + (apple_music?.saves || 0) + (youtube?.saves || 0) + (deezer?.saves || 0);

      const dates = [spotify?.fetched_at, apple_music?.fetched_at, youtube?.fetched_at, deezer?.fetched_at].filter(Boolean) as string[];
      const lastUpdated = dates.length > 0 ? dates.sort().reverse()[0] : null;

      return {
        totalStreams,
        totalViews,
        totalSaves,
        byPlatform: { spotify, apple_music, youtube, deezer },
        lastUpdated,
      };
    },
    enabled: !!releaseId,
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useFetchReleaseMetrics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      releaseId, 
      trackName, 
      artistName 
    }: { 
      releaseId: string; 
      trackName: string; 
      artistName: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('fetch-release-metrics', {
        body: { releaseId, trackName, artistName },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release-metrics', variables.releaseId] });
      toast({
        title: 'Sucesso',
        description: `Métricas atualizadas de ${data.metrics?.length || 0} plataformas.`,
      });
    },
    onError: (error: Error) => {
      console.error('Error fetching release metrics:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar métricas de streaming.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateManualMetrics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      releaseId, 
      platform,
      streams,
      views,
      saves,
    }: { 
      releaseId: string; 
      platform: string;
      streams?: number;
      views?: number;
      saves?: number;
    }) => {
      const { data, error } = await supabase
        .from('release_streaming_metrics')
        .upsert({
          release_id: releaseId,
          platform,
          streams: streams || 0,
          views: views || 0,
          saves: saves || 0,
          playlist_adds: 0,
          fetched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release-metrics', variables.releaseId] });
      toast({
        title: 'Sucesso',
        description: 'Métricas atualizadas manualmente.',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating metrics:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar métricas.',
        variant: 'destructive',
      });
    },
  });
};