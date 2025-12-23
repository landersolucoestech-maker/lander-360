import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, XCircle, Upload, Edit, Download, Filter,
  Share2, Image, Plus, Trash2, Users, Search, Eye, Check
} from "lucide-react";
import { cn, formatDateBR, translateStatus } from "@/lib/utils";
import XLSX from "xlsx-js-style";
import { useToast } from "@/hooks/use-toast";
import { useReleases, useUpdateRelease } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useArtistFilter } from "@/hooks/useLinkedArtist";

interface ParticipantRoyalty {
  name: string;
  role: string;
  percentage: number;
  shareStatus: 'pending' | 'applied' | 'not_applied';
}

const GestaoShares = () => {
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allReleases = [], isLoading } = useReleases();
  const { data: allArtists = [] } = useArtists();
  const updateRelease = useUpdateRelease();

  // Aplicar filtro de artista
  const releases = useMemo(() => {
    if (shouldFilter && artistId) {
      return allReleases.filter((r: any) => r.artist_id === artistId);
    }
    return allReleases;
  }, [allReleases, shouldFilter, artistId]);

  const artists = useMemo(() => {
    if (shouldFilter && artistId) {
      return allArtists.filter((a: any) => a.id === artistId);
    }
    return allArtists;
  }, [allArtists, shouldFilter, artistId]);

  // Fetch pending shares from database (filtrado por artista se necessário)
  const { data: allPendingShares = [], isLoading: isLoadingPendingShares } = useQuery({
    queryKey: ['pending-shares', artistId, shouldFilter],
    queryFn: async () => {
      let query = supabase
        .from('pending_shares')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Note: pending_shares pode não ter artist_id direto, então filtramos via release_id
      const { data, error } = await query;
      if (error) throw error;
      
      if (shouldFilter && artistId && data) {
        // Filtrar por release_id que pertence ao artista
        const artistReleaseIds = releases.map((r: any) => r.id);
        return data.filter((s: any) => artistReleaseIds.includes(s.release_id));
      }
      
      return data || [];
    }
    }
  });

  // Mutation to create pending share
  const createPendingShare = useMutation({
    mutationFn: async (shareData: {
      music_title: string;
      artist_name: string;
      participant_name: string;
      participant_role: string;
      share_percentage: number | null;
      notes: string;
    }) => {
      const { data, error } = await supabase
        .from('pending_shares')
        .insert([shareData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shares'] });
      toast({
        title: "Share pendente registrado",
        description: "O share foi salvo com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating pending share:', error);
      toast({
        title: "Erro ao registrar",
        description: error.message || "Ocorreu um erro ao salvar o share pendente.",
        variant: "destructive"
      });
    }
  });

  // Mutation to delete pending share
  const deletePendingShare = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pending_shares')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shares'] });
      toast({
        title: "Share removido",
        description: "O share pendente foi removido.",
      });
    }
  });

  // Mutation to update pending share
  const updatePendingShare = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('pending_shares')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shares'] });
      toast({
        title: "Share atualizado",
        description: "O share foi atualizado com sucesso.",
      });
    }
  });

  // Filter states
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [shareFilter, setShareFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Pending shares modal (músicas que precisam receber share)
  const [pendingSharesModalOpen, setPendingSharesModalOpen] = useState(false);
  const [pendingShareData, setPendingShareData] = useState({
    musicTitle: "",
    artistName: "",
    participantName: "",
    participantRole: "Compositor",
    sharePercentage: "",
    notes: ""
  });

  // View/Edit pending share modal
  const [viewPendingShareModal, setViewPendingShareModal] = useState(false);
  const [editPendingShareModal, setEditPendingShareModal] = useState(false);
  const [selectedPendingShare, setSelectedPendingShare] = useState<any>(null);
  const [editingPendingShareData, setEditingPendingShareData] = useState({
    musicTitle: "",
    artistName: "",
    participantName: "",
    participantRole: "Compositor",
    sharePercentage: "",
    notes: "",
    status: "pending"
  });

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);

  // Form states
  const [royaltiesVerified, setRoyaltiesVerified] = useState(false);
  const [royaltiesNotes, setRoyaltiesNotes] = useState("");
  const [participantsRoyalties, setParticipantsRoyalties] = useState<ParticipantRoyalty[]>([]);

  const getArtistName = (artistId: string | null) => {
    if (!artistId) return "N/A";
    const artist = artists.find(a => a.id === artistId);
    return artist?.stage_name || artist?.name || "N/A";
  };

  const translateReleaseType = (type: string | null) => {
    const types: Record<string, string> = {
      'single': 'Single',
      'ep': 'EP',
      'album': 'Álbum',
      'compilation': 'Compilação'
    };
    return types[type || ''] || type || '-';
  };

  const getReleaseParticipants = (release: any): ParticipantRoyalty[] => {
    const tracks = Array.isArray(release?.tracks) ? release.tracks : [];
    const participants = tracks[0]?.royalties_participants;
    return Array.isArray(participants) ? participants : [];
  };

  const getParticipantsTotalPercentage = (participants: ParticipantRoyalty[]) => {
    return participants.reduce((sum, p) => sum + (Number((p as any)?.percentage) || 0), 0);
  };

  const deriveShareAppliedFromParticipants = (participants: ParticipantRoyalty[]): boolean | null => {
    if (!participants || participants.length === 0) return null;

    const total = getParticipantsTotalPercentage(participants);
    const statuses = participants.map((p) => (p.shareStatus || 'pending'));

    const allApplied = statuses.every((s) => s === 'applied');
    const allNotApplied = statuses.every((s) => s === 'not_applied');

    if (allApplied && Math.abs(total - 100) < 0.01) return true;
    if (allNotApplied) return false;
    return null;
  };

  const getReleaseShareApplied = (release: any): boolean | null => {
    if (release?.royalties_share_applied === true) return true;
    if (release?.royalties_share_applied === false) return false;
    return deriveShareAppliedFromParticipants(getReleaseParticipants(release));
  };

  const getReleaseSharePercentage = (release: any): number => {
    const participants = getReleaseParticipants(release);
    const total = getParticipantsTotalPercentage(participants);
    return total > 0 ? total : (Number(release?.royalties_expected) || 0);
  };

  // Filter releases
  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      // Text search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const artistName = getArtistName(release.artist_id).toLowerCase();
        const title = release.title?.toLowerCase() || "";
        if (!title.includes(query) && !artistName.includes(query)) return false;
      }

      if (selectedArtist !== "all" && release.artist_id !== selectedArtist) return false;
      if (statusFilter !== "all" && release.status !== statusFilter) return false;
      if (verificationFilter === "verified" && !(release as any).royalties_verified) return false;
      if (verificationFilter === "pending" && (release as any).royalties_verified) return false;

      const shareApplied = getReleaseShareApplied(release);
      if (shareFilter === "applied" && shareApplied !== true) return false;
      if (shareFilter === "not_applied" && shareApplied !== false) return false;
      if (shareFilter === "pending" && shareApplied !== null) return false;

      return true;
    });
  }, [releases, artists, selectedArtist, statusFilter, verificationFilter, shareFilter, searchQuery]);

  // Summary stats
  const stats = useMemo(() => {
    const total = releases.length;
    const verified = releases.filter(r => (r as any).royalties_verified).length;

    const shareAppliedCount = releases.filter(r => getReleaseShareApplied(r) === true).length;
    const shareNotApplied = releases.filter(r => getReleaseShareApplied(r) === false).length;
    const sharePending = releases.filter(r => getReleaseShareApplied(r) === null).length;

    return {
      total,
      verified,
      pending: total - verified,
      shareApplied: shareAppliedCount,
      shareNotApplied,
      sharePending
    };
  }, [releases]);

  const handleEdit = (release: any) => {
    setSelectedRelease(release);
    setRoyaltiesVerified(release.royalties_verified || false);
    setRoyaltiesNotes(release.royalties_notes || "");

    // Parse existing participants royalties from tracks JSON
    const tracks = Array.isArray(release?.tracks) ? release.tracks : [];
    const existingParticipants = Array.isArray(tracks[0]?.royalties_participants)
      ? tracks[0].royalties_participants
      : [];

    if (existingParticipants.length > 0) {
      setParticipantsRoyalties(existingParticipants);
    } else {
      // Try to extract participants from tracks data
      const participantsList: ParticipantRoyalty[] = [];

      // Add main artist
      const artistName = getArtistName(release.artist_id);
      if (artistName !== "N/A") {
        participantsList.push({ name: artistName, role: "Artista Principal", percentage: 0, shareStatus: 'pending' });
      }

      // Extract from tracks
      tracks.forEach((track: any) => {
        if (track.composers) {
          const composers = typeof track.composers === 'string' ? track.composers.split(',') : (Array.isArray(track.composers) ? track.composers : []);
          composers.forEach((c: string) => {
            const name = (c || '').trim();
            if (name && !participantsList.find(p => p.name.toLowerCase() === name.toLowerCase())) {
              participantsList.push({ name, role: "Compositor", percentage: 0, shareStatus: 'pending' });
            }
          });
        }
        if (track.performers) {
          const performers = typeof track.performers === 'string' ? track.performers.split(',') : (Array.isArray(track.performers) ? track.performers : []);
          performers.forEach((p: string) => {
            const name = (p || '').trim();
            if (name && !participantsList.find(pr => pr.name.toLowerCase() === name.toLowerCase())) {
              participantsList.push({ name, role: "Intérprete", percentage: 0, shareStatus: 'pending' });
            }
          });
        }
        if (track.producers) {
          const producers = typeof track.producers === 'string' ? track.producers.split(',') : (Array.isArray(track.producers) ? track.producers : []);
          producers.forEach((p: string) => {
            const name = (p || '').trim();
            if (name && !participantsList.find(pr => pr.name.toLowerCase() === name.toLowerCase())) {
              participantsList.push({ name, role: "Produtor", percentage: 0, shareStatus: 'pending' });
            }
          });
        }
      });

      setParticipantsRoyalties(participantsList);
    }

    setEditModalOpen(true);
  };

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
    if (!selectedRelease) return;

    // Prepare tracks with participant royalties embedded
    const existingTracks = Array.isArray(selectedRelease?.tracks) ? selectedRelease.tracks : [];
    const tracksWithRoyalties = existingTracks.map((track: any) => ({
      ...track,
      royalties_participants: participantsRoyalties
    }));

    // If we don't have an explicit value, derive it from the participants (keeps list+modal consistent)
    const derivedShareApplied = deriveShareAppliedFromParticipants(participantsRoyalties);
    const shareAppliedToSave = selectedRelease.royalties_share_applied ?? derivedShareApplied;

    const updateData = {
      royalties_verified: royaltiesVerified,
      royalties_share_applied: shareAppliedToSave,
      royalties_notes: royaltiesNotes,
      royalties_verified_at: royaltiesVerified ? new Date().toISOString() : null,
      tracks: tracksWithRoyalties.length > 0 ? tracksWithRoyalties : [{ royalties_participants: participantsRoyalties }]
    };

    try {
      await updateRelease.mutateAsync({ id: selectedRelease.id, data: updateData as any });

      toast({
        title: "Dados atualizados",
        description: "Informações de royalties salvas com sucesso.",
      });
      setEditModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao atualizar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const data = filteredReleases.map(release => {
      const shareApplied = getReleaseShareApplied(release);
      const sharePercentage = getReleaseSharePercentage(release);

      return {
        "Título": release.title,
        "Artista": getArtistName(release.artist_id),
        "Tipo": translateReleaseType(release.type),
        "Data Lançamento": release.release_date ? formatDateBR(release.release_date) : "-",
        "Distribuidoras": release.distributors?.join(", ") || "-",
        "Status": translateStatus(release.status),
        "Conferido": (release as any).royalties_verified ? "Sim" : "Não",
        "Share Aplicado": shareApplied === true ? "Sim" : shareApplied === false ? "Não" : "Pendente",
        "Percentual (%)": Number(sharePercentage.toFixed(2)),
        "Observações": (release as any).royalties_notes || ""
      };
    });

    if (data.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Royalties");
    XLSX.writeFile(workbook, `gestao_royalties_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: "Arquivo exportado com sucesso.",
    });
  };

  const clearFilters = () => {
    setSelectedArtist("all");
    setVerificationFilter("all");
    setShareFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Shares</h1>
                  <p className="text-sm text-muted-foreground">Conferência de share aplicado nos lançamentos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPendingSharesModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Registrar Share Pendente</span>
                </Button>
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Share a Receber</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingShares.filter((s: any) => s.status !== 'received').length}</p>
                    </div>
                    <Users className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Share Recebido</p>
                      <p className="text-2xl font-bold text-blue-600">{pendingShares.filter((s: any) => s.status === 'received').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Share a Enviar</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                    </div>
                    <Share2 className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Share Aplicado</p>
                      <p className="text-2xl font-bold text-green-600">{stats.shareApplied}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <Input
                    placeholder="Buscar por título ou artista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Artista</Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os artistas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os artistas</SelectItem>
                        {artists.map(artist => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.stage_name || artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status Lançamento</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="lancado">Lançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Conferência</Label>
                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="verified">Conferidos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Share Aplicado</Label>
                    <Select value={shareFilter} onValueChange={setShareFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="applied">Sim</SelectItem>
                        <SelectItem value="not_applied">Não</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Releases List */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : filteredReleases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhum lançamento encontrado</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Lançamentos ({filteredReleases.length})</CardTitle>
                  <CardDescription>Gerencie o share aplicado e conferência de royalties</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Capa</th>
                          <th className="text-left p-3">Título</th>
                          <th className="text-left p-3">Artista</th>
                          <th className="text-left p-3">Tipo</th>
                          <th className="text-left p-3">Data</th>
                          <th className="text-center p-3">Enviado</th>
                          <th className="text-center p-3">Share</th>
                          <th className="text-right p-3">Percentual (%)</th>
                          <th className="text-center p-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReleases.map(release => {
                          const shareApplied = getReleaseShareApplied(release);
                          const sharePercentage = getReleaseSharePercentage(release);

                          return (
                            <tr key={release.id} className="border-t border-border hover:bg-muted/30">
                              <td className="p-3">
                                {release.cover_url ? (
                                  <img 
                                    src={release.cover_url} 
                                    alt={release.title}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                    <Image className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </td>
                              <td className="p-3 font-medium">{release.title}</td>
                              <td className="p-3">{getArtistName(release.artist_id)}</td>
                              <td className="p-3">
                                <Badge variant="outline">{translateReleaseType(release.type)}</Badge>
                              </td>
                              <td className="p-3">{release.release_date ? formatDateBR(release.release_date) : "-"}</td>
                              <td className="p-3 text-center">
                                {(release as any).royalties_verified ? (
                                  <Badge className="bg-green-600">Sim</Badge>
                                ) : (
                                  <Badge variant="outline">Não</Badge>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {shareApplied === true ? (
                                  <Badge className="bg-green-600">Sim</Badge>
                                ) : shareApplied === false ? (
                                  <Badge className="bg-red-600">Não</Badge>
                                ) : (
                                  <Badge variant="outline">Pendente</Badge>
                                )}
                              </td>
                              <td className="p-3 text-right">{Number(sharePercentage.toFixed(2))}%</td>
                              <td className="p-3 text-center">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(release)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Shares List */}
            {pendingShares.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Shares Pendentes ({pendingShares.length})
                  </CardTitle>
                  <CardDescription>Músicas que precisam receber share de participantes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Música</th>
                          <th className="text-left p-3">Artista</th>
                          <th className="text-left p-3">Participante</th>
                          <th className="text-left p-3">Função</th>
                          <th className="text-right p-3">%</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-center p-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingShares.map((share: any) => (
                          <tr key={share.id} className="border-t border-border hover:bg-muted/30">
                            <td className="p-3 font-medium">{share.music_title}</td>
                            <td className="p-3">{share.artist_name || "-"}</td>
                            <td className="p-3">{share.participant_name}</td>
                            <td className="p-3">
                              <Badge variant="outline">{share.participant_role}</Badge>
                            </td>
                            <td className="p-3 text-right">{share.share_percentage ? `${share.share_percentage}%` : "-"}</td>
                            <td className="p-3">
                              <Badge 
                                variant={share.status === 'received' ? 'default' : 'secondary'}
                                className={share.status === 'received' ? 'bg-green-600' : ''}
                              >
                                {share.status === 'received' ? 'Recebido' : 'Pendente'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPendingShare(share);
                                    setViewPendingShareModal(true);
                                  }}
                                >
                                  Ver
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPendingShare(share);
                                    setEditingPendingShareData({
                                      musicTitle: share.music_title || "",
                                      artistName: share.artist_name || "",
                                      participantName: share.participant_name || "",
                                      participantRole: share.participant_role || "Compositor",
                                      sharePercentage: share.share_percentage ? String(share.share_percentage) : "",
                                      notes: share.notes || "",
                                      status: share.status || "pending"
                                    });
                                    setEditPendingShareModal(true);
                                  }}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deletePendingShare.mutate(share.id)}
                                  disabled={deletePendingShare.isPending}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Share</DialogTitle>
            <DialogDescription>
              {selectedRelease?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Share Enviado</Label>
              <Switch checked={royaltiesVerified} onCheckedChange={setRoyaltiesVerified} />
            </div>

            {/* Participants Royalties Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <Label className="text-base font-medium">Percentual por Envolvido</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddParticipant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {participantsRoyalties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                  Nenhum participante adicionado. Clique em "Adicionar" para incluir.
                </p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {participantsRoyalties.map((participant, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Nome"
                          value={participant.name}
                          onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Select 
                          value={participant.role} 
                          onValueChange={(v) => handleParticipantChange(index, 'role', v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Artista Principal">Artista</SelectItem>
                            <SelectItem value="Compositor">Compositor</SelectItem>
                            <SelectItem value="Intérprete">Intérprete</SelectItem>
                            <SelectItem value="Produtor">Produtor</SelectItem>
                            <SelectItem value="Músico">Músico</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveParticipant(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Input 
                            type="number"
                            step="0.01"
                            max="100"
                            placeholder="%"
                            value={participant.percentage || ""}
                            onChange={(e) => handleParticipantChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                        <Select 
                          value={participant.shareStatus || 'pending'} 
                          onValueChange={(v) => handleParticipantChange(index, 'shareStatus', v)}
                        >
                          <SelectTrigger className={cn(
                            "w-36",
                            participant.shareStatus === 'applied' && "border-green-500 text-green-600",
                            participant.shareStatus === 'not_applied' && "border-red-500 text-red-600"
                          )}>
                            <SelectValue placeholder="Situação Share" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="applied">Share Aplicado</SelectItem>
                            <SelectItem value="not_applied">Não Aplicado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {participantsRoyalties.length > 0 && (
                <div className={cn(
                  "text-sm font-medium p-2 rounded-lg text-center",
                  totalParticipantPercentage === 100 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                )}>
                  Total: {Math.min(totalParticipantPercentage, 100).toFixed(2)}%
                  {totalParticipantPercentage !== 100 && " (deve somar 100%)"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea 
                value={royaltiesNotes}
                onChange={(e) => setRoyaltiesNotes(e.target.value)}
                placeholder="Anotações sobre a conferência..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateRelease.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Shares Modal - Registrar música que precisa receber share */}
      <Dialog open={pendingSharesModalOpen} onOpenChange={setPendingSharesModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Share Pendente</DialogTitle>
            <DialogDescription>
              Registre uma música que precisa receber share de algum participante
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da Música *</Label>
              <Input
                value={pendingShareData.musicTitle}
                onChange={(e) => setPendingShareData({ ...pendingShareData, musicTitle: e.target.value })}
                placeholder="Ex: Nome da Música"
              />
            </div>

            <div className="space-y-2">
              <Label>Artista</Label>
              <Input
                value={pendingShareData.artistName}
                onChange={(e) => setPendingShareData({ ...pendingShareData, artistName: e.target.value })}
                placeholder="Nome do artista"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quem deve receber o share *</Label>
                <Input
                  value={pendingShareData.participantName}
                  onChange={(e) => setPendingShareData({ ...pendingShareData, participantName: e.target.value })}
                  placeholder="Nome do participante"
                />
              </div>

              <div className="space-y-2">
                <Label>Função</Label>
                <Select 
                  value={pendingShareData.participantRole} 
                  onValueChange={(value) => setPendingShareData({ ...pendingShareData, participantRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compositor">Compositor</SelectItem>
                    <SelectItem value="Produtor">Produtor</SelectItem>
                    <SelectItem value="Intérprete">Intérprete</SelectItem>
                    <SelectItem value="Músico">Músico</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Artista Principal">Artista Principal</SelectItem>
                    <SelectItem value="Gravadora">Gravadora</SelectItem>
                    <SelectItem value="Empresário">Empresário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Percentual do Share (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={pendingShareData.sharePercentage}
                onChange={(e) => setPendingShareData({ ...pendingShareData, sharePercentage: e.target.value })}
                placeholder="Ex: 10.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={pendingShareData.notes}
                onChange={(e) => setPendingShareData({ ...pendingShareData, notes: e.target.value })}
                placeholder="Informações adicionais sobre o share pendente..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPendingSharesModalOpen(false);
              setPendingShareData({
                musicTitle: "",
                artistName: "",
                participantName: "",
                participantRole: "Compositor",
                sharePercentage: "",
                notes: ""
              });
            }}>
              Cancelar
            </Button>
            <Button 
              disabled={createPendingShare.isPending}
              onClick={() => {
                if (!pendingShareData.musicTitle || !pendingShareData.participantName) {
                  toast({
                    title: "Campos obrigatórios",
                    description: "Preencha o título da música e quem deve receber o share.",
                    variant: "destructive"
                  });
                  return;
                }
                
                createPendingShare.mutate({
                  music_title: pendingShareData.musicTitle,
                  artist_name: pendingShareData.artistName || null,
                  participant_name: pendingShareData.participantName,
                  participant_role: pendingShareData.participantRole,
                  share_percentage: pendingShareData.sharePercentage ? parseFloat(pendingShareData.sharePercentage) : null,
                  notes: pendingShareData.notes || null
                });
                
                setPendingSharesModalOpen(false);
                setPendingShareData({
                  musicTitle: "",
                  artistName: "",
                  participantName: "",
                  participantRole: "Compositor",
                  sharePercentage: "",
                  notes: ""
                });
              }}
            >
              {createPendingShare.isPending ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Pending Share Modal */}
      <Dialog open={viewPendingShareModal} onOpenChange={setViewPendingShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Share Pendente</DialogTitle>
          </DialogHeader>
          {selectedPendingShare && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Música</Label>
                  <p className="font-medium">{selectedPendingShare.music_title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Artista</Label>
                  <p>{selectedPendingShare.artist_name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Participante</Label>
                  <p>{selectedPendingShare.participant_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Função</Label>
                  <Badge variant="outline">{selectedPendingShare.participant_role}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Percentual</Label>
                  <p>{selectedPendingShare.share_percentage ? `${selectedPendingShare.share_percentage}%` : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge 
                    variant={selectedPendingShare.status === 'received' ? 'default' : 'secondary'}
                    className={selectedPendingShare.status === 'received' ? 'bg-green-600' : ''}
                  >
                    {selectedPendingShare.status === 'received' ? 'Recebido' : 'Pendente'}
                  </Badge>
                </div>
              </div>
              {selectedPendingShare.notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Observações</Label>
                  <p className="text-sm">{selectedPendingShare.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPendingShareModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pending Share Modal */}
      <Dialog open={editPendingShareModal} onOpenChange={setEditPendingShareModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Share Pendente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título da Música *</Label>
                <Input
                  value={editingPendingShareData.musicTitle}
                  onChange={(e) => setEditingPendingShareData({ ...editingPendingShareData, musicTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome do Artista</Label>
                <Input
                  value={editingPendingShareData.artistName}
                  onChange={(e) => setEditingPendingShareData({ ...editingPendingShareData, artistName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quem deve receber o share *</Label>
                <Input
                  value={editingPendingShareData.participantName}
                  onChange={(e) => setEditingPendingShareData({ ...editingPendingShareData, participantName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Select 
                  value={editingPendingShareData.participantRole} 
                  onValueChange={(value) => setEditingPendingShareData({ ...editingPendingShareData, participantRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compositor">Compositor</SelectItem>
                    <SelectItem value="Produtor">Produtor</SelectItem>
                    <SelectItem value="Intérprete">Intérprete</SelectItem>
                    <SelectItem value="Músico">Músico</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Artista Principal">Artista Principal</SelectItem>
                    <SelectItem value="Gravadora">Gravadora</SelectItem>
                    <SelectItem value="Empresário">Empresário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Percentual do Share (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editingPendingShareData.sharePercentage}
                onChange={(e) => setEditingPendingShareData({ ...editingPendingShareData, sharePercentage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={editingPendingShareData.notes}
                onChange={(e) => setEditingPendingShareData({ ...editingPendingShareData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label>Marcar como Recebido</Label>
              <Switch 
                checked={editingPendingShareData.status === 'received'} 
                onCheckedChange={(checked) => setEditingPendingShareData({ 
                  ...editingPendingShareData, 
                  status: checked ? 'received' : 'pending' 
                })} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPendingShareModal(false)}>
              Cancelar
            </Button>
            <Button 
              disabled={updatePendingShare.isPending}
              onClick={() => {
                if (!editingPendingShareData.musicTitle || !editingPendingShareData.participantName) {
                  toast({
                    title: "Campos obrigatórios",
                    description: "Preencha o título da música e quem deve receber o share.",
                    variant: "destructive"
                  });
                  return;
                }
                
                updatePendingShare.mutate({
                  id: selectedPendingShare.id,
                  data: {
                    music_title: editingPendingShareData.musicTitle,
                    artist_name: editingPendingShareData.artistName || null,
                    participant_name: editingPendingShareData.participantName,
                    participant_role: editingPendingShareData.participantRole,
                    share_percentage: editingPendingShareData.sharePercentage ? parseFloat(editingPendingShareData.sharePercentage) : null,
                    notes: editingPendingShareData.notes || null,
                    status: editingPendingShareData.status
                  }
                });
                
                setEditPendingShareModal(false);
              }}
            >
              {updatePendingShare.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default GestaoShares;
