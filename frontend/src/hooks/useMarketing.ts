import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Marketing Tasks
export const useMarketingTasks = () => {
  return useQuery({
    queryKey: ['marketing-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMarketingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: any) => {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-tasks'] });
    },
  });
};

// Marketing Campaigns
export const useMarketingCampaigns = () => {
  return useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Marketing Briefings
export const useMarketingBriefings = () => {
  return useQuery({
    queryKey: ['marketing-briefings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_briefings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMarketingBriefing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (briefing: any) => {
      const { data, error } = await supabase
        .from('marketing_briefings')
        .insert(briefing)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-briefings'] });
    },
  });
};

// Social Media Metrics
export const useSocialMediaMetrics = () => {
  return useQuery({
    queryKey: ['social-media-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(4); // Get latest metrics for each platform
      
      if (error) throw error;
      return data;
    },
  });
};

// Dashboard Statistics
export const useMarketingStats = () => {
  return useQuery({
    queryKey: ['marketing-stats'],
    queryFn: async () => {
      const [tasksResult, briefingsResult, campaignsResult] = await Promise.all([
        supabase.from('marketing_tasks').select('status, priority'),
        supabase.from('marketing_briefings').select('status'),
        supabase.from('marketing_campaigns').select('roas, reach')
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (briefingsResult.error) throw briefingsResult.error;
      if (campaignsResult.error) throw campaignsResult.error;

      const tasks = tasksResult.data || [];
      const briefings = briefingsResult.data || [];
      const campaigns = campaignsResult.data || [];

      return {
        tasks: {
          pending: tasks.filter(t => t.status === 'Pendente').length,
          inProgress: tasks.filter(t => t.status === 'Em Andamento').length,
          completed: tasks.filter(t => t.status === 'Concluída').length,
          overdue: tasks.filter(t => t.status === 'Atrasada').length,
          total: tasks.length
        },
        briefings: {
          active: briefings.filter(b => b.status === 'Em Revisão').length,
          pending: briefings.filter(b => b.status === 'Pendente').length,
          approved: briefings.filter(b => b.status === 'Aprovado').length,
          total: briefings.length
        },
        campaigns: {
          totalReach: campaigns.reduce((sum, c) => sum + (c.reach || 0), 0),
          averageRoas: campaigns.length > 0 
            ? campaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / campaigns.length 
            : 0,
          total: campaigns.length
        }
      };
    },
  });
};