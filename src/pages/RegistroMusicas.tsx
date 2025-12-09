import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MusicEditModal } from "@/components/modals/MusicEditModal";
import { MusicViewModal } from "@/components/modals/MusicViewModal";
import { PhonogramEditModal } from "@/components/modals/PhonogramEditModal";
import { PhonogramViewModal } from "@/components/modals/PhonogramViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Music, Plus, FileText, CheckCircle, Clock, Disc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry, useDeleteMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { usePhonograms, useDeletePhonogram } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { formatDateBR, translateStatus } from "@/lib/utils";

const RegistroMusicas = () => {
  const { data: musicRegistry = [], isLoading: isLoadingWorks } = useMusicRegistry();
  const { data: phonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: artists = [] } = useArtists();
  const deleteMusicEntry = useDeleteMusicRegistryEntry();
  const deletePhonogram = useDeletePhonogram();
  
  const [activeTab, setActiveTab] = useState("obras");
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [filteredPhonograms, setFilteredPhonograms] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Work modals
  const [newMusicModalOpen, setNewMusicModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  
  // Phonogram modals
  const [newPhonogramModalOpen, setNewPhonogramModalOpen] = useState(false);
  const [editPhonogramModalOpen, setEditPhonogramModalOpen] = useState(false);
  const [viewPhonogramModalOpen, setViewPhonogramModalOpen] = useState(false);
  const [deletePhonogramModalOpen, setDeletePhonogramModalOpen] = useState(false);
  const [selectedPhonogram, setSelectedPhonogram] = useState<any>(null);

  const getStatusDisplay = (status: string | null) => {
    return translateStatus(status) || 'Pendente';
  };

  // Transform music registry data
  const allSongs = musicRegistry.map(music => {
    const artist = artists.find(a => a.id === music.artist_id);
    return {
      ...music,
      artist: artist?.name || 'N/A',
      statusDisplay: getStatusDisplay(music.status),
      composers: music.writers || [],
      registrationDate: formatDateBR(music.created_at),
    };
  });

  // Transform phonograms data
  const allPhonograms = phonograms.map(phono => {
    // Primeiro tenta buscar artista do fonograma, depois da obra vinculada
    const linkedWork = musicRegistry.find(m => m.id === phono.work_id);
    const artistId = phono.artist_id || linkedWork?.artist_id;
    const artist = artists.find(a => a.id === artistId);
    const workParticipants = linkedWork?.participants as any[] || [];
    const composers = workParticipants
      .filter((p: any) => p.role === 'compositor' || p.role === 'compositor_autor')
      .map((p: any) => p.name);
    return {
      ...phono,
      artistName: artist?.name || 'N/A',
      statusDisplay: getStatusDisplay(phono.status),
      registrationDate: formatDateBR(phono.created_at),
      workComposers: composers.length > 0 ? composers : (linkedWork?.writers || []),
      abramus_code: linkedWork?.abramus_code || null,
      ecad_code: linkedWork?.ecad_code || null,
    };
  });

  useEffect(() => {
    setFilteredSongs(allSongs);
  }, [musicRegistry, artists]);

  useEffect(() => {
    setFilteredPhonograms(allPhonograms);
  }, [phonograms, artists, musicRegistry]);

  const filterOptions = [
    {
      key: "status",
      label: "Situação",
      options: ["Em Análise", "Aceita", "Pendente", "Recusada"]
    },
    {
      key: "genre",
      label: "Gênero",
      options: ["MPB", "Rock", "Pop", "Sertanejo", "Funk", "Trap", "Eletrônica"]
    }
  ];

  // Work handlers
  const handleSearchWorks = (searchTerm: string) => {
    filterWorks(searchTerm, {});
  };

  const handleFilterWorks = (filters: Record<string, string>) => {
    filterWorks("", filters);
  };

  const handleClearWorks = () => {
    setFilteredSongs(allSongs);
  };

  const filterWorks = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allSongs;

    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.isrc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.iswc || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(song => {
          if (key === "status") return song.statusDisplay === value;
          if (key === "genre") return song.genre === value;
          return true;
        });
      }
    });

    setFilteredSongs(filtered);
  };

  // Phonogram handlers
  const handleSearchPhonograms = (searchTerm: string) => {
    filterPhonograms(searchTerm, {});
  };

  const handleFilterPhonograms = (filters: Record<string, string>) => {
    filterPhonograms("", filters);
  };

  const handleClearPhonograms = () => {
    setFilteredPhonograms(allPhonograms);
  };

  const filterPhonograms = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allPhonograms;

    if (searchTerm) {
      filtered = filtered.filter(phono =>
        phono.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phono.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (phono.isrc || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(phono => {
          if (key === "status") return phono.statusDisplay === value;
          if (key === "genre") return phono.genre === value;
          return true;
        });
      }
    });

    setFilteredPhonograms(filtered);
  };

  const handleEditSong = (song: any) => {
    setSelectedSong(song);
    setEditModalOpen(true);
  };

  const handleViewSong = (song: any) => {
    setSelectedSong(song);
    setViewModalOpen(true);
  };

  const handleEditPhonogram = (phonogram: any) => {
    setSelectedPhonogram(phonogram);
    setEditPhonogramModalOpen(true);
  };

  const handleViewPhonogram = (phonogram: any) => {
    setSelectedPhonogram(phonogram);
    setViewPhonogramModalOpen(true);
  };

  // Calculate KPIs based on active tab
  const worksKPIs = {
    total: allSongs.length,
    pending: allSongs.filter(s => s.statusDisplay === "Pendente").length,
    inReview: allSongs.filter(s => s.statusDisplay === "Em Análise").length,
    accepted: allSongs.filter(s => s.statusDisplay === "Aceita").length,
    approvalRate: allSongs.length > 0 ? Math.round((allSongs.filter(s => s.statusDisplay === "Aceita").length / allSongs.length) * 100) : 0,
  };

  const phonogramsKPIs = {
    total: allPhonograms.length,
    pending: allPhonograms.filter(s => s.statusDisplay === "Pendente").length,
    inReview: allPhonograms.filter(s => s.statusDisplay === "Em Análise").length,
    accepted: allPhonograms.filter(s => s.statusDisplay === "Aceita").length,
    approvalRate: allPhonograms.length > 0 ? Math.round((allPhonograms.filter(s => s.statusDisplay === "Aceita").length / allPhonograms.length) * 100) : 0,
  };

  const currentKPIs = activeTab === "obras" ? worksKPIs : phonogramsKPIs;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">Registro de Músicas</h1>
                <p className="text-muted-foreground">
                  Registro e controle de obras musicais e fonogramas
                </p>
              </div>
              <Button 
                className="gap-2" 
                onClick={() => activeTab === "obras" ? setNewMusicModalOpen(true) : setNewPhonogramModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {activeTab === "obras" ? "Nova Obra" : "Novo Fonograma"}
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <DashboardCard
                title="Total de Obras e Fonogramas"
                value={currentKPIs.total}
                description="registrados no sistema"
                icon={activeTab === "obras" ? Music : Disc}
              />
              <DashboardCard
                title="Pendentes de Registro"
                value={currentKPIs.pending}
                description="aguardando análise"
                icon={FileText}
              />
              <DashboardCard
                title="Em Revisão"
                value={currentKPIs.inReview}
                description="em análise"
                icon={Clock}
              />
              <DashboardCard
                title="Registro Aceito"
                value={currentKPIs.accepted}
                description="aprovados"
                icon={CheckCircle}
              />
              <DashboardCard
                title="Taxa de Aprovação"
                value={`${currentKPIs.approvalRate}%`}
                description="registros aprovados"
                icon={CheckCircle}
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="obras" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  Obras
                </TabsTrigger>
                <TabsTrigger value="fonogramas" className="flex items-center gap-2">
                  <Disc className="h-4 w-4" />
                  Fonogramas
                </TabsTrigger>
              </TabsList>

              {/* Obras Tab */}
              <TabsContent value="obras" className="space-y-4">
                <SearchFilter
                  searchPlaceholder="Buscar obras por título, artista ou ISWC..."
                  filters={filterOptions}
                  onSearch={handleSearchWorks}
                  onFilter={handleFilterWorks}
                  onClear={handleClearWorks}
                />

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Obras Registradas</CardTitle>
                    <CardDescription>
                      Catálogo completo de obras musicais registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allSongs.length === 0 ? (
                      <div className="text-center py-12">
                        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma obra registrada</h3>
                        <p className="text-muted-foreground mb-4">
                          Comece registrando sua primeira obra musical
                        </p>
                        <Button onClick={() => setNewMusicModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Primeira Obra
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredSongs.map((song) => (
                          <div
                            key={song.id}
                            className="grid grid-cols-[1fr_auto] gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Music className="h-6 w-6 text-primary" />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h3 className="font-medium text-foreground">{song.title}</h3>
                                <Badge 
                                  variant={
                                    song.statusDisplay === "Aceita" ? "default" :
                                    song.statusDisplay === "Recusada" ? "destructive" :
                                    song.statusDisplay === "Em Análise" ? "outline" : "secondary"
                                  }
                                >
                                  {song.statusDisplay}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm flex-shrink-0">
                              <div className="text-left min-w-[100px]">
                                <div className="text-muted-foreground text-xs">Cód. ABRAMUS</div>
                                <div className="font-medium text-foreground">{song.abramus_code || "-"}</div>
                              </div>
                              <div className="text-left min-w-[100px]">
                                <div className="text-muted-foreground text-xs">Cód. ECAD</div>
                                <div className="font-medium text-foreground">{song.ecad_code || "-"}</div>
                              </div>
                              <div className="text-left min-w-[180px]">
                                <div className="text-muted-foreground text-xs">Compositores/Autor</div>
                                <div className="font-medium text-foreground" title={song.composers?.join(", ") || "-"}>
                                  {song.composers?.join(", ") || "-"}
                                </div>
                              </div>
                              <div className="text-left min-w-[120px]">
                                <div className="text-muted-foreground text-xs">Editora</div>
                                <div className="font-medium text-foreground" title={song.publishers?.join(", ") || "-"}>
                                  {song.publishers?.join(", ") || "-"}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button variant="outline" size="sm" onClick={() => handleViewSong(song)}>
                                  Ver
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditSong(song)}>
                                  Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedSong(song);
                                  setDeleteModalOpen(true);
                                }}>
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fonogramas Tab */}
              <TabsContent value="fonogramas" className="space-y-4">
                <SearchFilter
                  searchPlaceholder="Buscar fonogramas por título, artista ou ISRC..."
                  filters={filterOptions}
                  onSearch={handleSearchPhonograms}
                  onFilter={handleFilterPhonograms}
                  onClear={handleClearPhonograms}
                />

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Fonogramas Registrados</CardTitle>
                    <CardDescription>
                      Catálogo completo de gravações registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {allPhonograms.length === 0 ? (
                      <div className="text-center py-12">
                        <Disc className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhum fonograma registrado</h3>
                        <p className="text-muted-foreground mb-4">
                          Comece registrando seu primeiro fonograma
                        </p>
                        <Button onClick={() => setNewPhonogramModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Primeiro Fonograma
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPhonograms.map((phono) => (
                          <div
                            key={phono.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Disc className="h-6 w-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-medium text-foreground">{phono.title}</h3>
                                <Badge 
                                  variant={
                                    phono.statusDisplay === "Aceita" ? "default" :
                                    phono.statusDisplay === "Recusada" ? "destructive" :
                                    phono.statusDisplay === "Em Análise" ? "outline" : "secondary"
                                  }
                                >
                                  {phono.statusDisplay}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <div className="text-center">
                                <div className="text-muted-foreground text-xs">Cód Abramus</div>
                                <div className="font-medium text-foreground text-xs">{(phono as any).abramus_code || "-"}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground text-xs">Cód ECAD</div>
                                <div className="font-medium text-foreground text-xs">{(phono as any).ecad_code || "-"}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-muted-foreground text-xs">ISRC</div>
                                <div className="font-medium text-foreground text-xs">{phono.isrc || "-"}</div>
                              </div>
                              <div className="text-center flex-1">
                                <div className="text-muted-foreground text-xs">Compositores</div>
                                <div className="font-medium text-foreground text-xs truncate">
                                  {(phono as any).workComposers?.join(', ') || "-"}
                                </div>
                              </div>
                              <div className="text-center flex-1">
                                <div className="text-muted-foreground text-xs">Intérpretes</div>
                                <div className="font-medium text-foreground text-xs truncate">
                                  {phono.participants?.filter((p: any) => p.role === 'interprete').map((p: any) => p.name).join(', ') || "-"}
                                </div>
                              </div>
                              <div className="text-center flex-1">
                                <div className="text-muted-foreground text-xs">Músicos</div>
                                <div className="font-medium text-foreground text-xs truncate">
                                  {phono.participants?.filter((p: any) => p.role === 'musico' || p.role === 'musico_acompanhante').map((p: any) => p.name).join(', ') || "-"}
                                </div>
                              </div>
                              <div className="flex gap-2 ml-auto">
                                <Button variant="outline" size="sm" onClick={() => handleViewPhonogram(phono)}>
                                  Ver
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditPhonogram(phono)}>
                                  Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  setSelectedPhonogram(phono);
                                  setDeletePhonogramModalOpen(true);
                                }}>
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Work Modals */}
            <MusicEditModal 
              open={newMusicModalOpen || editModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setNewMusicModalOpen(false);
                  setEditModalOpen(false);
                }
              }}
              song={editModalOpen ? selectedSong : null}
            />

            <MusicViewModal 
              open={viewModalOpen}
              onOpenChange={setViewModalOpen}
              song={selectedSong}
            />

            <DeleteConfirmationModal
              open={deleteModalOpen}
              onOpenChange={setDeleteModalOpen}
              onConfirm={async () => {
                if (selectedSong) {
                  try {
                    await deleteMusicEntry.mutateAsync(selectedSong.id);
                    setDeleteModalOpen(false);
                    setSelectedSong(null);
                  } catch (error) {
                    console.error('Error deleting music:', error);
                  }
                }
              }}
              title="Excluir Obra"
              description={`Tem certeza que deseja excluir a obra "${selectedSong?.title}"? Esta ação não pode ser desfeita.`}
            />

            {/* Phonogram Modals */}
            <PhonogramEditModal 
              open={newPhonogramModalOpen || editPhonogramModalOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setNewPhonogramModalOpen(false);
                  setEditPhonogramModalOpen(false);
                }
              }}
              phonogram={editPhonogramModalOpen ? selectedPhonogram : null}
            />

            <PhonogramViewModal 
              open={viewPhonogramModalOpen}
              onOpenChange={setViewPhonogramModalOpen}
              phonogram={selectedPhonogram}
            />

            <DeleteConfirmationModal
              open={deletePhonogramModalOpen}
              onOpenChange={setDeletePhonogramModalOpen}
              onConfirm={async () => {
                if (selectedPhonogram) {
                  try {
                    await deletePhonogram.mutateAsync(selectedPhonogram.id);
                    setDeletePhonogramModalOpen(false);
                    setSelectedPhonogram(null);
                  } catch (error) {
                    console.error('Error deleting phonogram:', error);
                  }
                }
              }}
              title="Excluir Fonograma"
              description={`Tem certeza que deseja excluir o fonograma "${selectedPhonogram?.title}"? Esta ação não pode ser desfeita.`}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RegistroMusicas;
