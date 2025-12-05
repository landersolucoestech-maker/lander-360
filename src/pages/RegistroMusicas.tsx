import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { MusicEditModal } from "@/components/modals/MusicEditModal";
import { MusicViewModal } from "@/components/modals/MusicViewModal";
import { Music, Plus, FileText, CheckCircle, DollarSign } from "lucide-react";
import { mockSongs } from "@/data/mockData";

const RegistroMusicas = () => {
  const allSongs = mockSongs;

  const [filteredSongs, setFilteredSongs] = useState(allSongs);
  const [newMusicModalOpen, setNewMusicModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: ["Registrado", "Pendente", "Revisão", "Aprovado"]
    },
    {
      key: "genre",
      label: "Gênero",
      options: ["MPB", "Rock", "Pop", "Sertanejo", "Funk"]
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
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.isrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.iswc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.ecad.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(song => {
          if (key === "status") return song.status === value;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total de Músicas"
                value={0}
                description="registradas no sistema"
                icon={Music}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Pendentes de Registro"
                value={0}
                description="aguardando aprovação"
                icon={FileText}
                trend={{ value: 0, isPositive: false }}
              />
              <DashboardCard
                title="Taxa de Aprovação"
                value="0%"
                description="músicas aprovadas"
                icon={CheckCircle}
                trend={{ value: 0, isPositive: true }}
              />
              <DashboardCard
                title="Receita Estimada"
                value="R$ 0"
                description="projeção de direitos"
                icon={DollarSign}
                trend={{ value: 0, isPositive: true }}
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
                            <div className="text-sm text-muted-foreground">{song.artist}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  song.status === "Registrado" ? "default" :
                                  song.status === "Pendente" ? "secondary" : "outline"
                                }
                              >
                                {song.status}
                              </Badge>
                              <Badge variant="secondary">{song.genre}</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground">ISRC</div>
                            <div className="font-medium text-foreground">{song.isrc}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Duração</div>
                            <div className="font-medium">{song.duration}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Registro</div>
                            <div className="font-medium">{song.registrationDate}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewSong(song)}>
                              Ver
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditSong(song)}>
                              Editar
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RegistroMusicas;