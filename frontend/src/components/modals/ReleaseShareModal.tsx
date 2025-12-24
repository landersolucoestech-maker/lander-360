import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUpdateRelease } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";

interface ParticipantRoyalty {
  name: string;
  role: string;
  percentage: number;
  shareStatus: 'pending' | 'applied' | 'not_applied';
}

interface ReleaseShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: any;
  onSuccess?: () => void;
}

export function ReleaseShareModal({ open, onOpenChange, release, onSuccess }: ReleaseShareModalProps) {
  const { toast } = useToast();
  const updateRelease = useUpdateRelease();
  const { data: artists = [] } = useArtists();
  
  const [royaltiesVerified, setRoyaltiesVerified] = useState(false);
  const [percentualEnviado, setPercentualEnviado] = useState("");
  const [shareApplied, setShareApplied] = useState<boolean | null>(null);
  const [royaltiesNotes, setRoyaltiesNotes] = useState("");
  const [participantsRoyalties, setParticipantsRoyalties] = useState<ParticipantRoyalty[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const getArtistName = (artistId: string | null) => {
    if (!artistId) return "N/A";
    const artist = artists.find(a => a.id === artistId);
    return artist?.name || artist?.name || "N/A";
  };

  // Normalize name for comparison (lowercase, trim, remove accents)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Check if a name matches any artist by civil name or stage name
  const findMatchingArtist = (name: string) => {
    const normalized = normalizeName(name);
    return artists.find(a => 
      normalizeName(a.name || '') === normalized ||
      normalizeName(a.stage_name || '') === normalized ||
      normalizeName(a.full_name || '') === normalized
    );
  };

  // Check if name already exists in list (comparing by civil name and stage name)
  const isNameDuplicate = (name: string, existingList: ParticipantRoyalty[]): boolean => {
    const normalized = normalizeName(name);
    const matchingArtist = findMatchingArtist(name);
    
    return existingList.some(p => {
      const pNormalized = normalizeName(p.name);
      
      // Direct name match
      if (pNormalized === normalized) return true;
      
      // Check if both names refer to the same artist
      const pMatchingArtist = findMatchingArtist(p.name);
      if (matchingArtist && pMatchingArtist && matchingArtist.id === pMatchingArtist.id) {
        return true;
      }
      
      // Check if input name matches any variation of existing participant's artist
      if (pMatchingArtist) {
        if (normalizeName(pMatchingArtist.name || '') === normalized ||
            normalizeName(pMatchingArtist.stage_name || '') === normalized ||
            normalizeName(pMatchingArtist.full_name || '') === normalized) {
          return true;
        }
      }
      
      // Check if existing participant name matches any variation of input's artist
      if (matchingArtist) {
        if (normalizeName(matchingArtist.name || '') === pNormalized ||
            normalizeName(matchingArtist.stage_name || '') === pNormalized ||
            normalizeName(matchingArtist.full_name || '') === pNormalized) {
          return true;
        }
      }
      
      return false;
    });
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (open && release) {
      setRoyaltiesVerified((release as any).royalties_verified || false);
      setPercentualEnviado(String((release as any).royalties_expected || ""));
      setShareApplied((release as any).royalties_share_applied ?? null);
      setRoyaltiesNotes((release as any).royalties_notes || "");
      
      // Parse existing participants royalties or extract from tracks
      const existingParticipants = (release as any).royalties_participants || [];
      if (existingParticipants.length > 0) {
        setParticipantsRoyalties(existingParticipants);
      } else {
        const tracks = release.tracks || [];
        const participantsList: ParticipantRoyalty[] = [];
        
        // Add main artist (prefer stage name for display)
        const mainArtist = artists.find(a => a.id === release.artist_id);
        if (mainArtist) {
          const displayName = mainArtist.name || "N/A";
          if (displayName !== "N/A") {
            participantsList.push({ name: displayName, role: "Artista Principal", percentage: 0, shareStatus: 'pending' });
          }
        }
        
        // Extract from tracks with deduplication
        tracks.forEach((track: any) => {
          if (track.composers) {
            const composers = typeof track.composers === 'string' ? track.composers.split(',') : track.composers;
            composers.forEach((c: string) => {
              const name = typeof c === 'string' ? c.trim() : (c as any).name?.trim();
              if (name && !isNameDuplicate(name, participantsList)) {
                // Use stage name if artist is found
                const artist = findMatchingArtist(name);
                const displayName = artist?.name || name;
                participantsList.push({ name: displayName, role: "Compositor", percentage: 0, shareStatus: 'pending' });
              }
            });
          }
          if (track.performers) {
            const performers = typeof track.performers === 'string' ? track.performers.split(',') : track.performers;
            performers.forEach((p: string) => {
              const name = typeof p === 'string' ? p.trim() : (p as any).name?.trim();
              if (name && !isNameDuplicate(name, participantsList)) {
                const artist = findMatchingArtist(name);
                const displayName = artist?.name || name;
                participantsList.push({ name: displayName, role: "Intérprete", percentage: 0, shareStatus: 'pending' });
              }
            });
          }
          if (track.producers) {
            const producers = typeof track.producers === 'string' ? track.producers.split(',') : track.producers;
            producers.forEach((p: string) => {
              const name = typeof p === 'string' ? p.trim() : (p as any).name?.trim();
              if (name && !isNameDuplicate(name, participantsList)) {
                const artist = findMatchingArtist(name);
                const displayName = artist?.name || name;
                participantsList.push({ name: displayName, role: "Produtor", percentage: 0, shareStatus: 'pending' });
              }
            });
          }
        });
        
        setParticipantsRoyalties(participantsList);
      }
    }
  }, [open, release, artists]);

  const handleAddParticipant = () => {
    setParticipantsRoyalties([...participantsRoyalties, { name: "", role: "Compositor", percentage: 0, shareStatus: 'pending' }]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipantsRoyalties(participantsRoyalties.filter((_, i) => i !== index));
  };

  const handleParticipantChange = (index: number, field: keyof ParticipantRoyalty, value: string | number) => {
    const updated = [...participantsRoyalties];
    updated[index] = { ...updated[index], [field]: value };
    setParticipantsRoyalties(updated);
  };

  const totalParticipantPercentage = useMemo(() => {
    return participantsRoyalties.reduce((sum, p) => sum + (p.percentage || 0), 0);
  }, [participantsRoyalties]);

  const handleSave = async () => {
    if (!release) return;
    setIsSaving(true);

    try {
      // Prepare tracks with participant royalties embedded
      const existingTracks = release.tracks || [];
      const tracksWithRoyalties = existingTracks.map((track: any) => ({
        ...track,
        royalties_participants: participantsRoyalties
      }));

      const updateData = {
        royalties_verified: royaltiesVerified,
        royalties_expected: parseFloat(percentualEnviado) || 0,
        royalties_share_applied: shareApplied,
        royalties_notes: royaltiesNotes,
        royalties_verified_at: royaltiesVerified ? new Date().toISOString() : null,
        tracks: tracksWithRoyalties.length > 0 ? tracksWithRoyalties : [{ royalties_participants: participantsRoyalties }]
      };

      await updateRelease.mutateAsync({ id: release.id, data: updateData as any });

      toast({
        title: "Share configurado",
        description: "As informações de share do lançamento foram salvas com sucesso.",
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving share data:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações de share.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configurar Share do Lançamento
          </DialogTitle>
          <DialogDescription>
            O lançamento "{release?.title}" foi aprovado. Configure a distribuição de royalties entre os participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Verificação de Royalties */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Royalties Verificados</Label>
                <p className="text-sm text-muted-foreground">Marque se os royalties foram conferidos</p>
              </div>
              <Switch
                checked={royaltiesVerified}
                onCheckedChange={setRoyaltiesVerified}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Percentual Esperado (%)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 15"
                  value={percentualEnviado}
                  onChange={(e) => setPercentualEnviado(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Share Aplicado</Label>
                <Select
                  value={shareApplied === true ? "applied" : shareApplied === false ? "not_applied" : "pending"}
                  onValueChange={(value) => setShareApplied(value === "applied" ? true : value === "not_applied" ? false : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="applied">Aplicado</SelectItem>
                    <SelectItem value="not_applied">Não Aplicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Participantes</Label>
                <p className="text-sm text-muted-foreground">Distribua os percentuais entre os participantes</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {participantsRoyalties.map((participant, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/30 rounded-lg">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input
                      placeholder="Nome do participante"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Função</Label>
                    <Select
                      value={participant.role}
                      onValueChange={(value) => handleParticipantChange(index, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Artista Principal">Artista Principal</SelectItem>
                        <SelectItem value="Compositor">Compositor</SelectItem>
                        <SelectItem value="Intérprete">Intérprete</SelectItem>
                        <SelectItem value="Produtor">Produtor</SelectItem>
                        <SelectItem value="Músico">Músico</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">% Share</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={participant.percentage || ""}
                      onChange={(e) => handleParticipantChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select
                      value={participant.shareStatus}
                      onValueChange={(value) => handleParticipantChange(index, 'shareStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="applied">Aplicado</SelectItem>
                        <SelectItem value="not_applied">Não Aplicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveParticipant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {participantsRoyalties.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum participante adicionado. Clique em "Adicionar" para incluir participantes.
                </div>
              )}
            </div>

            {/* Total percentage indicator */}
            {participantsRoyalties.length > 0 && (
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                totalParticipantPercentage === 100 ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
              )}>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Total: {totalParticipantPercentage}%
                  {totalParticipantPercentage !== 100 && " (recomendado: 100%)"}
                </span>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas sobre a distribuição de royalties..."
              value={royaltiesNotes}
              onChange={(e) => setRoyaltiesNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSkip}>
            Configurar Depois
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
