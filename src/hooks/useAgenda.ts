import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgendaService } from '@/services/agenda';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type AgendaEventInsert = Database['public']['Tables']['agenda_events']['Insert'];
type AgendaEventUpdate = Database['public']['Tables']['agenda_events']['Update'];

// Query keys
export const agendaQueryKeys = {
  all: ['agenda'] as const,
  lists: () => [...agendaQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...agendaQueryKeys.lists(), { filters }] as const,
  details: () => [...agendaQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...agendaQueryKeys.details(), id] as const,
  upcoming: () => [...agendaQueryKeys.all, 'upcoming'] as const,
};

// Get all agenda events
export const useAgenda = () => {
  return useQuery({
    queryKey: agendaQueryKeys.lists(),
    queryFn: AgendaService.getAll,
  });
};

// Get agenda event by ID
export const useAgendaEvent = (id: string) => {
  return useQuery({
    queryKey: agendaQueryKeys.detail(id),
    queryFn: () => AgendaService.getById(id),
    enabled: !!id,
  });
};

// Get upcoming events
export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: agendaQueryKeys.upcoming(),
    queryFn: AgendaService.getUpcoming,
  });
};

// Get events by date range
export const useEventsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: agendaQueryKeys.list({ startDate, endDate }),
    queryFn: () => AgendaService.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

// Get events by artist
export const useEventsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: agendaQueryKeys.list({ artistId }),
    queryFn: () => AgendaService.getByArtist(artistId),
    enabled: !!artistId,
  });
};

// Get events by project
export const useEventsByProject = (projectId: string) => {
  return useQuery({
    queryKey: agendaQueryKeys.list({ projectId }),
    queryFn: () => AgendaService.getByProject(projectId),
    enabled: !!projectId,
  });
};

// Create agenda event mutation
export const useCreateAgendaEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: AgendaEventInsert) => AgendaService.create(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.upcoming() });
      toast({
        title: 'Sucesso',
        description: `Evento "${newEvent.title}" criado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error creating agenda event:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar evento na agenda. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Update agenda event mutation
export const useUpdateAgendaEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgendaEventUpdate }) =>
      AgendaService.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.detail(updatedEvent.id) });
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.upcoming() });
      toast({
        title: 'Sucesso',
        description: `Evento "${updatedEvent.title}" atualizado com sucesso.`,
      });
    },
    onError: (error) => {
      console.error('Error updating agenda event:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar evento na agenda. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};

// Delete agenda event mutation
export const useDeleteAgendaEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => AgendaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.upcoming() });
      toast({
        title: 'Sucesso',
        description: 'Evento removido da agenda com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting agenda event:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover evento da agenda. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};