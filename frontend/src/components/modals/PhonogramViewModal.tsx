import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Music, Calendar, User, Clock, MapPin, Building, Disc, FileAudio, FileText, Loader2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PhonogramViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phonogram: any;
}

interface LinkedWork {
  id: string;
  title: string;
  isrc?: string | null;
  iswc?: string | null;
  genre?: string | null;
  writers?: string[] | null;
  publishers?: string[] | null;
  abramus_code?: string | null;
  ecad_code?: string | null;
  status?: string | null;
}

export function PhonogramViewModal({ open, onOpenChange, phonogram }: PhonogramViewModalProps) {
  const [linkedWork, setLinkedWork] = useState<LinkedWork | null>(null);
  const [loadingWork, setLoadingWork] = useState(false);

  useEffect(() => {
    async function fetchLinkedWork() {
      if (!phonogram?.work_id) {
        setLinkedWork(null);
        return;
      }

      setLoadingWork(true);
      try {
        const { data, error } = await supabase
          .from('music_registry')
          .select('id, title, isrc, iswc, genre, writers, publishers, abramus_code, ecad_code, status')
          .eq('id', phonogram.work_id)
          .maybeSingle();

        if (error) throw error;
        setLinkedWork(data);
      } catch (error) {
        console.error('Error fetching linked work:', error);
        setLinkedWork(null);
      } finally {
        setLoadingWork(false);
      }
    }

    if (open && phonogram?.work_id) {
      fetchLinkedWork();
    }
  }, [open, phonogram?.work_id]);

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
      case 'registrado': return 'Registrado';
      case 'ativo': return 'Ativo';
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
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

          {/* Obra Vinculada */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Obra Vinculada
            </h3>
            {loadingWork ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando...</span>
              </div>
            ) : linkedWork ? (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Título da Obra</label>
                    <p className="font-semibold flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      {linkedWork.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant="outline">{getStatusDisplay(linkedWork.status)}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ISWC</label>
                    <p className="font-mono text-sm">{linkedWork.iswc || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                    <p className="text-sm">{linkedWork.genre || "Não informado"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Código ABRAMUS</label>
                    <p className="font-mono text-sm">{linkedWork.abramus_code || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Código ECAD</label>
                    <p className="font-mono text-sm">{linkedWork.ecad_code || "Não informado"}</p>
                  </div>
                </div>
                {linkedWork.writers && linkedWork.writers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Compositores</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {linkedWork.writers.map((writer, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {writer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {linkedWork.publishers && linkedWork.publishers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Editoras</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {linkedWork.publishers.map((publisher, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {publisher}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma obra vinculada a este fonograma</p>
              </div>
            )}
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
                    className={
                      phonogram.status === "aceita" ? "bg-blue-600 text-white" : 
                      phonogram.status === "recusada" ? "bg-red-600 text-white" : 
                      "bg-yellow-500 text-black"
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
