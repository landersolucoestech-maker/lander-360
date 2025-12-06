import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { useArtists, useArtistsCount } from "@/hooks/useArtists";
import { useArtistPageTrends } from "@/hooks/useTrends";
import { Users, Plus, Music, DollarSign, Star } from "lucide-react";
import { mockArtists } from "@/data/mockData";

const Artistas = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: artists, isLoading, error } = useArtists();
  const { data: artistsCount } = useArtistsCount();
  const { data: trends } = useArtistPageTrends();
  const [filteredArtists, setFilteredArtists] = useState<any[]>([]);

  // Transform database artists to match UI format - pass complete database data
  const transformDatabaseArtist = (dbArtist: any) => {
    const profileType = dbArtist.profile_type?.trim() || '';
    const hasManager = ['Com Empresário', 'Gravadora', 'Editora'].includes(profileType) && 
                       (dbArtist.manager_name || dbArtist.manager_phone || dbArtist.manager_email);
    
    console.log('Artist transform:', {
      name: dbArtist.name,
      profile_type: profileType,
      hasManager,
      manager_name: dbArtist.manager_name,
      manager_phone: dbArtist.manager_phone,
      manager_email: dbArtist.manager_email
    });
    
    return {
      // Pass the raw database artist for edit mode
      ...dbArtist,
      id: dbArtist.id,
      name: dbArtist.name || dbArtist.stage_name,
      genre: dbArtist.genre || 'Não informado',
      status: dbArtist.contract_status || 'ativo',
      email: dbArtist.email || 'Não informado',
      avatar: dbArtist.image_url,
      socialMedia: {
        instagram: dbArtist.instagram,
        spotify: dbArtist.spotify_url,
        youtube: dbArtist.youtube_url,
        tiktok: dbArtist.tiktok,
        soundcloud: dbArtist.soundcloud,
      },
      stats: {
        projetos: 0,
        obras: 0,
        fonogramas: 0,
        lancamentos: 0,
        streams: '0'
      },
      // Dados do responsável/empresário quando aplicável
      responsible: hasManager ? {
        nome: dbArtist.manager_name || 'Não informado',
        email: dbArtist.manager_email || 'Não informado',
        telefone: dbArtist.manager_phone || 'Não informado'
      } : null,
      // Dados pessoais do artista
      profile: {
        nome: dbArtist.full_name || dbArtist.name || 'Não informado',
        email: dbArtist.email || 'Não informado',
        telefone: dbArtist.phone || 'Não informado'
      },
      gravadora: profileType || 'Independente'
    };
  };

  // Use mock data when no database artists exist
  const displayArtists = artists?.length 
    ? artists.map(transformDatabaseArtist)
    : mockArtists;
  
  const currentArtists = filteredArtists.length ? filteredArtists : displayArtists;

  const filterOptions = [
    {
      key: "genre",
      label: "Gênero",
      options: ["Funk", "Rock", "Pop", "MPB", "Sertanejo"]
    },
    {
      key: "status",
      label: "Status",
      options: ["Ativo", "Inativo"]
    },
    {
      key: "perfil",
      label: "Perfil",
      options: ["Independente", "Gravadora", "Produtor", "Compositor"]
    }
  ];

  const handleSearch = (searchTerm: string) => {
    filterArtists(searchTerm, {});
  };

  const handleFilter = (filters: Record<string, string>) => {
    filterArtists("", filters);
  };

  const handleClear = () => {
    setFilteredArtists(displayArtists);
  };

  const filterArtists = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = displayArtists;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((artist: any) =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((artist: any) => {
          if (key === "genre") return artist.genre === value;
          if (key === "status") return artist.status === value;
          if (key === "perfil") return artist.perfil === value;
          return true;
        });
      }
    });

    setFilteredArtists(filtered);
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
                <h1 className="text-3xl font-bold text-foreground">Artistas</h1>
                <p className="text-muted-foreground">
                  Gerencie seus artistas e contratos
                </p>
              </div>
              <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Artista
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Total de Artistas"
                value={isLoading ? '...' : artistsCount || displayArtists.length}
                description="artistas cadastrados"
                icon={Users}
                trend={trends?.artistsTrend || undefined}
              />
              <DashboardCard
                title="Artistas Ativos"
                value={isLoading ? '...' : displayArtists.filter((a: any) => a.status === 'Ativo').length}
                description="com contratos vigentes"
                icon={Star}
                trend={trends?.activeArtistsTrend || undefined}
              />
              <DashboardCard
                title="Obras Totais"
                value={isLoading ? '...' : displayArtists.reduce((acc: number, artist: any) => acc + (artist.stats?.obras || 0), 0)}
                description="músicas registradas"
                icon={Music}
                trend={trends?.worksTrend || undefined}
              />
              <DashboardCard
                title="Receita dos Artistas"
                value="R$ 0"
                description="este mês"
                icon={DollarSign}
                trend={trends?.revenueTrend || undefined}
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter
              searchPlaceholder="Buscar artistas por nome, email ou gênero..."
              filters={filterOptions}
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClear}
            />

            {/* Artists List */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Lista de Artistas</CardTitle>
                <CardDescription>
                  Visão geral de todos os artistas gerenciados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse bg-muted h-32 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">Erro ao carregar artistas</p>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Tentar novamente
                      </Button>
                    </div>
                  ) : currentArtists.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum artista encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece adicionando seu primeiro artista ao sistema
                      </p>
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Artista
                      </Button>
                    </div>
                  ) : null}
                  {currentArtists.map((artist: any) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                  {!currentArtists.length && !isLoading && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum artista encontrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      {/* Create Artist Modal */}
      <ArtistModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        mode="create"
      />
    </SidebarProvider>
  );
};

export default Artistas;