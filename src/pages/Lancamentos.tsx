import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ReleaseForm } from "@/components/forms/ReleaseForm";
import { ReleaseCard } from "@/components/releases/ReleaseCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Music, Plus, Calendar, TrendingUp, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReleases, useDeleteRelease } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";
import { formatDateBR, translateStatus } from "@/lib/utils";

const Lancamentos = () => {
  const { toast } = useToast();
  const { data: releasesData = [], isLoading, refetch } = useReleases();
  const { data: artists = [] } = useArtists();
  const deleteRelease = useDeleteRelease();

  // Map releases to include artist name and correct field names
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

  // Update filtered releases when data changes
  useEffect(() => {
    setFilteredReleases(allReleases);
  }, [releasesData, artists]);

  const filterOptions = [
    {
      key: "type",
      label: "Tipo",
      options: ["Single", "EP", "Álbum"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Lançado", "Programado", "Em Produção"]
    },
    {
      key: "artist",
      label: "Artista",
      options: [] // Will be populated from database
    }
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(release =>
        release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
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
              <Button className="gap-2" onClick={handleNewRelease}>
                <Plus className="h-4 w-4" />
                Novo Lançamento
              </Button>
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
              <CardContent>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {filteredReleases.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditRelease}
                        onDelete={handleDeleteRelease}
                      />
                    ))}
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
                    {/* Capa e Informações Principais */}
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
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {selectedRelease.type || selectedRelease.release_type || 'Single'}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            selectedRelease.approvalStatus === 'aceita' ? 'bg-green-500/10 text-green-500' :
                            selectedRelease.approvalStatus === 'pendente' ? 'bg-yellow-500/10 text-yellow-500' :
                            selectedRelease.approvalStatus === 'recusada' ? 'bg-red-500/10 text-red-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {selectedRelease.approvalStatus === 'aceita' ? 'Aceita' :
                             selectedRelease.approvalStatus === 'pendente' ? 'Pendente' :
                             selectedRelease.approvalStatus === 'recusada' ? 'Recusada' : 'Em Espera'}
                          </span>
                          {selectedRelease.hasMarketingPlan && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              selectedRelease.priority === 'alta' ? 'bg-destructive/10 text-destructive' :
                              selectedRelease.priority === 'media' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-green-500/10 text-green-500'
                            }`}>
                              Prioridade: {selectedRelease.priority === 'alta' ? 'Alta' : 
                                           selectedRelease.priority === 'media' ? 'Média' : 'Baixa'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informações Detalhadas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="font-medium capitalize">{selectedRelease.status || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Lançamento</label>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDateBR(selectedRelease.releaseDate || selectedRelease.release_date)}
                        </p>
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

                    {/* Distribuidoras */}
                    {selectedRelease.distributors && selectedRelease.distributors.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Distribuidoras</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedRelease.distributors.map((distributor: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-secondary text-secondary-foreground capitalize"
                            >
                              {distributor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Faixas */}
                    {selectedRelease.tracks && selectedRelease.tracks.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Faixas ({selectedRelease.tracks.length})</label>
                        <div className="space-y-2">
                          {selectedRelease.tracks.map((track: any, index: number) => (
                            <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{index + 1}. {track.title}</h4>
                                {track.isrc && (
                                  <span className="text-xs font-mono text-muted-foreground">ISRC: {track.isrc}</span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                {track.composers && track.composers.length > 0 && (
                                  <div>
                                    <span className="font-medium">Compositores:</span> {Array.isArray(track.composers) ? track.composers.join(', ') : track.composers}
                                  </div>
                                )}
                                {track.performers && track.performers.length > 0 && (
                                  <div>
                                    <span className="font-medium">Intérpretes:</span> {Array.isArray(track.performers) ? track.performers.join(', ') : track.performers}
                                  </div>
                                )}
                                {track.producers && track.producers.length > 0 && (
                                  <div>
                                    <span className="font-medium">Produtores:</span> {Array.isArray(track.producers) ? track.producers.join(', ') : track.producers}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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