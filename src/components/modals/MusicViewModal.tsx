import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, User, Clock, Users, FileText, Languages } from "lucide-react";

interface MusicViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: any;
}

export function MusicViewModal({ open, onOpenChange, song }: MusicViewModalProps) {
  if (!song) return null;

  // Format duration from seconds to MM:SS
  const formatDuration = (durationInSeconds: number | null | undefined) => {
    if (!durationInSeconds || durationInSeconds <= 0) return "Não informado";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get writers (compositores/autores)
  const composers = song.writers || song.composers || [];
  // Get publishers (editores)
  const editors = song.publishers || [];
  // Check if there are any credits to show
  const hasComposers = composers.length > 0;
  const hasEditors = editors.length > 0;
  const hasCredits = hasComposers || hasEditors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
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
                  {song.artist || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duração</label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(song.duration)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <Badge variant="secondary">{song.genre || "Não informado"}</Badge>
              </div>
            </div>
          </div>

          {/* Códigos de Registro - Only ISWC */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Códigos de Registro</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">ISWC (International Standard Musical Work Code)</label>
                <p className="font-mono text-lg">{song.iswc || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Créditos - Compositores/Autor, Editor, Tradutor */}
          {hasCredits && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Créditos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Compositores/Autor */}
                {hasComposers && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Compositores/Autor
                    </label>
                    <ul className="space-y-1">
                      {composers.map((composer: any, index: number) => (
                        <li key={index} className="text-sm">
                          {typeof composer === 'string' ? composer : composer.name}
                          {composer.percentage && <span className="text-muted-foreground ml-1">({composer.percentage}%)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Editor */}
                {hasEditors && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      Editor
                    </label>
                    <ul className="space-y-1">
                      {editors.map((editor: any, index: number) => (
                        <li key={index} className="text-sm">
                          {typeof editor === 'string' ? editor : editor.name}
                          {editor.percentage && <span className="text-muted-foreground ml-1">({editor.percentage}%)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status e Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status do Registro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Atual</label>
                <div className="mt-1">
                  <Badge 
                    className={
                      (song.statusDisplay === "Aceita" || song.statusDisplay === "Aprovada") ? "bg-blue-600 text-white text-sm" : 
                      song.statusDisplay === "Recusada" ? "bg-red-600 text-white text-sm" : 
                      "bg-yellow-500 text-black text-sm"
                    }
                  >
                    {song.statusDisplay || song.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Registro</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {song.registrationDate || "Não informado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
