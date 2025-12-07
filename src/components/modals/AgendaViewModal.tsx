import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDateFullBR } from "@/lib/utils";
import { MapPin, Clock, Calendar } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Evento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Principais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Principais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-muted-foreground">Nome do Evento</label>
                <p className="font-medium text-lg">{event.event_name}</p>
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
                    {statusLabels[event.status] || event.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Data e Horário */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Data e Horário</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Data
                </label>
                <p className="font-medium">
                  {formatDateFullBR(event.start_date)}
                </p>
              </div>
              {event.start_time && (
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Horário
                  </label>
                  <p className="font-medium">
                    {event.start_time}
                    {event.end_time && ` - ${event.end_time}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Local */}
          {event.location && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Local</h3>
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Endereço
                </label>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          )}

          {/* Descrição */}
          {event.description && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Descrição</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Observações */}
          {event.observations && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Observações</h3>
              <p className="text-muted-foreground">{event.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
