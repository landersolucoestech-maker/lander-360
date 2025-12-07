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
  Calendar
} from "lucide-react";
import { formatDateBR } from "@/lib/utils";

interface ContactProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: any;
}

const statusLabels: Record<string, string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
  negociacao: "Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export function ContactProfileModal({
  open,
  onOpenChange,
  contact,
}: ContactProfileModalProps) {
  if (!contact) return null;

  const formatContactType = (type: string) => {
    return type?.replace(/_/g, ' ') || 'N/A';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Contato</DialogTitle>
          <DialogDescription>
            Informações detalhadas do contato
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e info básica */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="/placeholder.svg" alt={contact.name} />
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
                  {statusLabels[contact.status] || contact.status}
                </Badge>
              )}
              {contact.priority && (
                <Badge 
                  variant={
                    contact.priority === "alta" ? "destructive" : 
                    contact.priority === "media" ? "outline" : "secondary"
                  }
                >
                  {priorityLabels[contact.priority] || contact.priority}
                </Badge>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-lg text-muted-foreground capitalize">{formatContactType(contact.contact_type)}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.phone}</span>
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
                    <span className="text-sm">{contact.position}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de Endereço */}
          {(contact.address || contact.city || contact.state || contact.zip_code) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {contact.address && (
                    <div>
                      <span className="text-muted-foreground">Endereço: </span>
                      <span>{contact.address}</span>
                    </div>
                  )}
                  {contact.city && (
                    <div>
                      <span className="text-muted-foreground">Cidade: </span>
                      <span>{contact.city}</span>
                    </div>
                  )}
                  {contact.state && (
                    <div>
                      <span className="text-muted-foreground">Estado: </span>
                      <span>{contact.state}</span>
                    </div>
                  )}
                  {contact.zip_code && (
                    <div>
                      <span className="text-muted-foreground">CEP: </span>
                      <span>{contact.zip_code}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Informações Adicionais */}
          {(contact.document || contact.next_action) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Adicionais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {contact.document && (
                    <div>
                      <span className="text-muted-foreground">CPF/CNPJ: </span>
                      <span>{contact.document}</span>
                    </div>
                  )}
                  {contact.next_action && (
                    <div>
                      <span className="text-muted-foreground">Próxima Ação: </span>
                      <span>{contact.next_action}</span>
                    </div>
                  )}
                </div>
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
            <div className="space-y-3">
              <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Ligação realizada</h4>
                      <p className="text-sm text-muted-foreground">Discussão sobre nova parceria</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateBR(new Date().toISOString())}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Duração: 25 min</div>
                </div>
              </div>

              <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Email enviado</h4>
                      <p className="text-sm text-muted-foreground">Proposta de contrato enviada</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateBR(new Date().toISOString())}
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">Lido</Badge>
                </div>
              </div>

              <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">Reunião presencial</h4>
                      <p className="text-sm text-muted-foreground">Reunião no escritório para alinhamento</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateBR(new Date().toISOString())}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Duração: 1h 30min</div>
                </div>
              </div>
            </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
