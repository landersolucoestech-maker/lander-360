import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  User,
  FileText,
  Briefcase,
  Clock,
  Calendar,
  Music
} from "lucide-react";
import { formatDateBR, translateStatus, translatePriority } from "@/lib/utils";

interface ContactProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: any;
  onEdit?: (contact: any) => void;
}

export function ContactProfileModal({
  open,
  onOpenChange,
  contact,
  onEdit,
}: ContactProfileModalProps) {
  if (!contact) return null;

  const formatContactType = (type: string) => {
    return type?.replace(/_/g, ' ') || 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Perfil do Contato</DialogTitle>
          <DialogDescription className="text-sm">
            Informações detalhadas do contato
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e info básica */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={contact.image_url || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback className="text-xl">
                  {contact.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              {contact.status && (
                <Badge 
                  variant={
                    contact.status === "quente" ? "destructive" :
                    contact.status === "negociacao" ? "outline" : "secondary"
                  }
                  className="mb-2"
                >
                  {translateStatus(contact.status)}
                </Badge>
              )}
              {contact.priority && (
                <Badge 
                  variant={
                    contact.priority === "alta" ? "destructive" : 
                    contact.priority === "media" ? "outline" : "secondary"
                  }
                >
                  {translatePriority(contact.priority)}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-lg text-muted-foreground capitalize">{formatContactType(contact.contact_type)}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.company}</span>
                  </div>
                )}
                {contact.position && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.position?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                )}
                {contact.artist_name && (
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Artista: {contact.artist_name}</span>
                  </div>
                )}
                {contact.document && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.document}</span>
                  </div>
                )}
                {(contact.address || contact.city || contact.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[contact.address, contact.city, contact.state].filter(Boolean).join(', ')}
                      {contact.zip_code && ` - ${contact.zip_code}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Próxima Ação */}
          {contact.next_action && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próxima Ação
                </h3>
                <p className="text-sm">{contact.next_action}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Observações */}
          {contact.notes && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Histórico de Interações */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Interações
            </h3>
            {contact.interactions && contact.interactions.length > 0 ? (
              <div className="space-y-3">
                {contact.interactions.map((interaction: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {interaction.type?.replace(/_/g, ' ') || 'Nota'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {interaction.date ? formatDateBR(interaction.date) : 'Sem data'}
                      </span>
                    </div>
                    <p className="text-sm">{interaction.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma interação registrada ainda.</p>
                <p className="text-sm mt-1">As interações com este contato aparecerão aqui.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex gap-3 flex-wrap">
            {contact.phone && (
              <Button className="gap-2" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              </Button>
            )}
            {contact.email && (
              <Button variant="outline" className="gap-2" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="h-4 w-4" />
                  Enviar Email
                </a>
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" className="gap-2" onClick={() => onEdit(contact)}>
                <User className="h-4 w-4" />
                Atualizar Cadastro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
