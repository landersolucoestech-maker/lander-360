import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateFullBR } from "@/lib/utils";
import { MapPin, Clock, Calendar, Users, DollarSign, Building, Phone, Music } from "lucide-react";

interface AgendaViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function AgendaViewModal({ open, onOpenChange, event }: AgendaViewModalProps) {
  if (!event) return null;

  const eventTypeLabels: Record<string, string> = {
    sessoes_estudio: 'Sessões de estúdio',
    ensaios: 'Ensaios',
    sessoes_fotos: 'Sessões de fotos',
    shows: 'Shows',
    entrevistas: 'Entrevistas',
    podcasts: 'Podcasts',
    programas_tv: 'Programas de TV',
    radio: 'Rádio',
    producao_conteudo: 'Produção de conteúdo',
    reunioes: 'Reuniões'
  };

  const statusLabels: Record<string, string> = {
    agendado: 'Agendado',
    cancelado: 'Cancelado',
    pendente: 'Pendente',
    concluido: 'Concluído',
    confirmado: 'Confirmado'
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes do Evento</DialogTitle>
          <DialogDescription className="text-sm">Visualize todas as informações do evento</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Principais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-muted-foreground">Nome do Evento</label>
                <p className="font-medium text-lg">{event.title || event.event_name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tipo</label>
                <p className="font-medium">
                  <Badge variant="secondary">
                    {eventTypeLabels[event.event_type] || event.event_type}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p className="font-medium">
                  <Badge 
                    variant={
                      event.status === "confirmado" ? "default" : 
                      event.status === "cancelado" ? "destructive" : "secondary"
                    }
                  >
                    {statusLabels[event.status] || event.status || 'Agendado'}
                  </Badge>
                </p>
              </div>
              {(event.artists || event.artist_name) && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Music className="h-4 w-4" /> Artista
                  </label>
                  <p className="font-medium">
                    {event.artists?.name || event.artists?.name || event.artist_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Data e Horário */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Data e Horário</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Data de Início
                </label>
                <p className="font-medium">
                  {formatDateFullBR(event.start_date)}
                </p>
              </div>
              {event.end_date && (
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Data de Fim
                  </label>
                  <p className="font-medium">
                    {formatDateFullBR(event.end_date)}
                  </p>
                </div>
              )}
              {event.start_time && (
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Horário de Início
                  </label>
                  <p className="font-medium">{event.start_time}</p>
                </div>
              )}
              {event.end_time && (
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Horário de Fim
                  </label>
                  <p className="font-medium">{event.end_time}</p>
                </div>
              )}
            </div>
          </div>

          {/* Local */}
          {(event.location || event.venue_name || event.venue_address) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Local</h3>
              <div className="grid grid-cols-2 gap-4">
                {event.location && (
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Local
                    </label>
                    <p className="font-medium">{event.location}</p>
                  </div>
                )}
                {event.venue_name && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building className="h-4 w-4" /> Nome do Local
                    </label>
                    <p className="font-medium">{event.venue_name}</p>
                  </div>
                )}
                {event.venue_contact && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-4 w-4" /> Contato
                    </label>
                    <p className="font-medium">{event.venue_contact}</p>
                  </div>
                )}
                {event.venue_address && (
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Endereço Completo
                    </label>
                    <p className="font-medium">{event.venue_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações do Show */}
          {(event.venue_capacity || event.ticket_price || event.expected_audience) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Informações do Evento</h3>
              <div className="grid grid-cols-3 gap-4">
                {event.venue_capacity && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> Capacidade
                    </label>
                    <p className="font-medium">{event.venue_capacity.toLocaleString('pt-BR')} pessoas</p>
                  </div>
                )}
                {event.expected_audience && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" /> Público Esperado
                    </label>
                    <p className="font-medium">{event.expected_audience.toLocaleString('pt-BR')} pessoas</p>
                  </div>
                )}
                {event.ticket_price && (
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Cachê
                    </label>
                    <p className="font-medium">{formatCurrency(event.ticket_price)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição */}
          {event.description && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Observações */}
          {event.observations && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Observações</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}