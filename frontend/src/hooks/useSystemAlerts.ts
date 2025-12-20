import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  entity_name?: string;
  days_until_due?: number;
  is_read: boolean;
  is_dismissed: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const systemAlertsQueryKeys = {
  all: ['system-alerts'] as const,
  active: () => [...systemAlertsQueryKeys.all, 'active'] as const,
  byType: (type: string) => [...systemAlertsQueryKeys.all, 'type', type] as const,
  unread: () => [...systemAlertsQueryKeys.all, 'unread'] as const,
};

// Get all active (non-dismissed) alerts
export const useSystemAlerts = () => {
  return useQuery({
    queryKey: systemAlertsQueryKeys.active(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .is('resolved_at', null)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemAlert[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Get unread alerts count
export const useUnreadAlertsCount = () => {
  return useQuery({
    queryKey: systemAlertsQueryKeys.unread(),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('system_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_dismissed', false)
        .is('resolved_at', null);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Get alerts by type
export const useAlertsByType = (alertType: string) => {
  return useQuery({
    queryKey: systemAlertsQueryKeys.byType(alertType),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('alert_type', alertType)
        .eq('is_dismissed', false)
        .is('resolved_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemAlert[];
    },
  });
};

// Mark alert as read
export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('system_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAlertsQueryKeys.all });
    },
  });
};

// Dismiss alert
export const useDismissAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('system_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAlertsQueryKeys.all });
      toast({
        title: 'Alerta descartado',
        description: 'O alerta foi removido da lista.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Resolve alert
export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('system_alerts')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAlertsQueryKeys.all });
      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Trigger automation processing manually
export const useProcessAutomations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-automations');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemAlertsQueryKeys.all });
      toast({
        title: 'Automações processadas',
        description: `${data.alerts_generated} alertas gerados, ${data.notifications_sent} notificações enviadas.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao processar automações',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
