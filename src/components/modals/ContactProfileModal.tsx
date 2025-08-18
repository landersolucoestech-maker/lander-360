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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building,
  User,
  Clock,
  MessageSquare,
  FileText,
  Target
} from "lucide-react";

interface ContactProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: any;
}

export function ContactProfileModal({
  open,
  onOpenChange,
  contact,
}: ContactProfileModalProps) {
  if (!contact) return null;

  const interactions = [
    {
      id: 1,
      type: "call",
      title: "Ligação realizada",
      description: "Discussão sobre nova parceria musical",
      date: "2024-01-15",
      duration: "25 min"
    },
    {
      id: 2,
      type: "email",
      title: "Email enviado",
      description: "Proposta de contrato enviada",
      date: "2024-01-12",
      status: "Lido"
    },
    {
      id: 3,
      type: "meeting",
      title: "Reunião presencial",
      description: "Reunião no escritório para alinhamento",
      date: "2024-01-08",
      duration: "1h 30min"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                  {contact.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="mb-2">{contact.status}</Badge>
              <Badge variant={contact.priority === "Alta" ? "destructive" : contact.priority === "Média" ? "warning" : "secondary"}>
                {contact.priority}
              </Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-lg text-muted-foreground">{contact.type}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Indie Records</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Último Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{contact.lastContact}</div>
                <div className="text-sm text-muted-foreground">há 3 dias</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Próxima Ação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{contact.nextAction}</div>
                <div className="text-sm text-muted-foreground">em 2 dias</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Interações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">12</div>
                <div className="text-sm text-muted-foreground">este mês</div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Histórico de Interações */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Histórico de Interações</h3>
            <div className="space-y-3">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      {interaction.type === "call" && <Phone className="h-4 w-4 text-primary" />}
                      {interaction.type === "email" && <Mail className="h-4 w-4 text-primary" />}
                      {interaction.type === "meeting" && <User className="h-4 w-4 text-primary" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{interaction.title}</h4>
                        <p className="text-sm text-muted-foreground">{interaction.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(interaction.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    {interaction.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Duração: {interaction.duration}
                      </div>
                    )}
                    
                    {interaction.status && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {interaction.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="flex gap-3">
            <Button className="gap-2">
              <Phone className="h-4 w-4" />
              Ligar
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Enviar Email
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Agendar Reunião
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Ver Contratos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}