import { useState, useEffect, useRef, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectViewModal } from "@/components/modals/ProjectViewModal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { PlayCircle, Plus, TrendingUp, Calendar, Music, Loader2, Upload, Download, Trash2, PanelLeftClose } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useDeleteProject, useCreateProject } from "@/hooks/useProjects";
import { useArtists } from "@/hooks/useArtists";
import { useDataExport } from "@/hooks/useDataExport";
import { useImportExport } from "@/hooks/useImportExport";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { useReleases } from "@/hooks/useReleases";
import { useArtistFilter } from "@/hooks/useLinkedArtist";

const Projetos = () => {
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const { data: allProjects = [], isLoading, error } = useProjects();
  const { data: allArtists = [] } = useArtists();
  const { data: allMusicRegistry = [] } = useMusicRegistry();
  const { data: allPhonograms = [] } = usePhonograms();
  const { data: allReleases = [] } = useReleases();
  const deleteProjectMutation = useDeleteProject();
  const createProjectMutation = useCreateProject();
  const { exportToExcel, parseExcelFile } = useDataExport();
  const { parseProjectImportRow } = useImportExport();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aplicar filtro de artista
  const projects = useMemo(() => {
    if (shouldFilter && artistId) {
      return allProjects.filter((p: any) => p.artist_id === artistId);
    }
    return allProjects;
  }, [allProjects, shouldFilter, artistId]);

  const artists = useMemo(() => {
    if (shouldFilter && artistId) {
      return allArtists.filter((a: any) => a.id === artistId);
    }
    return allArtists;
  }, [allArtists, shouldFilter, artistId]);

  const musicRegistry = useMemo(() => {
    if (shouldFilter && artistId) {
      return allMusicRegistry.filter((m: any) => 
        m.artist_id === artistId || 
        (Array.isArray(m.artist_ids) && m.artist_ids.includes(artistId))
      );
    }
    return allMusicRegistry;
  }, [allMusicRegistry, shouldFilter, artistId]);

  const phonograms = useMemo(() => {
    if (shouldFilter && artistId) {
      return allPhonograms.filter((p: any) => p.artist_id === artistId);
    }
    return allPhonograms;
  }, [allPhonograms, shouldFilter, artistId]);

  const releases = useMemo(() => {
    if (shouldFilter && artistId) {
      return allReleases.filter((r: any) => r.artist_id === artistId);
    }
    return allReleases;
  }, [allReleases, shouldFilter, artistId]);

  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const getProjectDetails = (project: any) => {
    try {
      if (project.audio_files && typeof project.audio_files === 'string') {
        return JSON.parse(project.audio_files);
      }
      if (project.audio_files && typeof project.audio_files === 'object') {
        return project.audio_files;
      }
    } catch (e) {
      console.error('Error parsing audio_files:', e);
    }
    return null;
  };

  // Sort projects alphabetically by name
  const sortedProjects = [...projects].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB, 'pt-BR');
  });

  useEffect(() => {
    // Reapply current filters when projects data changes
    if (currentSearchTerm || Object.values(currentFilters).some(v => v)) {
      filterProjects(currentSearchTerm, currentFilters);
    } else {
      setFilteredProjects(sortedProjects);
    }
  }, [projects]);

  // Extract unique values for filter dropdowns - Ordenados alfabeticamente
  const uniqueArtists = [...new Set(artists.map(a => a.stage_name || a.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  
  // Extrair gêneros de projetos e também de artistas para lista completa
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    // Gêneros dos projetos
    projects.forEach(p => {
      const details = getProjectDetails(p);
      const songs = details?.songs || [];
      songs.forEach((s: any) => {
        if (s.genre) genres.add(s.genre);
      });
      // Gênero do projeto em si
      if ((p as any).genre) genres.add((p as any).genre);
    });
    // Gêneros dos artistas
    artists.forEach((a: any) => {
      if (a.genre) genres.add(a.genre);
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [projects, artists]);
  
  const uniqueReleaseTypes = ['Álbum', 'EP', 'Single'].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const filterOptions = [
    { key: "status", label: "Status", options: ["Cancelado", "Concluído", "Em Andamento", "Rascunho"].sort((a, b) => a.localeCompare(b, 'pt-BR')) },
    { key: "artist", label: "Artista", options: uniqueArtists },
    { key: "release_type", label: "Tipo de Lançamento", options: uniqueReleaseTypes },
    { key: "genre", label: "Gênero", options: uniqueGenres.length > 0 ? uniqueGenres : ["Todos os Gêneros"] },
  ];

  const handleSearch = (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    filterProjects(searchTerm, currentFilters);
  };

  const handleFilter = (filters: Record<string, string>) => {
    setCurrentFilters(filters);
    filterProjects(currentSearchTerm, filters);
  };

  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredProjects(sortedProjects);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setViewModalOpen(true);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (selectedProject) {
      try {
        await deleteProjectMutation.mutateAsync(selectedProject.id);
        setDeleteModalOpen(false);
        setSelectedProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const filterProjects = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = sortedProjects;

    // Search by song name, artist, composer, performer, producer
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => {
        // Check project name
        if (project.name?.toLowerCase().includes(term)) return true;
        
        // Check artist name
        const artist = artists.find(a => a.id === project.artist_id);
        const artistName = artist?.stage_name || artist?.name || '';
        if (artistName.toLowerCase().includes(term)) return true;
        
        // Check songs data
        const details = getProjectDetails(project);
        const songs = details?.songs || [];
        for (const song of songs) {
          // Song name
          if (song.song_name?.toLowerCase().includes(term)) return true;
          // Composers
          if (song.composers?.some((c: any) => c.name?.toLowerCase().includes(term))) return true;
          // Performers
          if (song.performers?.some((p: any) => p.name?.toLowerCase().includes(term))) return true;
          // Producers
          if (song.producers?.some((p: any) => p.name?.toLowerCase().includes(term))) return true;
          // Genre
          if (song.genre?.toLowerCase().includes(term)) return true;
        }
        return false;
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(project => {
          const details = getProjectDetails(project);
          const songs = details?.songs || [];
          
          if (key === "status") {
            const statusTranslation: Record<string, string> = {
              'Concluído': 'completed',
              'Em Andamento': 'in_progress',
              'Rascunho': 'draft',
              'Cancelado': 'cancelled'
            };
            return project.status === statusTranslation[value];
          }
          if (key === "artist") {
            const artist = artists.find(a => a.id === project.artist_id);
            const artistName = artist?.stage_name || artist?.name || '';
            return artistName === value;
          }
          if (key === "release_type") {
            const releaseTypeMap: Record<string, string> = {
              'Single': 'single',
              'EP': 'ep',
              'Álbum': 'album'
            };
            return details?.release_type === releaseTypeMap[value];
          }
          if (key === "genre") {
            return songs.some((s: any) => s.genre === value);
          }
          return true;
        });
      }
    });
    setFilteredProjects(filtered);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado"
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "draft": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  // Get single status tag for a project based on workflow progression
  const getProjectTag = (projectId: string, projectStatus: string | null): { label: string; color: string } => {
    // Check registration and release status
    const hasObra = musicRegistry.some(m => m.project_id === projectId);
    const hasFonograma = phonograms.some(p => {
      const linkedWork = musicRegistry.find(m => m.project_id === projectId);
      return linkedWork && p.work_id === linkedWork.id;
    });
    const projectRelease = releases.find(r => r.project_id === projectId);
    const isReleased = projectRelease?.status === 'released' || projectRelease?.status === 'lançado';
    const isRegistered = hasObra && hasFonograma;

    // Workflow progression (priority order from most advanced to least)
    if (isReleased) {
      return { label: 'Lançado', color: 'bg-blue-600 text-white hover:bg-blue-700' };
    }
    
    if (isRegistered) {
      return { label: 'Lançamento Pendente', color: 'bg-orange-500 text-white hover:bg-orange-600' };
    }

    // Status-based tags (for non-registered projects)
    if (projectStatus === 'cancelled' || projectStatus === 'cancelado') {
      return { label: 'Cancelado', color: 'bg-red-600 text-white hover:bg-red-700' };
    }

    if (projectStatus === 'completed' || projectStatus === 'concluido') {
      return { label: 'Registro Pendente', color: 'bg-yellow-500 text-black hover:bg-yellow-600' };
    }
    
    if (projectStatus === 'in_progress' || projectStatus === 'em_progresso') {
      return { label: 'Em Progresso', color: 'bg-purple-500 text-white hover:bg-purple-600' };
    }
    
    // Default: draft
    return { label: 'Rascunho', color: 'bg-gray-500 text-white hover:bg-gray-600' };
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredProjects.map(p => p.id));
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
        await deleteProjectMutation.mutateAsync(id);
      }
      toast({
        title: "Projetos excluídos",
        description: `${selectedItems.length} projetos foram excluídos com sucesso.`,
      });
      setSelectedItems([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir alguns projetos.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExport = () => {
    // Create artists map for lookup
    const artistsMap: Record<string, string> = {};
    artists.forEach(a => {
      artistsMap[a.id] = a.stage_name || a.name || '';
    });

    // Transform projects to include only form fields
    const exportData = projects.map(project => {
      const details = getProjectDetails(project);
      const songs = details?.songs || [];
      const artistName = project.artist_id ? artistsMap[project.artist_id] || '' : '';
      
      // If project has multiple songs, create one row per song
      if (songs.length > 0) {
        return songs.map((song: any) => ({
          'Tipo de Lançamento': details?.release_type === 'single' ? 'Single' : details?.release_type === 'ep' ? 'EP' : details?.release_type === 'album' ? 'Álbum' : details?.release_type || '',
          'Nome do EP/Álbum': details?.ep_album_name || '',
          'Artista Responsável': artistName,
          'Nome da Música': song.song_name || '',
          'Solo/Feat': song.collaboration_type === 'solo' ? 'Solo' : song.collaboration_type === 'feat' ? 'Feat' : song.collaboration_type || '',
          'Original/Remix': song.track_type === 'original' ? 'Original' : song.track_type === 'remix' ? 'Remix' : song.track_type || '',
          'Instrumental': song.instrumental === 'sim' ? 'Sim' : song.instrumental === 'nao' ? 'Não' : song.instrumental || '',
          'Duração': song.duration_minutes !== undefined ? `${song.duration_minutes}:${String(song.duration_seconds || 0).padStart(2, '0')}` : '',
          'Gênero Musical': song.genre || '',
          'Idioma': song.language || '',
          'Compositores': song.composers?.map((c: any) => c.name).filter(Boolean).join(', ') || '',
          'Intérpretes': song.performers?.map((p: any) => p.name).filter(Boolean).join(', ') || '',
          'Produtores': song.producers?.map((p: any) => p.name).filter(Boolean).join(', ') || '',
          'Letra': song.lyrics || '',
          'Observações': details?.observations || '',
          'Status': getStatusLabel(project.status || ''),
        }));
      }
      
      // If no songs, create single row with project info
      return [{
        'Tipo de Lançamento': details?.release_type === 'single' ? 'Single' : details?.release_type === 'ep' ? 'EP' : details?.release_type === 'album' ? 'Álbum' : details?.release_type || '',
        'Nome do EP/Álbum': details?.ep_album_name || '',
        'Artista Responsável': artistName,
        'Nome da Música': '',
        'Solo/Feat': '',
        'Original/Remix': '',
        'Instrumental': '',
        'Duração': '',
        'Gênero Musical': '',
        'Idioma': '',
        'Compositores': '',
        'Intérpretes': '',
        'Produtores': '',
        'Letra': '',
        'Observações': details?.observations || '',
        'Status': getStatusLabel(project.status || ''),
      }];
    }).flat();

    exportToExcel(exportData, "projetos", "Projetos");
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
          description: "O arquivo não contém dados para importar.",
          variant: "destructive",
        });
        return;
      }

      // Create artists map for lookup by name
      const artistsMap: Record<string, string> = {};
      artists.forEach(a => {
        if (a.name) artistsMap[a.name.toLowerCase()] = a.id;
        if (a.stage_name) artistsMap[a.stage_name.toLowerCase()] = a.id;
        if (a.full_name) artistsMap[(a.full_name as string).toLowerCase()] = a.id;
      });

      let successCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          const projectData = parseProjectImportRow(row, artistsMap);
          
          if (!projectData) {
            errorCount++;
            continue;
          }

          await createProjectMutation.mutateAsync({
            name: projectData.name,
            artist_id: projectData.artist_id || null,
            status: projectData.status,
            audio_files: projectData.audio_files,
          });
          
          successCount++;
        } catch (err) {
          console.error('Error importing project row:', err);
          errorCount++;
        }
      }

      toast({
        title: "Importação concluída",
        description: `${successCount} projetos importados com sucesso. ${errorCount > 0 ? `${errorCount} erros.` : ''}`,
      });
    } catch (error) {
      console.error('Error importing file:', error);
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

  if (error) {
    console.error('Error loading projects:', error);
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Projetos</h1>
                  <p className="text-sm text-muted-foreground">Gestão completa de projetos musicais</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="hidden sm:inline">Importar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={handleExport} disabled={projects.length === 0}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button size="sm" className="gap-1 sm:gap-2" onClick={() => setNewProjectModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Projeto</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DashboardCard title="Projetos Ativos" value={projects.filter(p => p.status === "in_progress").length} description="em desenvolvimento" icon={PlayCircle} />
              <DashboardCard title="Concluídos" value={projects.filter(p => p.status === "completed").length} description="projetos finalizados" icon={TrendingUp} />
              <DashboardCard title="Rascunhos" value={projects.filter(p => p.status === "draft").length} description="em planejamento" icon={Calendar} />
              <DashboardCard title="Total de Projetos" value={projects.length} description="cadastrados no sistema" icon={Music} />
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar por música, artista, compositor, intérprete, produtor, gênero..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Projects List */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lista de Projetos</CardTitle>
                    <CardDescription>Acompanhe o desenvolvimento de todos os projetos musicais</CardDescription>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum projeto cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Comece criando seu primeiro projeto musical</p>
                    <Button onClick={() => setNewProjectModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Projeto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All Header */}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <Checkbox
                        checked={selectedItems.length === filteredProjects.length && filteredProjects.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {selectedItems.length > 0 ? `${selectedItems.length} de ${filteredProjects.length} selecionados` : "Selecionar todos"}
                      </span>
                    </div>

                    {filteredProjects.map(project => {
                      const details = getProjectDetails(project);
                      const firstSong = details?.songs?.[0];
                      
                      return (
                        <div key={project.id} className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedItems.includes(project.id)}
                            onCheckedChange={(checked) => handleSelectItem(project.id, !!checked)}
                          />
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <h3 className="font-medium text-foreground">{project.name}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                  {(() => {
                                    const tag = getProjectTag(project.id, project.status);
                                    return (
                                      <Badge className={tag.color}>
                                        {tag.label}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                            
                            {/* Info Grid - Hidden on mobile, shown on lg+ */}
                            <div className="hidden lg:flex items-center gap-4 text-sm">
                              {firstSong && (
                                <>
                                  <div className="text-center">
                                    <div className="text-muted-foreground text-xs">Compositores</div>
                                    <div className="font-medium text-xs truncate max-w-[120px]">{firstSong.composers?.map((c: any) => c.name).filter(Boolean).join(', ') || '-'}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-muted-foreground text-xs">Intérpretes</div>
                                    <div className="font-medium text-xs truncate max-w-[120px]">{firstSong.performers?.map((p: any) => p.name).filter(Boolean).join(', ') || '-'}</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-muted-foreground text-xs">Gênero</div>
                                    <div className="font-medium text-xs">{firstSong.genre || '-'}</div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2 sm:ml-auto">
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleViewProject(project)}>Ver</Button>
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEditProject(project)}>Editar</Button>
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDeleteProject(project)}>Excluir</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <ProjectModal open={newProjectModalOpen} onOpenChange={setNewProjectModalOpen} project={null} mode="create" />
            <ProjectModal open={editModalOpen} onOpenChange={setEditModalOpen} project={selectedProject} mode="edit" />
            <ProjectViewModal open={viewModalOpen} onOpenChange={setViewModalOpen} project={selectedProject} />
            <DeleteConfirmationModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={confirmDeleteProject} title="Excluir Projeto" description={`Tem certeza que deseja excluir o projeto "${selectedProject?.name}"? Esta ação não pode ser desfeita.`} />
            <DeleteConfirmationModal open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen} onConfirm={confirmBulkDelete} title="Excluir Projetos" description={`Tem certeza que deseja excluir ${selectedItems.length} projetos? Esta ação não pode ser desfeita.`} isLoading={isDeletingBulk} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Projetos;
