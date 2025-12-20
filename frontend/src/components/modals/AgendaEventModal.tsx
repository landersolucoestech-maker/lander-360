import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AgendaEventForm } from '@/components/forms/AgendaEventForm';
import { useArtists } from '@/hooks/useArtists';

interface AgendaEvent {
  id: string;
  event_name: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  venue_name?: string;
  venue_address?: string;
  venue_contact?: string;
  venue_capacity?: number;
  ticket_price?: number;
  expected_audience?: number;
  event_type: 'sessoes_estudio' | 'ensaios' | 'sessoes_fotos' | 'shows' | 'entrevistas' | 'podcasts' | 'programas_tv' | 'radio' | 'producao_conteudo' | 'reunioes';
  status: 'agendado' | 'cancelado' | 'pendente' | 'concluido' | 'confirmado';
  artist_id?: string;
  description?: string;
  observations?: string;
}

interface AgendaEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: AgendaEvent;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const AgendaEventModal: React.FC<AgendaEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onSubmit,
  isLoading = false
}) => {
  const { data: artists = [] } = useArtists();
  const isEditing = !!event;

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const initialData = event ? {
    event_name: event.event_name,
    start_date: event.start_date ? new Date(event.start_date) : undefined,
    start_time: event.start_time || '',
    end_date: event.end_date ? new Date(event.end_date) : undefined,
    end_time: event.end_time || '',
    location: event.location || '',
    venue_name: event.venue_name || '',
    venue_address: event.venue_address || '',
    venue_contact: event.venue_contact || '',
    venue_capacity: event.venue_capacity || undefined,
    ticket_price: event.ticket_price || undefined,
    expected_audience: event.expected_audience || undefined,
    event_type: event.event_type,
    status: event.status,
    artist_id: event.artist_id || undefined,
    description: event.description || '',
    observations: event.observations || '',
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {isEditing ? 'Editar Evento' : 'Novo Evento na Agenda'}
          </DialogTitle>
        </DialogHeader>
        
        <AgendaEventForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          isLoading={isLoading}
          artists={artists.map(artist => ({
            id: artist.id,
            name: artist.name
          }))}
        />
      </DialogContent>
    </Dialog>
  );
};