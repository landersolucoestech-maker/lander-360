import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useArtists, useArtistsCount, useDeleteArtist } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useReleases } from "@/hooks/useReleases";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { useActiveContracts } from "@/hooks/useContracts";
import { Users, Plus, Music, DollarSign, Star, Upload, Download, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { mockArtists } from "@/data/mockData";

const Artistas = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const { toast } = useToast();
  const deleteArtist = useDeleteArtist();

  const handleExport = () => {
    const dataToExport = currentArtists.map((artist: any) => ({
      'Nome': artist.name || '',
      'Nome Artístico': artist.stage_name || '',
      'Gênero': artist.genre || '',
      'Email': artist.email || '',
      'Telefone': artist.phone || '',
      'Status': artist.status || '',
      'Perfil': artist.perfil || '',
      'CPF/CNPJ': artist.cpf_cnpj || '',
      'Banco': artist.bank || '',
      'Agência': artist.agency || '',
      'Conta': artist.account || '',
      'Chave PIX': artist.pix_key || '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Artistas');
    XLSX.writeFile(wb, `artistas_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: 'Sucesso', description: 'Arquivo exportado com sucesso!' });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        toast({ 
          title: 'Arquivo importado', 
          description: `${jsonData.length} registros encontrados. Funcionalidade de importação em desenvolvimento.` 
        });
      } catch (error) {
        toast({ title: 'Erro', description: 'Erro ao processar arquivo.', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };
  const {
    data: artists,
    isLoading,
    error
  } = useArtists();
  const {
    data: artistsCount
  } = useArtistsCount();
  const {
    data: projects = []
  } = useProjects();
  const {
    data: releases = []
  } = useReleases();
  const {
    data: musicRegistry = []
  } = useMusicRegistry();
  const {
    data: activeContracts = []
  } = useActiveContracts();
  const [filteredArtists, setFilteredArtists] = useState<any[]>([]);

  // Count artists with active contracts
  const artistsWithActiveContracts = useMemo(() => {
    const artistIds = new Set<string>();
    activeContracts.forEach((contract: any) => {
      if (contract.artist_id) {
        artistIds.add(contract.artist_id);
      }
    });
    return artistIds.size;
  }, [activeContracts]);

  // Calculate trends based on creation dates (last 30 days vs previous 30 days)
  const kpiTrends = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Artists trend
    const artistsLast30 = (artists || []).filter((a: any) => new Date(a.created_at) >= thirtyDaysAgo).length;
    const artistsPrev30 = (artists || []).filter((a: any) => {
      const date = new Date(a.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const artistsTrend = artistsPrev30 > 0 ? ((artistsLast30 - artistsPrev30) / artistsPrev30) * 100 : artistsLast30 > 0 ? 100 : 0;

    // Contracts trend
    const contractsLast30 = activeContracts.filter((c: any) => new Date(c.created_at) >= thirtyDaysAgo).length;
    const contractsPrev30 = activeContracts.filter((c: any) => {
      const date = new Date(c.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const contractsTrend = contractsPrev30 > 0 ? ((contractsLast30 - contractsPrev30) / contractsPrev30) * 100 : contractsLast30 > 0 ? 100 : 0;

    // Music registry trend
    const musicLast30 = musicRegistry.filter((m: any) => new Date(m.created_at) >= thirtyDaysAgo).length;
    const musicPrev30 = musicRegistry.filter((m: any) => {
      const date = new Date(m.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const musicTrend = musicPrev30 > 0 ? ((musicLast30 - musicPrev30) / musicPrev30) * 100 : musicLast30 > 0 ? 100 : 0;

    return {
      artists: { value: Math.abs(Number(artistsTrend.toFixed(1))), isPositive: artistsTrend >= 0 },
      contracts: { value: Math.abs(Number(contractsTrend.toFixed(1))), isPositive: contractsTrend >= 0 },
      music: { value: Math.abs(Number(musicTrend.toFixed(1))), isPositive: musicTrend >= 0 },
    };
  }, [artists, activeContracts, musicRegistry]);

  // Map of artists with active contracts
  const artistContractStatusMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    activeContracts.forEach((contract: any) => {
      if (contract.artist_id) {
        map[contract.artist_id] = true;
      }
    });
    return map;
  }, [activeContracts]);

  // Count projects, releases and music per artist
  const artistStats = useMemo(() => {
    const stats: Record<string, {
      projetos: number;
      lancamentos: number;
      obras: number;
    }> = {};
    projects.forEach((project: any) => {
      if (project.artist_id) {
        if (!stats[project.artist_id]) {
          stats[project.artist_id] = {
            projetos: 0,
            lancamentos: 0,
            obras: 0
          };
        }
        stats[project.artist_id].projetos++;
      }
    });
    releases.forEach((release: any) => {
      if (release.artist_id) {
        if (!stats[release.artist_id]) {
          stats[release.artist_id] = {
            projetos: 0,
            lancamentos: 0,
            obras: 0
          };
        }
        stats[release.artist_id].lancamentos++;
      }
    });
    musicRegistry.forEach((music: any) => {
      if (music.artist_id) {
        if (!stats[music.artist_id]) {
          stats[music.artist_id] = {
            projetos: 0,
            lancamentos: 0,
            obras: 0
          };
        }
        stats[music.artist_id].obras++;
      }
    });
    return stats;
  }, [projects, releases, musicRegistry]);

  // Transform database artists to match UI format - pass complete database data
  // Translate status to Portuguese
  const translateStatus = (status: string | null | undefined): string => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'ativo': 'Ativo',
      'inactive': 'Inativo',
      'inativo': 'Inativo',
      'pending': 'Pendente',
      'pendente': 'Pendente',
      'suspended': 'Suspenso',
      'suspenso': 'Suspenso',
      'cancelled': 'Cancelado',
      'cancelado': 'Cancelado',
    };
    const normalizedStatus = (status || 'ativo').toLowerCase();
    return statusMap[normalizedStatus] || 'Ativo';
  };

  const transformDatabaseArtist = (dbArtist: any) => {
    const profileType = dbArtist.profile_type?.trim() || '';
    const hasManager = ['Com Empresário', 'Gravadora', 'Editora'].includes(profileType) && (dbArtist.manager_name || dbArtist.manager_phone || dbArtist.manager_email);
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
      status: translateStatus(dbArtist.contract_status),
      email: dbArtist.email || 'Não informado',
      avatar: dbArtist.image_url,
      socialMedia: {
        instagram: dbArtist.instagram,
        spotify: dbArtist.spotify_url,
        youtube: dbArtist.youtube_url,
        tiktok: dbArtist.tiktok,
        soundcloud: dbArtist.soundcloud
      },
      stats: {
        projetos: artistStats[dbArtist.id]?.projetos || 0,
        obras: artistStats[dbArtist.id]?.obras || 0,
        fonogramas: 0,
        lancamentos: artistStats[dbArtist.id]?.lancamentos || 0,
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
      perfil: profileType || 'Independente',
      gravadora: profileType || 'Independente'
    };
  };

  // Use mock data when no database artists exist
  const displayArtists = artists?.length ? artists.map(transformDatabaseArtist) : mockArtists;
  const currentArtists = filteredArtists.length ? filteredArtists : displayArtists;
  const filterOptions = [{
    key: "genre",
    label: "Gênero",
    options: ["Funk", "Rock", "Pop", "MPB", "Sertanejo"]
  }, {
    key: "status",
    label: "Status",
    options: ["Ativo", "Inativo"]
  }, {
    key: "perfil",
    label: "Perfil",
    options: ["Independente", "Com Empresário", "Gravadora", "Editora", "Produtor", "Compositor"]
  }, {
    key: "contrato",
    label: "Contrato",
    options: ["Com Contrato Ativo", "Sem Contrato Ativo"]
  }];
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});

  const handleSearch = (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    applyFilters(searchTerm, currentFilters);
  };
  const handleFilter = (filters: Record<string, string>) => {
    setCurrentFilters(filters);
    applyFilters(currentSearchTerm, filters);
  };
  
  const applyFilters = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = displayArtists;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((artist: any) => 
        artist.name?.toLowerCase().includes(term) || 
        artist.email?.toLowerCase().includes(term) || 
        artist.genre?.toLowerCase().includes(term) ||
        artist.stage_name?.toLowerCase().includes(term)
      );
    }

    // Apply category filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((artist: any) => {
          if (key === "genre") {
            return artist.genre?.toLowerCase() === value.toLowerCase();
          }
          if (key === "status") {
            // Get the translated status and compare
            const artistStatus = artist.status || 'Ativo';
            return artistStatus.toLowerCase() === value.toLowerCase();
          }
          if (key === "perfil") {
            return artist.perfil?.toLowerCase() === value.toLowerCase();
          }
          if (key === "contrato") {
            const hasActiveContract = artistContractStatusMap[artist.id] || false;
            if (value === "Com Contrato Ativo") return hasActiveContract;
            if (value === "Sem Contrato Ativo") return !hasActiveContract;
          }
          return true;
        });
      }
    });
    
    setFilteredArtists(filtered);
  };
  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredArtists([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentArtists.map((artist: any) => artist.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const confirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      for (const id of selectedItems) {
        await deleteArtist.mutateAsync(id);
      }
      toast({ title: 'Sucesso', description: `${selectedItems.length} artistas excluídos com sucesso!` });
      setSelectedItems([]);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir artistas.', variant: 'destructive' });
    } finally {
      setIsDeletingBulk(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  return <SidebarProvider>
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
                  <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                  <Button variant="outline" className="gap-2" asChild>
                    <span><Upload className="h-4 w-4" />Importar</span>
                  </Button>
                </label>
                <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Novo Artista
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Total de Artistas" value={isLoading ? '...' : artistsCount || displayArtists.length} description="artistas cadastrados" icon={Users} trend={kpiTrends.artists} />
              <DashboardCard title="Contratos Vigentes" value={isLoading ? '...' : artistsWithActiveContracts} description="artistas com contratos ativos" icon={Star} trend={kpiTrends.contracts} />
              <DashboardCard title="Obras e Fonogramas Totais" value={isLoading ? '...' : displayArtists.reduce((acc: number, artist: any) => acc + (artist.stats?.obras || 0), 0)} description="músicas registradas" icon={Music} trend={kpiTrends.music} />
              <DashboardCard title="Receita dos Artistas" value="R$ 0" description="este mês" icon={DollarSign} />
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar artistas por nome, email ou gênero..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Artists List */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lista de Artistas</CardTitle>
                  <CardDescription>Visão geral de todos os artistas</CardDescription>
                </div>
                {currentArtists.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItems.length === currentArtists.length && currentArtists.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">Selecionar todos</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? <div className="text-center py-8">
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-muted h-32 rounded-lg" />)}
                      </div>
                    </div> : error ? <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">Erro ao carregar artistas</p>
                      <Button variant="outline" onClick={() => window.location.reload()}>
                        Tentar novamente
                      </Button>
                    </div> : currentArtists.length === 0 ? <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum artista encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Comece adicionando seu primeiro artista ao sistema
                      </p>
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Artista
                      </Button>
                    </div> : null}
                  {currentArtists.map((artist: any) => (
                    <div key={artist.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(artist.id)}
                        onCheckedChange={(checked) => handleSelectItem(artist.id, !!checked)}
                        className="mt-4"
                      />
                      <div className="flex-1">
                        <ArtistCard artist={artist} />
                      </div>
                    </div>
                  ))}
                  {!currentArtists.length && !isLoading && <div className="text-center py-8 text-muted-foreground">
                      Nenhum artista encontrado.
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      {/* Create Artist Modal */}
      <ArtistModal open={createModalOpen} onOpenChange={setCreateModalOpen} mode="create" />

      {/* Bulk Delete Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        onConfirm={confirmBulkDelete}
        title="Excluir Artistas"
        description={`Tem certeza que deseja excluir ${selectedItems.length} artistas? Esta ação não pode ser desfeita.`}
        isLoading={isDeletingBulk}
      />
    </SidebarProvider>;
};
export default Artistas;