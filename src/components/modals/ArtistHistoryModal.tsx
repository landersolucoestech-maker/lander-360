import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Music, 
  FileText, 
  DollarSign, 
  Mic,
  Upload,
  Users,
  Trophy
} from "lucide-react";

interface ArtistHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function ArtistHistoryModal({
  open,
  onOpenChange,
  artist,
}: ArtistHistoryModalProps) {
  if (!artist) return null;

  const historyItems: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
      case "Concluído":
      case "Realizado":
      case "Aprovado":
        return "success";
      case "Pendente":
        return "warning";
      case "Indicado":
        return "info";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contract": return FileText;
      case "release": return Music;
      case "recording": return Mic;
      case "upload": return Upload;
      case "show": return Users;
      case "award": return Trophy;
      default: return Calendar;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico - {artist.name}</DialogTitle>
          <DialogDescription>
            Histórico completo de atividades e marcos do artista
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">Lançamentos</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Shows</div>
                </div>
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Contratos</div>
                </div>
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">2</div>
                  <div className="text-sm text-muted-foreground">Prêmios</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Atividades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historyItems.map((item, index) => {
                  const IconComponent = getTypeIcon(item.type);
                  return (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge variant={getStatusColor(item.status) as any}>
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </div>
                          
                          {item.amount && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {item.amount}
                            </div>
                          )}
                          
                          {item.streams && (
                            <div className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {item.streams} streams
                            </div>
                          )}
                          
                          {item.audience && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.audience}
                            </div>
                          )}
                          
                          {item.duration && (
                            <div className="flex items-center gap-1">
                              <Mic className="h-3 w-3" />
                              {item.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}