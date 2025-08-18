import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, User, Clock, Hash } from "lucide-react";

interface MusicViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: any;
}

export function MusicViewModal({ open, onOpenChange, song }: MusicViewModalProps) {
  if (!song) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Detalhes da Música
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título</label>
                <p className="text-lg font-semibold">{song.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Artista</label>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {song.artist}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duração</label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {song.duration}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <Badge variant="secondary">{song.genre}</Badge>
              </div>
            </div>
          </div>

          {/* Códigos de Registro */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Códigos de Registro</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">ISRC (International Standard Recording Code)</label>
                <p className="font-mono text-lg">{song.isrc}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">ISWC (International Standard Musical Work Code)</label>
                <p className="font-mono text-lg">{song.iswc}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Código ECAD</label>
                <p className="font-mono text-lg">{song.ecad}</p>
              </div>
            </div>
          </div>

          {/* Status e Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status do Registro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Atual</label>
                <div className="mt-1">
                  <Badge 
                    variant={song.status === "Registrado" ? "default" : song.status === "Pendente" ? "secondary" : "destructive"}
                    className="text-sm"
                  >
                    {song.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Registro</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(song.registrationDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}