import { useState, useMemo, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useArtists, useArtistsCount, useDeleteArtist, useCreateArtist } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useReleases } from "@/hooks/useReleases";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { useActiveContracts } from "@/hooks/useContracts";
import { useDataExport } from "@/hooks/useDataExport";
import { Users, Plus, Music, DollarSign, Star, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { mockArtists } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Artistas = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: artists, isLoading, error } = useArtists();
  const { data: artistsCount } = useArtistsCount();
  const { data: projects = [] } = useProjects();
  const { data: releases = [] } = useReleases();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const { data: activeContracts = [] } = useActiveContracts();
  const deleteArtist = useDeleteArtist();
  const createArtist = useCreateArtist();
  const { exportToExcel, parseExcelFile } = useDataExport();
  const { toast } = useToast();
  
  const [filteredArtists, setFilteredArtists] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const artistsLast30 = (artists || []).filter((a: any) => new Date(a.created_at) >= thirtyDaysAgo).length;
    const artistsPrev30 = (artists || []).filter((a: any) => {
      const date = new Date(a.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const artistsTrend = artistsPrev30 > 0 ? ((artistsLast30 - artistsPrev30) / artistsPrev30) * 100 : artistsLast30 > 0 ? 100 : 0;

    const contractsLast30 = activeContracts.filter((c: any) => new Date(c.created_at) >= thirtyDaysAgo).length;
    const contractsPrev30 = activeContracts.filter((c: any) => {
      const date = new Date(c.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const contractsTrend = contractsPrev30 > 0 ? ((contractsLast30 - contractsPrev30) / contractsPrev30) * 100 : contractsLast30 > 0 ? 100 : 0;

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

  const artistContractStatusMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    activeContracts.forEach((contract: any) => {
      if (contract.artist_id) {
        map[contract.artist_id] = true;
      }
    });
    return map;
  }, [activeContracts]);

  // Helper function to check if artist name matches any participant
  const artistMatchesParticipant = (artistName: string, stageName: string, participants: any[]) => {
    if (!participants || !Array.isArray(participants)) return false;
    const normalizedArtistName = artistName?.toLowerCase().trim();
    const normalizedStageName = stageName?.toLowerCase().trim();
    return participants.some((p: any) => {
      const pName = p?.name?.toLowerCase().trim();
      return pName && (pName === normalizedArtistName || pName === normalizedStageName);
    });
  };

  const artistStats = useMemo(() => {
    const stats: Record<string, { projetos: number; lancamentos: number; obras: number }> = {};
    
    // Get list of artists for name matching
    const artistsList = artists || [];
    
    // Count projects - both by artist_id and by participation (composer, performer, producer)
    projects.forEach((project: any) => {
      // Direct artist_id link
      if (project.artist_id) {
        if (!stats[project.artist_id]) {
          stats[project.artist_id] = { projetos: 0, lancamentos: 0, obras: 0 };
        }
        stats[project.artist_id].projetos++;
      }
      
      // Check participation in songs (composer, performer, producer)
      const audioFiles = project.audio_files;
      const songs = audioFiles?.songs || [];
      
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.name || artist.stage_name;
        
        let isParticipant = false;
        songs.forEach((song: any) => {
          if (artistMatchesParticipant(artistName, stageName, song.composers) ||
              artistMatchesParticipant(artistName, stageName, song.performers) ||
              artistMatchesParticipant(artistName, stageName, song.producers)) {
            isParticipant = true;
          }
        });
        
        // Only add if not already counted by artist_id
        if (isParticipant && project.artist_id !== artist.id) {
          if (!stats[artist.id]) {
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0 };
          }
          stats[artist.id].projetos++;
        }
      });
    });
    
    // Count releases - both by artist_id and by participation
    releases.forEach((release: any) => {
      if (release.artist_id) {
        if (!stats[release.artist_id]) {
          stats[release.artist_id] = { projetos: 0, lancamentos: 0, obras: 0 };
        }
        stats[release.artist_id].lancamentos++;
      }
      
      // Check participation in tracks
      const tracks = release.tracks || [];
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.name || artist.stage_name;
        
        let isParticipant = false;
        if (Array.isArray(tracks)) {
          tracks.forEach((track: any) => {
            if (artistMatchesParticipant(artistName, stageName, track.composers) ||
                artistMatchesParticipant(artistName, stageName, track.performers) ||
                artistMatchesParticipant(artistName, stageName, track.producers)) {
              isParticipant = true;
            }
          });
        }
        
        if (isParticipant && release.artist_id !== artist.id) {
          if (!stats[artist.id]) {
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0 };
          }
          stats[artist.id].lancamentos++;
        }
      });
    });
    
    // Count music registry - both by artist_id and by participation
    musicRegistry.forEach((music: any) => {
      if (music.artist_id) {
        if (!stats[music.artist_id]) {
          stats[music.artist_id] = { projetos: 0, lancamentos: 0, obras: 0 };
        }
        stats[music.artist_id].obras++;
      }
      
      // Check participation in music registry
      const participants = music.participants || [];
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.name || artist.stage_name;
        
        if (artistMatchesParticipant(artistName, stageName, participants) && music.artist_id !== artist.id) {
          if (!stats[artist.id]) {
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0 };
          }
          stats[artist.id].obras++;
        }
      });
    });
    
    return stats;
  }, [projects, releases, musicRegistry, artists]);

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
    return {
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
      responsible: hasManager ? {
        nome: dbArtist.manager_name || 'Não informado',
        email: dbArtist.manager_email || 'Não informado',
        telefone: dbArtist.manager_phone || 'Não informado'
      } : null,
      profile: {
        nome: dbArtist.full_name || dbArtist.name || 'Não informado',
        email: dbArtist.email || 'Não informado',
        telefone: dbArtist.phone || 'Não informado'
      },
      perfil: profileType || 'Independente',
      gravadora: profileType || 'Independente'
    };
  };

  const displayArtists = artists?.length ? artists.map(transformDatabaseArtist) : mockArtists;

  // Reapply filters when artists data changes
  useEffect(() => {
    if (currentSearchTerm || Object.values(currentFilters).some(v => v)) {
      applyFilters(currentSearchTerm, currentFilters);
    } else {
      setFilteredArtists([]);
    }
  }, [artists]);

  const currentArtists = filteredArtists.length ? filteredArtists : displayArtists;

  const filterOptions = [
    { key: "genre", label: "Gênero", options: ["Funk", "Rock", "Pop", "MPB", "Sertanejo"] },
    { key: "status", label: "Status", options: ["Ativo", "Inativo"] },
    { key: "perfil", label: "Perfil", options: ["Independente", "Com Empresário", "Gravadora", "Editora", "Produtor", "Compositor"] },
    { key: "contrato", label: "Contrato", options: ["Com Contrato Ativo", "Sem Contrato Ativo"] }
  ];

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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((artist: any) => 
        artist.name?.toLowerCase().includes(term) || 
        artist.email?.toLowerCase().includes(term) || 
        artist.genre?.toLowerCase().includes(term) ||
        artist.stage_name?.toLowerCase().includes(term)
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        filtered = filtered.filter((artist: any) => {
          if (key === "genre") return artist.genre?.toLowerCase() === value.toLowerCase();
          if (key === "status") return artist.status?.toLowerCase() === value.toLowerCase();
          if (key === "perfil") return artist.perfil?.toLowerCase() === value.toLowerCase();
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
        await deleteArtist.mutateAsync(id);
      }
      toast({
        title: "Artistas excluídos",
        description: `${selectedItems.length} artistas foram excluídos com sucesso.`,
      });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir alguns artistas.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExport = () => {
    exportToExcel(displayArtists, "artistas", "Artistas", "artists");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await parseExcelFile(file);
      
      if (data.length === 0) {
        toast({
          title: "Arquivo vazio",
          description: "Nenhum registro encontrado no arquivo.",
          variant: "destructive",
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          // Map Excel columns to artist fields (Portuguese headers)
          const artistData: any = {
            name: row['Nome'] || row['name'] || row['Nome Artístico'] || '',
            stage_name: row['Nome Artístico'] || row['stage_name'] || '',
            full_name: row['Nome Completo'] || row['full_name'] || '',
            email: row['E-mail'] || row['Email'] || row['email'] || '',
            phone: row['Telefone'] || row['phone'] || '',
            cpf_cnpj: row['CPF/CNPJ'] || row['cpf_cnpj'] || '',
            rg: row['RG'] || row['rg'] || '',
            birth_date: row['Data de Nascimento'] || row['birth_date'] || null,
            full_address: row['Endereço Completo'] || row['full_address'] || '',
            profile_type: row['Tipo de Perfil'] || row['profile_type'] || '',
            contract_status: row['Status do Contrato'] || row['contract_status'] || 'active',
            genre: row['Gênero Musical'] || row['genre'] || '',
            bio: row['Biografia'] || row['bio'] || '',
            instagram: row['Instagram'] || row['instagram'] || '',
            spotify_url: row['Spotify'] || row['spotify_url'] || '',
            youtube_url: row['YouTube'] || row['youtube_url'] || '',
            tiktok: row['TikTok'] || row['tiktok'] || '',
            soundcloud: row['SoundCloud'] || row['soundcloud'] || '',
            bank: row['Banco'] || row['bank'] || '',
            agency: row['Agência'] || row['agency'] || '',
            account: row['Conta'] || row['account'] || '',
            pix_key: row['Chave PIX'] || row['pix_key'] || '',
            account_holder: row['Titular da Conta'] || row['account_holder'] || '',
            manager_name: row['Nome do Empresário'] || row['manager_name'] || '',
            manager_phone: row['Telefone do Empresário'] || row['manager_phone'] || '',
            manager_email: row['E-mail do Empresário'] || row['manager_email'] || '',
            record_label_name: row['Nome da Gravadora'] || row['record_label_name'] || '',
            observations: row['Observações'] || row['observations'] || '',
          };

          // Skip rows without a name
          if (!artistData.name) {
            errorCount++;
            continue;
          }

          // Parse birth_date if it's a string
          if (artistData.birth_date && typeof artistData.birth_date === 'string') {
            const parts = artistData.birth_date.split('/');
            if (parts.length === 3) {
              artistData.birth_date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          await createArtist.mutateAsync(artistData);
          successCount++;
        } catch (err) {
          console.error('Erro ao importar artista:', err);
          errorCount++;
        }
      }

      toast({
        title: "Importação concluída",
        description: `${successCount} artistas importados com sucesso.${errorCount > 0 ? ` ${errorCount} registros com erro.` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Não foi possível ler o arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Artistas</h1>
                  <p className="text-muted-foreground">Gerencie seus artistas e contratos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Importar
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={displayArtists.length === 0}>
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Artistas</CardTitle>
                    <CardDescription>Visão geral de todos os artistas</CardDescription>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => setIsBulkDeleteModalOpen(true)}>
                      <Trash2 className="h-4 w-4" />
                      Excluir Selecionados ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-muted h-32 rounded-lg" />)}
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-4">Erro ao carregar artistas</p>
                      <Button variant="outline" onClick={() => window.location.reload()}>Tentar novamente</Button>
                    </div>
                  ) : currentArtists.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum artista encontrado</h3>
                      <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro artista ao sistema</p>
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Artista
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Select All Header */}
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <Checkbox
                          checked={selectedItems.length === currentArtists.length && currentArtists.length > 0}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                        <span className="text-sm font-medium text-muted-foreground">
                          {selectedItems.length > 0 ? `${selectedItems.length} de ${currentArtists.length} selecionados` : "Selecionar todos"}
                        </span>
                      </div>
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>

      <ArtistModal open={createModalOpen} onOpenChange={setCreateModalOpen} mode="create" />

      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        onConfirm={confirmBulkDelete}
        title="Excluir Artistas"
        description={`Tem certeza que deseja excluir ${selectedItems.length} artistas? Esta ação não pode ser desfeita.`}
        isLoading={isDeletingBulk}
      />
    </SidebarProvider>
  );
};

export default Artistas;
