import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreativeIdea {
  id: string;
  artist_id: string | null;
  music_registry_id: string | null;
  release_id: string | null;
  campaign_id: string | null;
  objective: string;
  target_audience: any;
  channel: string | null;
  tone: string | null;
  keywords: string[] | null;
  additional_notes: string | null;
  title: string;
  description: string;
  suggested_channel: string | null;
  content_format: string | null;
  execution_notes: string | null;
  priority: string | null;
  post_frequency: string | null;
  recommended_dates: string[] | null;
  engagement_strategies: string[] | null;
  version: number;
  parent_id: string | null;
  status: string | null;
  is_useful: boolean | null;
  feedback_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateIdeasParams {
  artistId?: string;
  musicId?: string;
  releaseId?: string;
  campaignId?: string;
  objective: string;
  targetAudience?: {
    ageRange?: string;
    gender?: string;
    region?: string;
    musicStyle?: string;
  };
  channel?: string;
  tone?: string;
  keywords?: string[];
  additionalNotes?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fetch creative ideas with filters
export const useCreativeIdeas = (filters?: {
  artistId?: string;
  objective?: string;
  channel?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: ['creative-ideas', filters],
    queryFn: async () => {
      let query = supabase
        .from('creative_ideas')
        .select('*, artists(name, full_name), music_registry(title), releases(title), marketing_campaigns(name)')
        .order('created_at', { ascending: false });

      if (filters?.artistId) {
        query = query.eq('artist_id', filters.artistId);
      }
      if (filters?.objective) {
        query = query.eq('objective', filters.objective);
      }
      if (filters?.channel) {
        query = query.eq('channel', filters.channel);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Fetch learning data from historical feedback
const fetchLearningData = async (artistId?: string, objective?: string) => {
  // Get ideas with positive feedback (is_useful = true) for learning
  let query = supabase
    .from('creative_ideas')
    .select('title, description, suggested_channel, content_format, objective, is_useful')
    .eq('is_useful', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (artistId) {
    query = query.eq('artist_id', artistId);
  }
  if (objective) {
    query = query.eq('objective', objective);
  }

  const { data } = await query;
  
  // Get ideas with negative feedback to avoid
  const { data: badIdeas } = await supabase
    .from('creative_ideas')
    .select('title, description, objective')
    .eq('is_useful', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    successfulIdeas: data || [],
    failedPatterns: badIdeas || [],
  };
};

// Fetch performance history for suggestions
export const usePerformanceHistory = (artistId?: string) => {
  return useQuery({
    queryKey: ['performance-history', artistId],
    queryFn: async () => {
      // Get campaign metrics with good performance
      const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Calculate what worked (high CTR, high conversions)
      const successfulPatterns = campaigns?.filter(c => 
        (c.ctr && c.ctr > 2) || (c.conversions && c.conversions > 10)
      ).map(c => ({
        name: c.name,
        ctr: c.ctr,
        conversions: c.conversions,
        budget: c.budget,
      })) || [];

      // Get ideas that were marked as useful
      let ideasQuery = supabase
        .from('creative_ideas')
        .select('suggested_channel, content_format, objective, tone')
        .eq('is_useful', true);

      if (artistId) {
        ideasQuery = ideasQuery.eq('artist_id', artistId);
      }

      const { data: usefulIdeas } = await ideasQuery;

      // Analyze patterns
      const channelSuccess = usefulIdeas?.reduce((acc: Record<string, number>, idea) => {
        if (idea.suggested_channel) {
          acc[idea.suggested_channel] = (acc[idea.suggested_channel] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      const formatSuccess = usefulIdeas?.reduce((acc: Record<string, number>, idea) => {
        if (idea.content_format) {
          acc[idea.content_format] = (acc[idea.content_format] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      return {
        successfulCampaigns: successfulPatterns,
        bestChannels: Object.entries(channelSuccess).sort((a, b) => b[1] - a[1]).slice(0, 3),
        bestFormats: Object.entries(formatSuccess).sort((a, b) => b[1] - a[1]).slice(0, 3),
        totalUsefulIdeas: usefulIdeas?.length || 0,
      };
    },
    enabled: true,
  });
};

// Generate new ideas using AI with learning
export const useGenerateIdeas = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: GenerateIdeasParams) => {
      // Fetch artist data if provided
      let artistData = null;
      if (params.artistId) {
        const { data } = await supabase
          .from('artists')
          .select('*')
          .eq('id', params.artistId)
          .single();
        artistData = data;
      }

      // Fetch music data if provided
      let musicData = null;
      if (params.musicId) {
        const { data } = await supabase
          .from('music_registry')
          .select('*')
          .eq('id', params.musicId)
          .single();
        musicData = data;
      }

      // Fetch release data if provided
      let releaseData = null;
      if (params.releaseId) {
        const { data } = await supabase
          .from('releases')
          .select('*')
          .eq('id', params.releaseId)
          .single();
        releaseData = data;
      }

      // Fetch campaign data if provided
      let campaignData = null;
      if (params.campaignId) {
        const { data } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .eq('id', params.campaignId)
          .single();
        campaignData = data;
      }

      // Fetch recent metrics
      let metricsData = null;
      if (params.artistId) {
        const { data } = await supabase
          .from('social_media_metrics')
          .select('*')
          .eq('artist_id', params.artistId)
          .order('date', { ascending: false })
          .limit(5);
        if (data && data.length > 0) {
          metricsData = {
            reach: data.reduce((sum, m) => sum + (m.reach || 0), 0),
            engagement: data.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / data.length,
            followers: data[0]?.followers || 0,
          };
        }
      }

      // LEARNING: Fetch historical feedback data
      const learningData = await fetchLearningData(params.artistId, params.objective);

      // Call edge function with learning data
      const { data, error } = await supabase.functions.invoke('generate-creative-ideas', {
        body: {
          type: 'generate-ideas',
          artistData,
          musicData,
          releaseData,
          campaignData,
          objective: params.objective,
          targetAudience: params.targetAudience,
          channel: params.channel,
          tone: params.tone,
          keywords: params.keywords,
          additionalNotes: params.additionalNotes,
          metricsData,
          learningData, // NEW: Pass learning data
        },
      });

      if (error) throw error;
      return data.result;
    },
    onError: (error: any) => {
      console.error('Error generating ideas:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao gerar ideias. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Save idea to database
export const useSaveIdea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (idea: Partial<CreativeIdea>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = {
        ...idea,
        created_by: user?.id,
      };
      
      const { data, error } = await supabase
        .from('creative_ideas')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-ideas'] });
      toast({
        title: 'Sucesso',
        description: 'Ideia salva com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error saving idea:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar ideia.',
        variant: 'destructive',
      });
    },
  });
};

// Update idea
export const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreativeIdea> }) => {
      const { data: updated, error } = await supabase
        .from('creative_ideas')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-ideas'] });
      toast({
        title: 'Sucesso',
        description: 'Ideia atualizada.',
      });
    },
    onError: (error) => {
      console.error('Error updating idea:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar ideia.',
        variant: 'destructive',
      });
    },
  });
};

// Delete idea
export const useDeleteIdea = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creative_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-ideas'] });
      toast({
        title: 'Sucesso',
        description: 'Ideia removida.',
      });
    },
    onError: (error) => {
      console.error('Error deleting idea:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover ideia.',
        variant: 'destructive',
      });
    },
  });
};

// Analyze data with AI
export const useAnalyzeData = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (metricsData: any) => {
      const { data, error } = await supabase.functions.invoke('generate-creative-ideas', {
        body: {
          type: 'analyze-data',
          metricsData,
        },
      });

      if (error) throw error;
      return data.result;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao analisar dados.',
        variant: 'destructive',
      });
    },
  });
};

