import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import { Music, Plus, FileText, CheckCircle, Clock, Disc, Trash2, Download, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry, useDeleteMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { usePhonograms, useDeletePhonogram } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { formatDateBR, translateStatus } from "@/lib/utils";
import { useDataExport } from "@/hooks/useDataExport";
import { useCreateMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { useCreatePhonogram } from "@/hooks/usePhonograms";
import { useRef } from "react";

const RegistroMusicas = () => {
  const { data: musicRegistry = [], isLoading: isLoadingWorks } = useMusicRegistry();
  const { data: phonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();
  const deleteMusicEntry = useDeleteMusicRegistryEntry();
  const deletePhonogram = useDeletePhonogram();
  const createMusicEntry = useCreateMusicRegistryEntry();
  const createPhonogram = useCreatePhonogram();
  const { exportToExcel, parseExcelFile } = useDataExport();
  
  const worksFileInputRef = useRef<HTMLInputElement>(null);
  const phonogramsFileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Bulk delete states - Works
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [isBulkDeleteWorksModalOpen, setIsBulkDeleteWorksModalOpen] = useState(false);
  const [isDeletingBulkWorks, setIsDeletingBulkWorks] = useState(false);

  // Bulk delete states - Phonograms
  const [selectedPhonograms, setSelectedPhonograms] = useState<string[]>([]);
  const [isBulkDeletePhonogramsModalOpen, setIsBulkDeletePhonogramsModalOpen] = useState(false);
  const [isDeletingBulkPhonograms, setIsDeletingBulkPhonograms] = useState(false);

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

  // Bulk delete handlers - Works
  const handleSelectAllWorks = (checked: boolean) => {
    if (checked) {
      setSelectedWorks(filteredSongs.map(s => s.id));
    } else {
      setSelectedWorks([]);
    }
  };

  const handleSelectWork = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedWorks(prev => [...prev, id]);
    } else {
      setSelectedWorks(prev => prev.filter(i => i !== id));
    }
  };

  const confirmBulkDeleteWorks = async () => {
    setIsDeletingBulkWorks(true);
    try {
      for (const id of selectedWorks) {
        await deleteMusicEntry.mutateAsync(id);
      }
      toast({
        title: "Sucesso",
        description: `${selectedWorks.length} obra(s) excluída(s) com sucesso.`,
      });
      setSelectedWorks([]);
      setIsBulkDeleteWorksModalOpen(false);
    } catch (error) {
      console.error('Error bulk deleting works:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir obras. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulkWorks(false);
    }
  };

  // Bulk delete handlers - Phonograms
  const handleSelectAllPhonograms = (checked: boolean) => {
    if (checked) {
      setSelectedPhonograms(filteredPhonograms.map(p => p.id));
    } else {
      setSelectedPhonograms([]);
    }
  };

  const handleSelectPhonogram = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPhonograms(prev => [...prev, id]);
    } else {
      setSelectedPhonograms(prev => prev.filter(i => i !== id));
    }
  };

  const confirmBulkDeletePhonograms = async () => {
    setIsDeletingBulkPhonograms(true);
    try {
      for (const id of selectedPhonograms) {
        await deletePhonogram.mutateAsync(id);
      }
      toast({
        title: "Sucesso",
        description: `${selectedPhonograms.length} fonograma(s) excluído(s) com sucesso.`,
      });
      setSelectedPhonograms([]);
      setIsBulkDeletePhonogramsModalOpen(false);
    } catch (error) {
      console.error('Error bulk deleting phonograms:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir fonogramas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulkPhonograms(false);
    }
  };

  // Export/Import handlers - Works
  const handleExportWorks = () => {
    const artistsMap = artists.reduce((acc, artist) => {
      acc[artist.id] = artist.stage_name || artist.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Add project_name to each music registry item
    const enrichedMusicRegistry = musicRegistry.map(music => {
      const project = projects.find(p => p.id === music.project_id);
      return {
        ...music,
        project_name: project?.name || '',
      };
    });
    
    exportToExcel(enrichedMusicRegistry, 'obras_musicais', 'Obras', 'music_registry', artistsMap);
  };

  const handleImportWorks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile(file);
      let imported = 0;

      // Get completed projects to match by title
      const completedProjects = projects.filter(p => p.status === 'completed');

      for (const row of data) {
        const title = row['Título'] || row['title'] || '';
        if (!title) continue;

        // Try to find matching project by song name
        let matchedProject = null;
        let matchedSong = null;
        let matchedArtistId = null;

        for (const project of completedProjects) {
          let audioFilesData = project.audio_files as any;
          
          if (typeof audioFilesData === 'string') {
            try {
              audioFilesData = JSON.parse(audioFilesData);
            } catch (e) {
              continue;
            }
          }
          
          const songs = audioFilesData?.songs || [];
          const foundSong = songs.find((song: any) => {
            const songName = song.song_name || song.title || '';
            return songName.toLowerCase().trim() === title.toLowerCase().trim();
          });

          if (foundSong) {
            matchedProject = project;
            matchedSong = foundSong;
            matchedArtistId = project.artist_id;
            break;
          }
        }

        // Build participants from project data
        const participants: any[] = [];
        
        if (matchedSong) {
          // Add composers from project
          if (matchedSong.composers && Array.isArray(matchedSong.composers)) {
            matchedSong.composers.forEach((c: any) => {
              participants.push({
                name: c.name || c,
                role: 'compositor_autor',
                link: '',
                contract_start_date: '',
                percentage: c.percentage || 0,
              });
            });
          }
        }

        // Calculate duration from project data or import file
        let duration = null;
        if (matchedSong?.duration_minutes !== undefined && matchedSong?.duration_seconds !== undefined) {
          duration = (matchedSong.duration_minutes * 60) + (matchedSong.duration_seconds || 0);
        } else if (row['Duração']) {
          // Parse duration in m:ss format
          const durationStr = String(row['Duração']);
          if (durationStr.includes(':')) {
            const parts = durationStr.split(':');
            duration = (parseInt(parts[0]) * 60) + parseInt(parts[1] || '0');
          } else {
            duration = parseInt(durationStr) || null;
          }
        }

        const workData = {
          title: title,
          status: row['Status'] || row['status'] || 'pendente',
          genre: matchedSong?.genre || row['Gênero'] || row['genre'] || null,
          abramus_code: row['Código ABRAMUS'] || row['abramus_code'] || null,
          ecad_code: row['Código ECAD'] || row['ecad_code'] || null,
          isrc: matchedSong?.isrc || row['ISRC'] || row['isrc'] || null,
          iswc: row['ISWC'] || row['iswc'] || null,
          duration: duration,
          artist_id: matchedArtistId || null,
          participants: participants.length > 0 ? participants : null,
          writers: matchedSong?.composers?.map((c: any) => c.name || c) || 
                   (row['Compositores'] ? String(row['Compositores']).split(',').map(s => s.trim()) : null),
          publishers: row['Editoras'] ? String(row['Editoras']).split(',').map(s => s.trim()) : null,
        };

        await createMusicEntry.mutateAsync(workData);
        imported++;
      }

      toast({
        title: "Importação concluída",
        description: `${imported} obra(s) importada(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Error importing works:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao importar obras. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    }
    event.target.value = '';
  };

  // Export/Import handlers - Phonograms
  const handleExportPhonograms = () => {
    const artistsMap = artists.reduce((acc, artist) => {
      acc[artist.id] = artist.stage_name || artist.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Add work_title to each phonogram
    const enrichedPhonograms = phonograms.map(phonogram => {
      const work = musicRegistry.find(m => m.id === phonogram.work_id);
      return {
        ...phonogram,
        work_title: work?.title || '',
      };
    });
    
    exportToExcel(enrichedPhonograms, 'fonogramas', 'Fonogramas', 'phonograms', artistsMap);
  };

  const handleImportPhonograms = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile(file);
      let imported = 0;

      for (const row of data) {
        const phonogramData = {
          title: row['Título'] || row['title'] || '',
          status: row['Status'] || row['status'] || 'pendente',
          genre: row['Gênero'] || row['genre'] || null,
          isrc: row['ISRC'] || row['isrc'] || null,
          duration: row['Duração (segundos)'] || row['duration'] || null,
          language: row['Idioma'] || row['language'] || null,
          label: row['Gravadora'] || row['label'] || null,
          master_owner: row['Proprietário do Master'] || row['master_owner'] || null,
          version_type: row['Tipo de Versão'] || row['version_type'] || null,
          is_remix: row['É Remix'] === 'Sim' || row['is_remix'] === true,
          remix_artist: row['Artista do Remix'] || row['remix_artist'] || null,
          recording_date: row['Data de Gravação'] || row['recording_date'] || null,
          recording_studio: row['Estúdio de Gravação'] || row['recording_studio'] || null,
          recording_location: row['Local de Gravação'] || row['recording_location'] || null,
        };

        if (phonogramData.title) {
          await createPhonogram.mutateAsync(phonogramData);
          imported++;
        }
      }

      toast({
        title: "Importação concluída",
        description: `${imported} fonograma(s) importado(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Error importing phonograms:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao importar fonogramas. Verifique o formato do arquivo.",
        variant: "destructive",
      });
    }
    event.target.value = '';
  };

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
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold text-foreground">Registro de Músicas</h1>
                  <p className="text-muted-foreground">
                    Registro e controle de obras musicais e fonogramas
                  </p>
                </div>
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
                <div className="flex items-center gap-4 flex-wrap">
                  <SearchFilter
                    searchPlaceholder="Buscar obras por título, artista ou ISWC..."
                    filters={filterOptions}
                    onSearch={handleSearchWorks}
                    onFilter={handleFilterWorks}
                    onClear={handleClearWorks}
                  />
                  <div className="flex gap-2 ml-auto">
                    <input
                      type="file"
                      ref={worksFileInputRef}
                      onChange={handleImportWorks}
                      accept=".xlsx,.xls"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => worksFileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportWorks}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                  {selectedWorks.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsBulkDeleteWorksModalOpen(true)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Selecionados ({selectedWorks.length})
                    </Button>
                  )}
                </div>

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
                        <div className="flex items-center gap-2 p-2 border-b border-border">
                          <Checkbox
                            checked={selectedWorks.length === filteredSongs.length && filteredSongs.length > 0}
                            onCheckedChange={(checked) => handleSelectAllWorks(!!checked)}
                          />
                          <span className="text-sm text-muted-foreground">Selecionar todos</span>
                        </div>
                        {filteredSongs.map((song) => (
                          <div
                            key={song.id}
                            className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center">
                              <Checkbox
                                checked={selectedWorks.includes(song.id)}
                                onCheckedChange={(checked) => handleSelectWork(song.id, !!checked)}
                              />
                            </div>
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
                <div className="flex items-center gap-4 flex-wrap">
                  <SearchFilter
                    searchPlaceholder="Buscar fonogramas por título, artista ou ISRC..."
                    filters={filterOptions}
                    onSearch={handleSearchPhonograms}
                    onFilter={handleFilterPhonograms}
                    onClear={handleClearPhonograms}
                  />
                  <div className="flex gap-2 ml-auto">
                    <input
                      type="file"
                      ref={phonogramsFileInputRef}
                      onChange={handleImportPhonograms}
                      accept=".xlsx,.xls"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => phonogramsFileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Importar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPhonograms}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                  {selectedPhonograms.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsBulkDeletePhonogramsModalOpen(true)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Selecionados ({selectedPhonograms.length})
                    </Button>
                  )}
                </div>

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
                        <div className="flex items-center gap-2 p-2 border-b border-border">
                          <Checkbox
                            checked={selectedPhonograms.length === filteredPhonograms.length && filteredPhonograms.length > 0}
                            onCheckedChange={(checked) => handleSelectAllPhonograms(!!checked)}
                          />
                          <span className="text-sm text-muted-foreground">Selecionar todos</span>
                        </div>
                        {filteredPhonograms.map((phono) => (
                          <div
                            key={phono.id}
                            className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <Checkbox
                              checked={selectedPhonograms.includes(phono.id)}
                              onCheckedChange={(checked) => handleSelectPhonogram(phono.id, !!checked)}
                            />
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

            {/* Bulk Delete Modals */}
            <DeleteConfirmationModal
              open={isBulkDeleteWorksModalOpen}
              onOpenChange={setIsBulkDeleteWorksModalOpen}
              onConfirm={confirmBulkDeleteWorks}
              title="Excluir Obras Selecionadas"
              description={`Tem certeza que deseja excluir ${selectedWorks.length} obra(s) selecionada(s)? Esta ação não pode ser desfeita.`}
              isLoading={isDeletingBulkWorks}
            />

            <DeleteConfirmationModal
              open={isBulkDeletePhonogramsModalOpen}
              onOpenChange={setIsBulkDeletePhonogramsModalOpen}
              onConfirm={confirmBulkDeletePhonograms}
              title="Excluir Fonogramas Selecionados"
              description={`Tem certeza que deseja excluir ${selectedPhonograms.length} fonograma(s) selecionado(s)? Esta ação não pode ser desfeita.`}
              isLoading={isDeletingBulkPhonograms}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RegistroMusicas;
