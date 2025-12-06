import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Music, 
  FileText, 
  Users,
  Trophy,
  Info
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico - {artist.name}</DialogTitle>
          <DialogDescription>
            Histórico de atividades e marcos do artista
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
                  <div className="text-xl font-bold">{artist.stats?.lancamentos || 0}</div>
                  <div className="text-sm text-muted-foreground">Lançamentos</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Shows</div>
                </div>
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Contratos</div>
                </div>
                <div className="text-center">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Prêmios</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data de Cadastro:</span>
                  <span>{formatDate(artist.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Última Atualização:</span>
                  <span>{formatDate(artist.updated_at)}</span>
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
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Info className="h-12 w-12 mb-4" />
                <p className="text-center">Nenhuma atividade registrada ainda.</p>
                <p className="text-sm text-center mt-2">
                  As atividades do artista aparecerão aqui conforme forem registradas no sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