// Get content suggestions
export const useContentSuggestions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { artistData: any; objective: string; channel?: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-creative-ideas', {
        body: {
          type: 'content-suggestions',
          ...params,
        },
      });

      if (error) throw error;
      return data.result;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao gerar sugestões.',
        variant: 'destructive',
      });
    },
  });
};

// Creative AI Stats
export const useCreativeAIStats = () => {
  return useQuery({
    queryKey: ['creative-ai-stats'],
    queryFn: async () => {
      const { data: ideas, error } = await supabase
        .from('creative_ideas')
        .select('id, status, is_useful, objective, channel, created_at');

      if (error) throw error;

      const total = ideas?.length || 0;
      const saved = ideas?.filter(i => i.status === 'saved').length || 0;
      const useful = ideas?.filter(i => i.is_useful === true).length || 0;
      const notUseful = ideas?.filter(i => i.is_useful === false).length || 0;

      // Ideas by objective
      const byObjective = ideas?.reduce((acc: Record<string, number>, idea) => {
        const obj = idea.objective || 'Outros';
        acc[obj] = (acc[obj] || 0) + 1;
        return acc;
      }, {}) || {};

      // Ideas by channel
      const byChannel = ideas?.reduce((acc: Record<string, number>, idea) => {
        const ch = idea.channel || 'Outros';
        acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {}) || {};

      // Ideas this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const thisMonthCount = ideas?.filter(i => new Date(i.created_at) >= thisMonth).length || 0;

      // Ideas last month
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthCount = ideas?.filter(i => {
        const date = new Date(i.created_at);
        return date >= lastMonth && date < thisMonth;
      }).length || 0;

      const growthPercent = lastMonthCount > 0 
        ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 
        : thisMonthCount > 0 ? 100 : 0;

      return {
        total,
        saved,
        useful,
        notUseful,
        usefulRate: total > 0 ? Math.round((useful / (useful + notUseful || 1)) * 100) : 0,
        byObjective,
        byChannel,
        thisMonthCount,
        lastMonthCount,
        growthPercent: Math.round(growthPercent),
      };
    },
  });
};
