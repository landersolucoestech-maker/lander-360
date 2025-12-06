import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MusicEditModal } from "@/components/modals/MusicEditModal";
import { MusicViewModal } from "@/components/modals/MusicViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { Music, Plus, FileText, CheckCircle, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry, useDeleteMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { useArtists } from "@/hooks/useArtists";

const RegistroMusicas = () => {
  const { data: musicRegistry = [], isLoading } = useMusicRegistry();
  const { data: artists = [] } = useArtists();
  const deleteMusicEntry = useDeleteMusicRegistryEntry();
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const { toast } = useToast();
  const [newMusicModalOpen, setNewMusicModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  // Transform music registry data to display format
  const allSongs = musicRegistry.map(music => {
    const artist = artists.find(a => a.id === music.artist_id);
    // Map status to display values
    const getStatusDisplay = (status: string | null) => {
      switch (status) {
        case 'em_analise': return 'Em Análise';
        case 'aceita': return 'Aceita';
        case 'pendente': return 'Pendente';
        case 'recusada': return 'Recusada';
        case 'draft': return 'Pendente';
        default: return 'Pendente';
      }
    };
    return {
      // Keep original data for editing
      ...music,
      // Display fields
      artist: artist?.name || 'N/A',
      statusDisplay: getStatusDisplay(music.status),
      composers: music.writers || [],
      registrationDate: new Date(music.created_at).toLocaleDateString('pt-BR'),
    };
  });

  useEffect(() => {
    setFilteredSongs(allSongs);
  }, [musicRegistry, artists]);

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

  const handleSearch = (searchTerm: string) => {
    filterSongs(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterSongs("", filters);
  };

  const handleClear = () => {
    setFilteredSongs(allSongs);
  };

  const filterSongs = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allSongs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.isrc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.iswc || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
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

  const handleEditSong = (song) => {
    setSelectedSong(song);
    setEditModalOpen(true);
  };

  const handleViewSong = (song) => {
    setSelectedSong(song);
    setViewModalOpen(true);
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
                <h1 className="text-3xl font-bold text-foreground">Registro de Músicas</h1>
                <p className="text-muted-foreground">
                  Registro e controle de obras musicais
                </p>
              </div>
              <Button className="gap-2" onClick={() => setNewMusicModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Música
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <DashboardCard
                title="Total de Músicas"
                value={allSongs.length}
                description="registradas no sistema"
                icon={Music}
                trend={{ value: 15, isPositive: true }}
              />
              <DashboardCard
                title="Pendentes de Registro"
                value={allSongs.filter(s => s.status === "Pendente").length}
                description="aguardando aprovação"
                icon={FileText}
                trend={{ value: 3, isPositive: false }}
              />
              <DashboardCard
                title="Em Revisão"
                value={allSongs.filter(s => s.status === "Revisão").length}
                description="em análise"
                icon={Clock}
                trend={{ value: 2, isPositive: true }}
              />
              <DashboardCard
                title="Taxa de Aprovação"
                value={allSongs.length > 0 ? `${Math.round((allSongs.filter(s => s.status === "Registrado" || s.status === "Aprovado").length / allSongs.length) * 100)}%` : "0%"}
                description="músicas aprovadas"
                icon={CheckCircle}
                trend={{ value: 8, isPositive: true }}
              />
              <DashboardCard
                title="Receita Estimada"
                value={`R$ ${(allSongs.length * 1250).toLocaleString('pt-BR')}`}
                description="projeção de direitos"
                icon={DollarSign}
                trend={{ value: 12, isPositive: true }}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar músicas por título, artista, ISRC ou ISWC..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Songs List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Músicas Registradas</CardTitle>
                <CardDescription>
                  Catálogo completo de obras musicais registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allSongs.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma música registrada</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece registrando sua primeira obra musical
                    </p>
                    <Button onClick={() => setNewMusicModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Primeira Música
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSongs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Music className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
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
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">Cód. ABRAMUS</div>
                            <div className="font-medium text-foreground">{(song as any).abramus_code || "-"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Cód. ECAD</div>
                            <div className="font-medium text-foreground">{(song as any).ecad_code || "-"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Participantes</div>
                            <div className="font-medium text-foreground">{song.composers?.join(", ") || "-"}</div>
                          </div>
                          <div className="flex gap-2">
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
              title="Excluir Música"
              description={`Tem certeza que deseja excluir a música "${selectedSong?.title}"? Esta ação não pode ser desfeita.`}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RegistroMusicas;