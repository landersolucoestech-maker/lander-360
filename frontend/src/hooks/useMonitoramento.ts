import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonitoramentoService, RadioTvDetection, EcadReport, EcadDivergence } from '@/services/monitoramento';
import { useToast } from '@/hooks/use-toast';

// Query keys
export const monitoramentoQueryKeys = {
  all: ['monitoramento'] as const,
  detections: () => [...monitoramentoQueryKeys.all, 'detections'] as const,
  detectionsToday: () => [...monitoramentoQueryKeys.all, 'detections', 'today'] as const,
  ecadReports: () => [...monitoramentoQueryKeys.all, 'ecad-reports'] as const,
  ecadReportItems: (reportId: string) => [...monitoramentoQueryKeys.all, 'ecad-report-items', reportId] as const,
  divergences: () => [...monitoramentoQueryKeys.all, 'divergences'] as const,
  stats: () => [...monitoramentoQueryKeys.all, 'stats'] as const,
};

// Get all detections
export const useDetections = () => {
  return useQuery({
    queryKey: monitoramentoQueryKeys.detections(),
    queryFn: MonitoramentoService.getDetections,
  });
};

// Get today's detections
export const useTodayDetections = () => {
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: monitoramentoQueryKeys.detectionsToday(),
    queryFn: () => MonitoramentoService.getDetectionsByDate(today),
    refetchInterval: 60000, // Refetch every minute
  });
};

// Get detection stats
export const useDetectionStats = () => {
  return useQuery({
    queryKey: monitoramentoQueryKeys.stats(),
    queryFn: MonitoramentoService.getDetectionStats,
    refetchInterval: 60000,
  });
};

// Get ECAD reports
export const useEcadReports = () => {
  return useQuery({
    queryKey: monitoramentoQueryKeys.ecadReports(),
    queryFn: MonitoramentoService.getEcadReports,
  });
};

// Get ECAD report items
export const useEcadReportItems = (reportId: string) => {
  return useQuery({
    queryKey: monitoramentoQueryKeys.ecadReportItems(reportId),
    queryFn: () => MonitoramentoService.getEcadReportItems(reportId),
    enabled: !!reportId,
  });
};

// Get divergences
export const useDivergences = () => {
  return useQuery({
    queryKey: monitoramentoQueryKeys.divergences(),
    queryFn: MonitoramentoService.getDivergences,
  });
};

// Get open divergences
export const useOpenDivergences = () => {
  return useQuery({
    queryKey: [...monitoramentoQueryKeys.divergences(), 'open'],
    queryFn: MonitoramentoService.getOpenDivergences,
  });
};

// Create detection mutation
export const useCreateDetection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<RadioTvDetection>) => MonitoramentoService.createDetection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.detections() });
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.stats() });
      toast({
        title: 'Sucesso',
        description: 'Detecção registrada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating detection:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar detecção.',
        variant: 'destructive',
      });
    },
  });
};

// Update detection mutation
export const useUpdateDetection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RadioTvDetection> }) =>
      MonitoramentoService.updateDetection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.detections() });
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.stats() });
      toast({
        title: 'Sucesso',
        description: 'Detecção atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating detection:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar detecção.',
        variant: 'destructive',
      });
    },
  });
};

// Delete detection mutation
export const useDeleteDetection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => MonitoramentoService.deleteDetection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.detections() });
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.stats() });
      toast({
        title: 'Sucesso',
        description: 'Detecção removida com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting detection:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover detecção.',
        variant: 'destructive',
      });
    },
  });
};

// Create ECAD report mutation
export const useCreateEcadReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<EcadReport>) => MonitoramentoService.createEcadReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.ecadReports() });
      toast({
        title: 'Sucesso',
        description: 'Relatório ECAD importado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating ECAD report:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao importar relatório ECAD.',
        variant: 'destructive',
      });
    },
  });
};

// Update divergence mutation
export const useUpdateDivergence = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EcadDivergence> }) =>
      MonitoramentoService.updateDivergence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monitoramentoQueryKeys.divergences() });
      toast({
        title: 'Sucesso',
        description: 'Divergência atualizada com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating divergence:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar divergência.',
        variant: 'destructive',
      });
    },
  });
};
