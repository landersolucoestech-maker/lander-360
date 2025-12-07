import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, User, Clock, MapPin, Building, Disc, FileAudio } from "lucide-react";
import { formatDateBR } from "@/lib/utils";

interface PhonogramViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phonogram: any;
}

export function PhonogramViewModal({ open, onOpenChange, phonogram }: PhonogramViewModalProps) {
  if (!phonogram) return null;

  const formatDuration = (durationInSeconds: number | null | undefined) => {
    if (!durationInSeconds || durationInSeconds <= 0) return "Não informado";
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case 'em_analise': return 'Em Análise';
      case 'aceita': return 'Aceita';
      case 'pendente': return 'Pendente';
      case 'recusada': return 'Recusada';
      default: return 'Pendente';
    }
  };

  const getRoleDisplay = (role: string) => {
    const roles: Record<string, string> = {
      'interprete': 'Intérprete',
      'musico': 'Músico',
      'musico_acompanhante': 'Músico Acompanhante',
      'produtor': 'Produtor',
      'produtor_fonografico': 'Produtor Fonográfico',
      'engenheiro_som': 'Engenheiro de Som',
      'tecnico_mixagem': 'Técnico de Mixagem',
      'masterizacao': 'Masterização',
      'compositor': 'Compositor',
      'compositor_autor': 'Compositor/Autor',
    };
    return roles[role] || role.replace(/_/g, ' ');
  };

  const participants = phonogram.participants || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Disc className="h-5 w-5" />
            Detalhes do Fonograma
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título</label>
                <p className="text-lg font-semibold">{phonogram.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Artista</label>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {phonogram.artistName || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duração</label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(phonogram.duration)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <Badge variant="secondary">{phonogram.genre || "Não informado"}</Badge>
              </div>
            </div>
          </div>

          {/* Códigos de Registro */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Códigos de Registro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">ISRC</label>
                <p className="font-mono text-base">{phonogram.isrc || "Não informado"}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Código ABRAMUS</label>
                <p className="font-mono text-base">{phonogram.abramus_code || "Não informado"}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">Código ECAD</label>
                <p className="font-mono text-base">{phonogram.ecad_code || "Não informado"}</p>
              </div>
            </div>
          </div>

          {/* Dados da Gravação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados da Gravação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Gravação</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateBR(phonogram.recording_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estúdio</label>
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {phonogram.recording_studio || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Local</label>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {phonogram.recording_location || "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Versão</label>
                <Badge variant="outline">{phonogram.version_type || "Original"}</Badge>
              </div>
            </div>
          </div>

          {/* Participantes */}
          {participants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Participantes</h3>
              <div className="space-y-2">
                {participants.map((participant: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="font-medium">{participant.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getRoleDisplay(participant.role)}</Badge>
                      {participant.percentage !== undefined && participant.percentage !== null && (
                        <span className="text-sm text-muted-foreground">({participant.percentage}%)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Áudio */}
          {phonogram.audio_url && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Arquivo de Áudio</h3>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <FileAudio className="h-6 w-6 text-primary" />
                  <span className="font-medium">Áudio do Fonograma</span>
                </div>
                <audio controls className="w-full">
                  <source src={phonogram.audio_url} />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status do Registro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status Atual</label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      phonogram.status === "aceita" ? "default" : 
                      phonogram.status === "recusada" ? "destructive" : 
                      phonogram.status === "em_analise" ? "outline" : "secondary"
                    }
                  >
                    {getStatusDisplay(phonogram.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Registro</label>
                <p className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateBR(phonogram.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
