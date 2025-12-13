import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  DollarSign, CheckCircle, XCircle, AlertTriangle, Music, Disc,
  TrendingUp, TrendingDown, Minus, Edit, Eye, Download, Filter,
  Share2
} from "lucide-react";
import { cn, formatDateBR, translateStatus } from "@/lib/utils";
import XLSX from "xlsx-js-style";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry, useUpdateMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { usePhonograms, useUpdatePhonogram } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { format } from "date-fns";

const GestaoRoyalties = () => {
  const { toast } = useToast();
  const { data: musicRegistry = [], isLoading: isLoadingMusic } = useMusicRegistry();
  const { data: phonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: artists = [] } = useArtists();
  const updateMusic = useUpdateMusicRegistryEntry();
  const updatePhonogram = useUpdatePhonogram();

  // Filter states
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [shareFilter, setShareFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("obras");

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<"obra" | "fonograma">("obra");

  // Form states
  const [royaltiesVerified, setRoyaltiesVerified] = useState(false);
  const [royaltiesExpected, setRoyaltiesExpected] = useState("");
  const [royaltiesReceived, setRoyaltiesReceived] = useState("");
  const [shareApplied, setShareApplied] = useState<boolean | null>(null);
  const [royaltiesNotes, setRoyaltiesNotes] = useState("");

  const getArtistName = (artistId: string | null) => {
    if (!artistId) return "N/A";
    const artist = artists.find(a => a.id === artistId);
    return artist?.stage_name || artist?.name || "N/A";
  };

  // Filter works
  const filteredWorks = useMemo(() => {
    return musicRegistry.filter(music => {
      if (selectedArtist !== "all" && music.artist_id !== selectedArtist) return false;
      if (verificationFilter === "verified" && !(music as any).royalties_verified) return false;
      if (verificationFilter === "pending" && (music as any).royalties_verified) return false;
      if (shareFilter === "applied" && (music as any).royalties_share_applied !== true) return false;
      if (shareFilter === "not_applied" && (music as any).royalties_share_applied !== false) return false;
      if (shareFilter === "pending" && (music as any).royalties_share_applied !== null) return false;
      return true;
    });
  }, [musicRegistry, selectedArtist, verificationFilter, shareFilter]);

  // Filter phonograms
  const filteredPhonograms = useMemo(() => {
    return phonograms.filter(phono => {
      if (selectedArtist !== "all" && phono.artist_id !== selectedArtist) return false;
      if (verificationFilter === "verified" && !(phono as any).royalties_verified) return false;
      if (verificationFilter === "pending" && (phono as any).royalties_verified) return false;
      if (shareFilter === "applied" && (phono as any).royalties_share_applied !== true) return false;
      if (shareFilter === "not_applied" && (phono as any).royalties_share_applied !== false) return false;
      if (shareFilter === "pending" && (phono as any).royalties_share_applied !== null) return false;
      return true;
    });
  }, [phonograms, selectedArtist, verificationFilter, shareFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const totalWorks = musicRegistry.length;
    const verifiedWorks = musicRegistry.filter(m => (m as any).royalties_verified).length;
    const totalPhonograms = phonograms.length;
    const verifiedPhonograms = phonograms.filter(p => (p as any).royalties_verified).length;

    const totalExpected = [...musicRegistry, ...phonograms].reduce(
      (sum, item) => sum + ((item as any).royalties_expected || 0), 0
    );
    const totalReceived = [...musicRegistry, ...phonograms].reduce(
      (sum, item) => sum + ((item as any).royalties_received || 0), 0
    );

    const shareNotApplied = [
      ...musicRegistry.filter(m => (m as any).royalties_share_applied === false),
      ...phonograms.filter(p => (p as any).royalties_share_applied === false)
    ].length;

    return {
      totalWorks,
      verifiedWorks,
      pendingWorks: totalWorks - verifiedWorks,
      totalPhonograms,
      verifiedPhonograms,
      pendingPhonograms: totalPhonograms - verifiedPhonograms,
      totalExpected,
      totalReceived,
      divergence: totalExpected - totalReceived,
      shareNotApplied
    };
  }, [musicRegistry, phonograms]);

  const handleEdit = (item: any, type: "obra" | "fonograma") => {
    setSelectedItem(item);
    setItemType(type);
    setRoyaltiesVerified((item as any).royalties_verified || false);
    setRoyaltiesExpected(String((item as any).royalties_expected || ""));
    setRoyaltiesReceived(String((item as any).royalties_received || ""));
    setShareApplied((item as any).royalties_share_applied);
    setRoyaltiesNotes((item as any).royalties_notes || "");
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    const updateData = {
      royalties_verified: royaltiesVerified,
      royalties_expected: parseFloat(royaltiesExpected) || 0,
      royalties_received: parseFloat(royaltiesReceived) || 0,
      royalties_share_applied: shareApplied,
      royalties_notes: royaltiesNotes,
      royalties_verified_at: royaltiesVerified ? new Date().toISOString() : null
    };

    try {
      if (itemType === "obra") {
        await updateMusic.mutateAsync({ id: selectedItem.id, data: updateData as any });
      } else {
        await updatePhonogram.mutateAsync({ id: selectedItem.id, data: updateData as any });
      }

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
    const worksData = filteredWorks.map(music => ({
      "Tipo": "Obra",
      "Título": music.title,
      "Artista": getArtistName(music.artist_id),
      "Conferido": (music as any).royalties_verified ? "Sim" : "Não",
      "Share Aplicado": (music as any).royalties_share_applied === true ? "Sim" : 
                        (music as any).royalties_share_applied === false ? "Não" : "Pendente",
      "Valor Esperado": (music as any).royalties_expected || 0,
      "Valor Recebido": (music as any).royalties_received || 0,
      "Divergência": ((music as any).royalties_expected || 0) - ((music as any).royalties_received || 0),
      "Observações": (music as any).royalties_notes || ""
    }));

    const phonogramData = filteredPhonograms.map(phono => ({
      "Tipo": "Fonograma",
      "Título": phono.title,
      "Artista": getArtistName(phono.artist_id),
      "Conferido": (phono as any).royalties_verified ? "Sim" : "Não",
      "Share Aplicado": (phono as any).royalties_share_applied === true ? "Sim" : 
                        (phono as any).royalties_share_applied === false ? "Não" : "Pendente",
      "Valor Esperado": (phono as any).royalties_expected || 0,
      "Valor Recebido": (phono as any).royalties_received || 0,
      "Divergência": ((phono as any).royalties_expected || 0) - ((phono as any).royalties_received || 0),
      "Observações": (phono as any).royalties_notes || ""
    }));

    const data = [...worksData, ...phonogramData];
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
  };

  const isLoading = isLoadingMusic || isLoadingPhonograms;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 lg:h-16 shrink-0 items-center gap-2 border-b border-border px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold text-foreground">Gestão de Royalties</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Conferência de royalties e divergências</p>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </header>

          <main className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conferidos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.verifiedWorks + stats.verifiedPhonograms}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.pendingWorks + stats.pendingPhonograms}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sem Share</p>
                      <p className="text-2xl font-bold text-red-600">{stats.shareNotApplied}</p>
                    </div>
                    <Share2 className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Esperado</p>
                      <p className="text-xl font-bold">R$ {stats.totalExpected.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Divergência</p>
                      <p className={cn(
                        "text-xl font-bold",
                        stats.divergence > 0 ? "text-red-600" : stats.divergence < 0 ? "text-green-600" : ""
                      )}>
                        R$ {Math.abs(stats.divergence).toFixed(2)}
                      </p>
                    </div>
                    {stats.divergence > 0 ? (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    ) : stats.divergence < 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <Minus className="h-8 w-8 text-muted-foreground" />
                    )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="obras" className="gap-2">
                  <Music className="h-4 w-4" />
                  Obras ({filteredWorks.length})
                </TabsTrigger>
                <TabsTrigger value="fonogramas" className="gap-2">
                  <Disc className="h-4 w-4" />
                  Fonogramas ({filteredPhonograms.length})
                </TabsTrigger>
              </TabsList>

              {/* Obras Tab */}
              <TabsContent value="obras">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredWorks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhuma obra encontrada</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Título</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-center p-3">Conferido</th>
                              <th className="text-center p-3">Share</th>
                              <th className="text-right p-3">Esperado</th>
                              <th className="text-right p-3">Recebido</th>
                              <th className="text-right p-3">Divergência</th>
                              <th className="text-center p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredWorks.map(music => {
                              const divergence = ((music as any).royalties_expected || 0) - ((music as any).royalties_received || 0);
                              return (
                                <tr key={music.id} className="border-t border-border hover:bg-muted/30">
                                  <td className="p-3 font-medium">{music.title}</td>
                                  <td className="p-3">{getArtistName(music.artist_id)}</td>
                                  <td className="p-3 text-center">
                                    {(music as any).royalties_verified ? (
                                      <Badge className="bg-green-600">Sim</Badge>
                                    ) : (
                                      <Badge variant="outline">Não</Badge>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    {(music as any).royalties_share_applied === true ? (
                                      <Badge className="bg-green-600">Sim</Badge>
                                    ) : (music as any).royalties_share_applied === false ? (
                                      <Badge className="bg-red-600">Não</Badge>
                                    ) : (
                                      <Badge variant="outline">Pendente</Badge>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">R$ {((music as any).royalties_expected || 0).toFixed(2)}</td>
                                  <td className="p-3 text-right">R$ {((music as any).royalties_received || 0).toFixed(2)}</td>
                                  <td className={cn(
                                    "p-3 text-right font-medium",
                                    divergence > 0 ? "text-red-600" : divergence < 0 ? "text-green-600" : ""
                                  )}>
                                    R$ {Math.abs(divergence).toFixed(2)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(music, "obra")}>
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
              </TabsContent>

              {/* Fonogramas Tab */}
              <TabsContent value="fonogramas">
                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredPhonograms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum fonograma encontrado</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Título</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-center p-3">Conferido</th>
                              <th className="text-center p-3">Share</th>
                              <th className="text-right p-3">Esperado</th>
                              <th className="text-right p-3">Recebido</th>
                              <th className="text-right p-3">Divergência</th>
                              <th className="text-center p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPhonograms.map(phono => {
                              const divergence = ((phono as any).royalties_expected || 0) - ((phono as any).royalties_received || 0);
                              return (
                                <tr key={phono.id} className="border-t border-border hover:bg-muted/30">
                                  <td className="p-3 font-medium">{phono.title}</td>
                                  <td className="p-3">{getArtistName(phono.artist_id)}</td>
                                  <td className="p-3 text-center">
                                    {(phono as any).royalties_verified ? (
                                      <Badge className="bg-green-600">Sim</Badge>
                                    ) : (
                                      <Badge variant="outline">Não</Badge>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    {(phono as any).royalties_share_applied === true ? (
                                      <Badge className="bg-green-600">Sim</Badge>
                                    ) : (phono as any).royalties_share_applied === false ? (
                                      <Badge className="bg-red-600">Não</Badge>
                                    ) : (
                                      <Badge variant="outline">Pendente</Badge>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">R$ {((phono as any).royalties_expected || 0).toFixed(2)}</td>
                                  <td className="p-3 text-right">R$ {((phono as any).royalties_received || 0).toFixed(2)}</td>
                                  <td className={cn(
                                    "p-3 text-right font-medium",
                                    divergence > 0 ? "text-red-600" : divergence < 0 ? "text-green-600" : ""
                                  )}>
                                    R$ {Math.abs(divergence).toFixed(2)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(phono, "fonograma")}>
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
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Royalties</DialogTitle>
            <DialogDescription>
              {selectedItem?.title} - {itemType === "obra" ? "Obra" : "Fonograma"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Royalties Conferidos</Label>
              <Switch checked={royaltiesVerified} onCheckedChange={setRoyaltiesVerified} />
            </div>

            <div className="space-y-2">
              <Label>Share Aplicado</Label>
              <Select 
                value={shareApplied === true ? "yes" : shareApplied === false ? "no" : "pending"} 
                onValueChange={(v) => setShareApplied(v === "yes" ? true : v === "no" ? false : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Esperado (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={royaltiesExpected}
                  onChange={(e) => setRoyaltiesExpected(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Recebido (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={royaltiesReceived}
                  onChange={(e) => setRoyaltiesReceived(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            {royaltiesExpected && royaltiesReceived && (
              <div className={cn(
                "p-3 rounded-lg text-center",
                parseFloat(royaltiesExpected) - parseFloat(royaltiesReceived) > 0 
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : parseFloat(royaltiesExpected) - parseFloat(royaltiesReceived) < 0
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted"
              )}>
                <p className="text-sm font-medium">
                  Divergência: R$ {Math.abs(parseFloat(royaltiesExpected) - parseFloat(royaltiesReceived)).toFixed(2)}
                </p>
              </div>
            )}

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
            <Button onClick={handleSave} disabled={updateMusic.isPending || updatePhonogram.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default GestaoRoyalties;
