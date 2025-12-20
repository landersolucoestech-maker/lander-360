import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgendaService } from '@/services/agenda';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Query keys
export const agendaQueryKeys = {
  all: ['agenda'] as const,
  lists: () => [...agendaQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...agendaQueryKeys.lists(), { filters }] as const,
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

// Helper to send WhatsApp notification for new event
const sendEventNotification = async (event: any, artistId: string) => {
  try {
    // Fetch artist data with manager and label info
    const { data: artist } = await supabase
      .from('artists')
      .select('name, stage_name, phone, email, manager_name, manager_phone, manager_email, record_label_name, label_contact_name, label_contact_phone, label_contact_email')
      .eq('id', artistId)
      .single();

    if (!artist) {
      console.log('Artist not found, skipping notification');
      return;
    }

    const eventDate = format(new Date(event.start_date), "dd/MM/yyyy", { locale: ptBR });
    const eventTime = event.start_time || 'Horário a definir';
    const artistName = artist.stage_name || artist.name;

    const notificationPromises: Promise<any>[] = [];

    const baseMessage = (recipientType: string) => `🎵 Lander 360º - Novo Evento\n\n` +
      `Artista: ${artistName}\n` +
      `Evento: ${event.title}\n` +
      `Data: ${eventDate}\n` +
      `Horário: ${eventTime}\n` +
      (event.location ? `Local: ${event.location}\n` : '') +
      `\nAcesse a plataforma para mais detalhes.`;

    // 1. Notify Artist
    if (artist.phone || artist.email) {
      notificationPromises.push(
        NotificationService.notifyArtistAboutEvent(
          artist.phone || '',
          artist.email || '',
          event.title,
          eventDate,
          eventTime,
          event.location
        )
      );
      console.log('Notification queued for artist:', artistName);
    }

    // 2. Notify Manager/Empresário
    if (artist.manager_phone || artist.manager_email) {
      const managerMessage = baseMessage('manager');

      if (artist.manager_phone) {
        notificationPromises.push(
          NotificationService.sendWhatsApp(artist.manager_phone, managerMessage)
        );
        console.log('Notification queued for manager:', artist.manager_name);
      }
      if (artist.manager_email) {
        notificationPromises.push(
          NotificationService.sendEmail(
            artist.manager_email,
            `Novo Evento: ${event.title} - ${artistName}`,
            managerMessage.replace(/\n/g, '<br>')
          )
        );
      }
    }

    // 3. Notify Record Label/Gravadora
    if (artist.label_contact_phone || artist.label_contact_email) {
      const labelMessage = `🎵 Lander 360º - Novo Evento (${artist.record_label_name || 'Gravadora'})\n\n` +
        `Artista: ${artistName}\n` +
        `Evento: ${event.title}\n` +
        `Data: ${eventDate}\n` +
        `Horário: ${eventTime}\n` +
        (event.location ? `Local: ${event.location}\n` : '') +
        `\nAcesse a plataforma para mais detalhes.`;

      if (artist.label_contact_phone) {
        notificationPromises.push(
          NotificationService.sendWhatsApp(artist.label_contact_phone, labelMessage)
        );
        console.log('Notification queued for label:', artist.record_label_name);
      }
      if (artist.label_contact_email) {
        notificationPromises.push(
          NotificationService.sendEmail(
            artist.label_contact_email,
            `Novo Evento: ${event.title} - ${artistName}`,
            labelMessage.replace(/\n/g, '<br>')
          )
        );
      }
    }

    // Execute all notifications in parallel
    await Promise.allSettled(notificationPromises);
    console.log('All notifications sent for event:', event.title);
  } catch (error) {
    console.error('Error sending event notification:', error);
  }
};

// Create agenda event mutation
export const useCreateAgendaEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { title: string; start_date: string; description?: string; location?: string; event_type?: string; artist_id?: string; start_time?: string }) => AgendaService.create(data),
    onSuccess: async (newEvent, variables) => {
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agendaQueryKeys.upcoming() });
      
      // Send WhatsApp/Email notification if artist is linked
      if (variables.artist_id) {
        await sendEventNotification(newEvent, variables.artist_id);
        toast({
          title: 'Evento criado',
          description: `Evento "${newEvent.title}" criado e notificação enviada ao artista.`,
        });
      } else {
        toast({
          title: 'Sucesso',
          description: `Evento "${newEvent.title}" criado com sucesso.`,
        });
      }
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
    mutationFn: ({ id, data }: { id: string; data: Partial<{ title: string; start_date: string; description?: string; location?: string; event_type?: string; artist_id?: string }> }) =>
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