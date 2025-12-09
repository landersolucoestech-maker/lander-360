import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ReleaseForm } from "@/components/forms/ReleaseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Music, Plus, Calendar, TrendingUp, Eye, AlertTriangle, Upload, Download, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { useReleases, useDeleteRelease, useCreateRelease } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";
import { formatDateBR, translateStatus } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const Lancamentos = () => {
  const { toast } = useToast();
  const { data: releasesData = [], isLoading, refetch } = useReleases();
  const { data: artists = [] } = useArtists();
  const deleteRelease = useDeleteRelease();
  const createRelease = useCreateRelease();

  const allReleases = releasesData.map((release: any) => {
    const artist = artists.find((a: any) => a.id === release.artist_id);
    return {
      ...release,
      artist: artist?.stage_name || artist?.name || 'Artista Desconhecido',
      cover: release.cover_url,
      releaseDate: release.release_date || new Date().toISOString(),
      approvalStatus: release.status === 'released' ? 'aceita' : 
                      release.status === 'cancelled' ? 'recusada' : 
                      release.status === 'paused' ? 'em_espera' : 'pendente',
      priority: 'media',
    };
  });

  const [filteredReleases, setFilteredReleases] = useState<any[]>([]);
  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const dataToExport = filteredReleases.map((release: any) => ({
      'Título': release.title || '',
      'Artista': release.artist || '',
      'Tipo': release.type || '',
      'Data Lançamento': release.releaseDate || '',
      'Status': release.approvalStatus || '',
      'Gênero': release.genre || '',
      'Idioma': release.language || '',
      'Gravadora': release.label || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos');
    XLSX.writeFile(wb, `lancamentos_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Sucesso', description: 'Arquivo exportado com sucesso!' });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        let successCount = 0;
        let errorCount = 0;

        for (const row of jsonData as any[]) {
          try {
            await createRelease.mutateAsync({
              title: row['Título'] || row['title'] || 'Lançamento Importado',
              type: row['Tipo']?.toLowerCase() || row['type'] || 'single',
              release_date: row['Data Lançamento'] || row['release_date'] || null,
              genre: row['Gênero'] || row['genre'] || null,
              language: row['Idioma'] || row['language'] || null,
              label: row['Gravadora'] || row['label'] || null,
              status: 'planning',
            });
            successCount++;
          } catch (err) {
            errorCount++;
            console.error('Error importing row:', err);
          }
        }

        toast({ 
          title: 'Importação concluída', 
          description: `${successCount} lançamentos importados com sucesso. ${errorCount > 0 ? `${errorCount} erros.` : ''}` 
        });
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao processar arquivo.', variant: 'destructive' });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredReleases.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) {
        await deleteRelease.mutateAsync(id);
      }
      toast({
        title: "Lançamentos excluídos",
        description: `${selectedItems.length} lançamentos foram excluídos com sucesso.`,
      });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir alguns lançamentos.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  useEffect(() => {
    setFilteredReleases(allReleases);
  }, [releasesData, artists]);

  const filterOptions = [
    { key: "type", label: "Tipo", options: ["Single", "EP", "Álbum"] },
    { key: "status", label: "Status", options: ["Lançado", "Programado", "Em Produção"] },
    { key: "artist", label: "Artista", options: [] }
  ];

  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});

  const handleSearch = (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    filterReleases(searchTerm, currentFilters);
  };

  const handleFilter = (filters: Record<string, string>) => {
    setCurrentFilters(filters);
    filterReleases(currentSearchTerm, filters);
  };

  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredReleases(allReleases);
  };

  const filterReleases = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allReleases;

    if (searchTerm) {
      filtered = filtered.filter(release =>
        release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(release => {
          if (key === "type") return release.type === value;
          if (key === "status") return release.status === value;
          if (key === "artist") return release.artist === value;
          return true;
        });
      }
    });

    setFilteredReleases(filtered);
  };

  const handleNewRelease = () => {
    setIsNewReleaseModalOpen(true);
  };

  const handleViewDetails = (release: any) => {
    setSelectedRelease(release);
    setIsDetailsModalOpen(true);
  };

  const handleEditRelease = (release: any) => {
    setSelectedRelease(release);
    setIsEditModalOpen(true);
  };

  const handleDeleteRelease = (release: any) => {
    setReleaseToDelete(release);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRelease = async () => {
    if (releaseToDelete) {
      try {
        await deleteRelease.mutateAsync(releaseToDelete.id);
        setIsDeleteModalOpen(false);
        setReleaseToDelete(null);
      } catch (error) {
        console.error('Error deleting release:', error);
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Lançamentos</h1>
                <p className="text-muted-foreground">
                  Gestão de lançamentos e distribuição musical
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    className="gap-2" 
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir ({selectedItems.length})
                  </Button>
                )}
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <label>
                  <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" disabled={isImporting} />
                  <Button variant="outline" className="gap-2" asChild disabled={isImporting}>
                    <span><Upload className="h-4 w-4" />{isImporting ? 'Importando...' : 'Importar'}</span>
                  </Button>
                </label>
                <Button className="gap-2" onClick={handleNewRelease}>
                  <Plus className="h-4 w-4" />
                  Novo Lançamento
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            {(() => {
              const activeReleases = allReleases.filter(r => r.status === 'released' || r.approvalStatus === 'aceita').length;
              const scheduledReleases = allReleases.filter(r => {
                if (!r.releaseDate) return false;
                const releaseDate = new Date(r.releaseDate);
                const now = new Date();
                const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                return releaseDate > now && releaseDate <= thirtyDaysFromNow;
              }).length;
              const totalStreams = allReleases.reduce((sum, r) => sum + (r.streams || 0), 0);
              const takedowns = allReleases.filter(r => r.takedown).length;
              const performanceRate = allReleases.length > 0 
                ? Math.round((activeReleases / allReleases.length) * 100) 
                : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <DashboardCard
                    title="Lançamentos Ativos"
                    value={activeReleases}
                    description="disponíveis nas plataformas"
                    icon={Music}
                    trend={{ value: activeReleases, isPositive: true }}
                  />
                  <DashboardCard
                    title="Programados"
                    value={scheduledReleases}
                    description="próximos 30 dias"
                    icon={Calendar}
                    trend={{ value: scheduledReleases, isPositive: true }}
                  />
                  <DashboardCard
                    title="Performance"
                    value={`${performanceRate}%`}
                    description="taxa de crescimento"
                    icon={TrendingUp}
                    trend={{ value: performanceRate, isPositive: performanceRate > 0 }}
                  />
                  <DashboardCard
                    title="Total de Streams"
                    value={totalStreams.toLocaleString('pt-BR')}
                    description="reproduções acumuladas"
                    icon={Eye}
                    trend={{ value: totalStreams, isPositive: true }}
                  />
                  <DashboardCard
                    title="Takedowns"
                    value={takedowns}
                    description="lançamentos removidos"
                    icon={AlertTriangle}
                    className="border-orange-500/30"
                  />
                </div>
              );
            })()}

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar lançamentos por título ou artista..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Releases List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Lançamentos</CardTitle>
                <CardDescription>
                  Acompanhe todos os seus lançamentos musicais
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                {allReleases.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum lançamento cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando seu primeiro lançamento musical
                    </p>
                    <Button onClick={handleNewRelease}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Lançamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Checkbox
                        checked={selectedItems.length === filteredReleases.length && filteredReleases.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">Selecionar todos</span>
                    </div>
                    <div className="space-y-3">
                      {filteredReleases.map((release) => (
                        <div
                          key={release.id}
                          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            checked={selectedItems.includes(release.id)}
                            onCheckedChange={(checked) => handleSelectItem(release.id, !!checked)}
                          />
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                            {release.cover ? (
                              <img src={release.cover} alt={release.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-medium">{release.title}</h3>
                            <p className="text-sm text-muted-foreground">{release.artist}</p>
                            <div className="flex gap-2">
                              <Badge variant="secondary">{release.type || 'Single'}</Badge>
                              <Badge variant={release.approvalStatus === 'aceita' ? 'default' : 'outline'}>
                                {release.approvalStatus === 'aceita' ? 'Aceita' : 
                                 release.approvalStatus === 'pendente' ? 'Pendente' : 
                                 release.approvalStatus === 'recusada' ? 'Recusada' : 'Em Espera'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(release)}>
                              Ver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditRelease(release)}>
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRelease(release)}>
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New Release Modal */}
            <Dialog open={isNewReleaseModalOpen} onOpenChange={setIsNewReleaseModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Lançamento</DialogTitle>
                </DialogHeader>
                <ReleaseForm
                  onSuccess={() => setIsNewReleaseModalOpen(false)}
                  onCancel={() => setIsNewReleaseModalOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Release Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Lançamento</DialogTitle>
                </DialogHeader>
                <ReleaseForm
                  release={selectedRelease}
                  onSuccess={() => {
                    setIsEditModalOpen(false);
                    setSelectedRelease(null);
                  }}
                  onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedRelease(null);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
              onConfirm={confirmDeleteRelease}
              title="Excluir Lançamento"
              description={`Tem certeza que deseja excluir o lançamento "${releaseToDelete?.title}"? Esta ação não pode ser desfeita.`}
            />

            {/* Bulk Delete Modal */}
            <DeleteConfirmationModal
              open={isBulkDeleteModalOpen}
              onOpenChange={setIsBulkDeleteModalOpen}
              onConfirm={confirmBulkDelete}
              title="Excluir Lançamentos Selecionados"
              description={`Tem certeza que deseja excluir ${selectedItems.length} lançamentos? Esta ação não pode ser desfeita.`}
            />

            {/* View Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Detalhes do Lançamento
                  </DialogTitle>
                </DialogHeader>
                {selectedRelease && (
                  <div className="space-y-6">
                    <div className="flex gap-6">
                      {(selectedRelease.cover || selectedRelease.cover_url) && (
                        <div className="flex-shrink-0">
                          <img 
                            src={selectedRelease.cover || selectedRelease.cover_url} 
                            alt={selectedRelease.title}
                            className="w-40 h-40 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold">{selectedRelease.title}</h3>
                          <p className="text-lg text-muted-foreground">{selectedRelease.artist}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>{selectedRelease.type || 'Single'}</Badge>
                          <Badge variant={selectedRelease.approvalStatus === 'aceita' ? 'default' : 'secondary'}>
                            {selectedRelease.approvalStatus === 'aceita' ? 'Aceita' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="font-medium capitalize">{selectedRelease.status || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Lançamento</label>
                        <p className="font-medium">{formatDateBR(selectedRelease.releaseDate || selectedRelease.release_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                        <p className="font-medium capitalize">{selectedRelease.genre || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Idioma</label>
                        <p className="font-medium capitalize">{selectedRelease.language || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gravadora</label>
                        <p className="font-medium">{selectedRelease.label || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Copyright</label>
                        <p className="font-medium">{selectedRelease.copyright || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Lancamentos;