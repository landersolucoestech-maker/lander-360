import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PlayCircle, 
  Music,
  Mic2,
  Headphones,
  FileText,
  Globe,
  User,
  FileAudio,
  Clock,
  Calendar
} from "lucide-react";
import { formatDateTimeBR } from "@/lib/utils";
import { useArtists } from "@/hooks/useArtists";

interface ProjectViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
}

export function ProjectViewModal({
  open,
  onOpenChange,
  project,
}: ProjectViewModalProps) {
  const { data: artists = [] } = useArtists();

  if (!project) return null;

  // Parse audio_files to get full project details
  const getProjectDetails = () => {
    try {
      if (project.audio_files && typeof project.audio_files === 'string') {
        return JSON.parse(project.audio_files);
      }
      if (project.audio_files && typeof project.audio_files === 'object') {
        return project.audio_files;
      }
    } catch (e) {
      console.error('Error parsing audio_files:', e);
    }
    return null;
  };

  const details = getProjectDetails();
  const artist = artists.find(a => a.id === project.artist_id);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "draft": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getReleaseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: "Single",
      ep: "EP",
      album: "Álbum"
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Detalhes do Projeto</DialogTitle>
          <DialogDescription className="text-sm">
            Informações completas do projeto musical
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com nome e status */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <PlayCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={getStatusVariant(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                {details?.release_type && (
                  <Badge variant="secondary">
                    {getReleaseTypeLabel(details.release_type)}
                  </Badge>
                )}
              </div>
              {project.created_at && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Cadastrado em: {formatDateTimeBR(project.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Artista Responsável */}
          {artist && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Artista Responsável
                </h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{artist.name}</p>
                  {artist.genre && (
                    <p className="text-sm text-muted-foreground mt-1">Gênero: {artist.genre}</p>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Músicas do Projeto */}
          {details?.songs && details.songs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {details.songs.length === 1 ? 'Música' : `Músicas (${details.songs.length})`}
              </h3>
              <div className="space-y-4">
                {details.songs.map((song: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-lg">{song.song_name || 'Sem nome'}</h4>
                      <div className="flex gap-2">
                        {song.collaboration_type && (
                          <Badge variant="outline">
                            {song.collaboration_type === 'solo' ? 'Solo' : 'Feat'}
                          </Badge>
                        )}
                        {song.track_type && (
                          <Badge variant="outline">
                            {song.track_type === 'original' ? 'Original' : 'Remix'}
                          </Badge>
                        )}
                        {song.instrumental === 'sim' && (
                          <Badge variant="secondary">Instrumental</Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(song.duration_minutes !== undefined || song.duration_seconds !== undefined) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Duração:</span>
                          <span className="text-sm font-medium">
                            {String(song.duration_minutes || 0).padStart(2, '0')}:{String(song.duration_seconds || 0).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                      {song.genre && (
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Gênero:</span>
                          <span className="text-sm font-medium">{song.genre}</span>
                        </div>
                      )}
                      {song.language && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Idioma:</span>
                          <span className="text-sm font-medium">{song.language}</span>
                        </div>
                      )}
                    </div>

                    {/* Créditos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Music className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Compositores</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {song.composers?.map((c: any) => c.name).filter(Boolean).join(', ') || 'Não informado'}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic2 className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Intérpretes</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {song.performers?.map((p: any) => p.name).filter(Boolean).join(', ') || 'Não informado'}
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Headphones className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Produtores</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {song.producers?.map((p: any) => p.name).filter(Boolean).join(', ') || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    {/* Letra */}
                    {song.lyrics && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Letra</span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {song.lyrics}
                        </p>
                      </div>
                    )}

                    {/* Arquivos de Áudio */}
                    {song.audio_files && song.audio_files.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileAudio className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Arquivos de Áudio ({song.audio_files.length})</span>
                        </div>
                        <div className="space-y-1">
                          {song.audio_files.map((file: any, fileIndex: number) => (
                            <p key={fileIndex} className="text-sm text-muted-foreground">
                              • {file.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {details?.observations && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Observações</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {details.observations}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}