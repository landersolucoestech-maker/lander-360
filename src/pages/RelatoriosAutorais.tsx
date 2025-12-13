import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Users, Music, Disc, Filter, 
  CheckCircle, XCircle, AlertTriangle, Edit, FolderKanban, Rocket
} from "lucide-react";
import { MusicEditModal } from "@/components/modals/MusicEditModal";
import { PhonogramEditModal } from "@/components/modals/PhonogramEditModal";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { format } from "date-fns";
import { translateStatus, formatDateBR } from "@/lib/utils";
import XLSX from "xlsx-js-style";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useReleases } from "@/hooks/useReleases";
import { DateInput } from "@/components/ui/date-input";

const RelatoriosAutorais = () => {
  const { toast } = useToast();
  const { data: musicRegistry = [], isLoading: isLoadingMusic } = useMusicRegistry();
  const { data: phonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: artists = [] } = useArtists();
  const { data: releases = [], isLoading: isLoadingReleases } = useReleases();
  const { data: projects = [] } = useProjects();

  // Filter states
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("artista");

  // Edit modals state
  const [editMusicModalOpen, setEditMusicModalOpen] = useState(false);
  const [editPhonogramModalOpen, setEditPhonogramModalOpen] = useState(false);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [selectedPhonogram, setSelectedPhonogram] = useState<any>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<any>(null);

  const handleEditMusic = (music: any) => {
    setSelectedMusic(music);
    setEditMusicModalOpen(true);
  };

  const handleEditPhonogram = (phono: any) => {
    setSelectedPhonogram(phono);
    setEditPhonogramModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProjectForEdit(project);
    setEditProjectModalOpen(true);
  };

  // Get artist name helper
  const getArtistName = (artistId: string | null) => {
    if (!artistId) return "N/A";
    const artist = artists.find(a => a.id === artistId);
    return artist?.stage_name || artist?.name || "N/A";
  };

  // Filter data based on selections
  const filteredMusic = useMemo(() => {
    return musicRegistry.filter(music => {
      if (selectedArtist !== "all" && music.artist_id !== selectedArtist) return false;
      if (selectedProjectFilter !== "all" && music.project_id !== selectedProjectFilter) return false;
      if (selectedStatus !== "all" && music.status !== selectedStatus) return false;
      if (startDate && music.release_date && new Date(music.release_date) < startDate) return false;
      if (endDate && music.release_date && new Date(music.release_date) > endDate) return false;
      return true;
    });
  }, [musicRegistry, selectedArtist, selectedProjectFilter, selectedStatus, startDate, endDate]);

  const filteredPhonograms = useMemo(() => {
    return phonograms.filter(phono => {
      if (selectedArtist !== "all" && phono.artist_id !== selectedArtist) return false;
      if (selectedStatus !== "all" && phono.status !== selectedStatus) return false;
      if (startDate && phono.recording_date && new Date(phono.recording_date) < startDate) return false;
      if (endDate && phono.recording_date && new Date(phono.recording_date) > endDate) return false;
      return true;
    });
  }, [phonograms, selectedArtist, selectedStatus, startDate, endDate]);

  // Stats by artist
  const artistStats = useMemo(() => {
    const stats: Record<string, { works: number; phonograms: number; verified: number; pending: number }> = {};
    
    filteredMusic.forEach(music => {
      const artistId = music.artist_id || "unknown";
      if (!stats[artistId]) {
        stats[artistId] = { works: 0, phonograms: 0, verified: 0, pending: 0 };
      }
      stats[artistId].works++;
      if ((music as any).royalties_verified) {
        stats[artistId].verified++;
      } else {
        stats[artistId].pending++;
      }
    });

    filteredPhonograms.forEach(phono => {
      const artistId = phono.artist_id || "unknown";
      if (!stats[artistId]) {
        stats[artistId] = { works: 0, phonograms: 0, verified: 0, pending: 0 };
      }
      stats[artistId].phonograms++;
    });

    return Object.entries(stats).map(([artistId, data]) => ({
      artistId,
      artistName: getArtistName(artistId),
      ...data
    }));
  }, [filteredMusic, filteredPhonograms, artists]);


  const handleExportArtistReport = () => {
    const data = artistStats.map(stat => ({
      "Artista": stat.artistName,
      "Total Obras": stat.works,
      "Total Fonogramas": stat.phonograms,
      "Royalties Conferidos": stat.verified,
      "Pendentes Conferência": stat.pending
    }));

    exportToExcel(data, "relatorio_por_artista");
  };

  const handleExportWorksReport = () => {
    const data = filteredMusic.map(music => ({
      "Título": music.title,
      "Artista": getArtistName(music.artist_id),
      "ISWC": music.iswc || "-",
      "Cód. ECAD": music.ecad_code || "-",
      "Cód. ABRAMUS": music.abramus_code || "-",
      "Gênero": music.genre || "-",
      "Status": translateStatus(music.status),
      "ISWC Preenchido": music.iswc ? "Sim" : "Não",
      "ECAD Preenchido": music.ecad_code ? "Sim" : "Não",
      "ABRAMUS Preenchido": music.abramus_code ? "Sim" : "Não"
    }));

    exportToExcel(data, "relatorio_obras");
  };

  const handleExportPhonogramsReport = () => {
    const data = filteredPhonograms.map(phono => ({
      "Título": phono.title,
      "Artista": getArtistName(phono.artist_id),
      "ISRC": phono.isrc || "-",
      "Cód. ECAD": (phono as any).ecad_code || "-",
      "Cód. ABRAMUS": (phono as any).abramus_code || "-",
      "Gravadora": phono.label || "-",
      "Status": translateStatus(phono.status),
      "ISRC Preenchido": phono.isrc ? "Sim" : "Não",
      "ECAD Preenchido": (phono as any).ecad_code ? "Sim" : "Não",
      "ABRAMUS Preenchido": (phono as any).abramus_code ? "Sim" : "Não"
    }));

    exportToExcel(data, "relatorio_fonogramas");
  };


  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `${filename}_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

    toast({
      title: "Exportação concluída",
      description: `Arquivo ${filename}.xlsx gerado com sucesso.`,
    });
  };

  const clearFilters = () => {
    setSelectedArtist("all");
    setSelectedProjectFilter("all");
    setSelectedStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (selectedArtist !== "all" && project.artist_id !== selectedArtist) return false;
      if (selectedStatus !== "all" && project.status !== selectedStatus) return false;
      if (startDate && project.start_date && new Date(project.start_date) < startDate) return false;
      if (endDate && project.end_date && new Date(project.end_date) > endDate) return false;
      return true;
    });
  }, [projects, selectedArtist, selectedStatus, startDate, endDate]);

  // Filtered releases
  const filteredReleases = useMemo(() => {
    return releases.filter(release => {
      if (selectedArtist !== "all" && release.artist_id !== selectedArtist) return false;
      if (selectedStatus !== "all" && release.status !== selectedStatus) return false;
      if (startDate && release.release_date && new Date(release.release_date) < startDate) return false;
      if (endDate && release.release_date && new Date(release.release_date) > endDate) return false;
      return true;
    });
  }, [releases, selectedArtist, selectedStatus, startDate, endDate]);

  // Export functions for projects and releases
  const handleExportProjectsReport = () => {
    const data = filteredProjects.map(project => ({
      "Nome": project.name,
      "Artista": getArtistName(project.artist_id),
      "Status": translateStatus(project.status),
      "Data Início": project.start_date ? formatDateBR(new Date(project.start_date)) : "-",
      "Data Fim": project.end_date ? formatDateBR(new Date(project.end_date)) : "-",
      "Orçamento": project.budget || "-",
      "Descrição": project.description || "-"
    }));

    exportToExcel(data, "relatorio_projetos");
  };

  const handleExportReleasesReport = () => {
    const data = filteredReleases.map(release => ({
      "Título": release.title,
      "Artista": getArtistName(release.artist_id),
      "Tipo": release.release_type || release.type || "-",
      "Status": translateStatus(release.status),
      "Data Lançamento": release.release_date ? formatDateBR(new Date(release.release_date)) : "-",
      "Gênero": release.genre || "-",
      "Gravadora": release.label || "-",
      "Copyright": release.copyright || "-"
    }));

    exportToExcel(data, "relatorio_lancamentos");
  };

  const isLoading = isLoadingMusic || isLoadingPhonograms || isLoadingReleases;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 lg:h-16 shrink-0 items-center gap-2 border-b border-border px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold text-foreground">Auditoria</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Auditoria de obras, fonogramas, projetos e lançamentos</p>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Artista</Label>
                    <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os artistas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os artistas</SelectItem>
                        {artists.map(artist => (
                          <SelectItem key={artist.id} value={artist.id}>
                            {artist.stage_name || artist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Projeto</Label>
                    <Select value={selectedProjectFilter} onValueChange={setSelectedProjectFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os projetos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os projetos</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aceita">Aceita</SelectItem>
                        <SelectItem value="recusada">Recusada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <DateInput
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <DateInput
                      value={endDate}
                      onChange={setEndDate}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full lg:w-auto">
                <TabsTrigger value="artista" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Por Artista</span>
                </TabsTrigger>
                <TabsTrigger value="projetos" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  <span className="hidden sm:inline">Projetos</span>
                </TabsTrigger>
                <TabsTrigger value="obras" className="gap-2">
                  <Music className="h-4 w-4" />
                  <span className="hidden sm:inline">Obras</span>
                </TabsTrigger>
                <TabsTrigger value="fonogramas" className="gap-2">
                  <Disc className="h-4 w-4" />
                  <span className="hidden sm:inline">Fonogramas</span>
                </TabsTrigger>
                <TabsTrigger value="lancamentos" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Lançamentos</span>
                </TabsTrigger>
              </TabsList>

              {/* Por Artista Tab */}
              <TabsContent value="artista" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório por Artista</h2>
                  <Button onClick={handleExportArtistReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : artistStats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum dado encontrado</div>
                ) : (
                  <div className="grid gap-4">
                    {artistStats.map(stat => (
                      <Card key={stat.artistId}>
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{stat.artistName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {stat.works} obras • {stat.phonograms} fonogramas
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stat.verified}</div>
                                <div className="text-xs text-muted-foreground">Conferidos</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stat.pending}</div>
                                <div className="text-xs text-muted-foreground">Pendentes</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Obras Tab */}
              <TabsContent value="obras" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório de Obras</h2>
                  <Button onClick={handleExportWorksReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {/* KPIs de Pendências */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Obras</p>
                          <p className="text-2xl font-bold">{filteredMusic.length}</p>
                        </div>
                        <Music className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Com ISWC</p>
                          <p className="text-2xl font-bold text-green-600">{filteredMusic.filter(m => m.iswc).length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sem ISWC</p>
                          <p className="text-2xl font-bold text-yellow-600">{filteredMusic.filter(m => !m.iswc).length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sem ECAD/ABRAMUS</p>
                          <p className="text-2xl font-bold text-red-600">{filteredMusic.filter(m => !m.ecad_code && !m.abramus_code).length}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredMusic.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhuma obra encontrada</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Título</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-left p-3">ISWC</th>
                              <th className="text-left p-3">Cód. ECAD</th>
                              <th className="text-left p-3">Cód. ABRAMUS</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-center p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMusic.map(music => (
                              <tr key={music.id} className="border-t border-border hover:bg-muted/30">
                                <td className="p-3 font-medium">{music.title}</td>
                                <td className="p-3">{getArtistName(music.artist_id)}</td>
                                <td className="p-3">
                                  {music.iswc ? (
                                    <span className="text-green-600">{music.iswc}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {music.ecad_code ? (
                                    <span className="text-green-600">{music.ecad_code}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {music.abramus_code ? (
                                    <span className="text-green-600">{music.abramus_code}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline">{translateStatus(music.status)}</Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditMusic(music)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Fonogramas Tab */}
              <TabsContent value="fonogramas" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório de Fonogramas</h2>
                  <Button onClick={handleExportPhonogramsReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {/* KPIs de Pendências */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Fonogramas</p>
                          <p className="text-2xl font-bold">{filteredPhonograms.length}</p>
                        </div>
                        <Disc className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Com ISRC</p>
                          <p className="text-2xl font-bold text-green-600">{filteredPhonograms.filter(p => p.isrc).length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sem ISRC</p>
                          <p className="text-2xl font-bold text-yellow-600">{filteredPhonograms.filter(p => !p.isrc).length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Sem ECAD/ABRAMUS</p>
                          <p className="text-2xl font-bold text-red-600">{filteredPhonograms.filter(p => !(p as any).ecad_code && !(p as any).abramus_code).length}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredPhonograms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum fonograma encontrado</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Título</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-left p-3">ISRC</th>
                              <th className="text-left p-3">Cód. ECAD</th>
                              <th className="text-left p-3">Cód. ABRAMUS</th>
                              <th className="text-left p-3">Gravadora</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-center p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPhonograms.map(phono => (
                              <tr key={phono.id} className="border-t border-border hover:bg-muted/30">
                                <td className="p-3 font-medium">{phono.title}</td>
                                <td className="p-3">{getArtistName(phono.artist_id)}</td>
                                <td className="p-3">
                                  {phono.isrc ? (
                                    <span className="text-green-600">{phono.isrc}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {(phono as any).ecad_code ? (
                                    <span className="text-green-600">{(phono as any).ecad_code}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {(phono as any).abramus_code ? (
                                    <span className="text-green-600">{(phono as any).abramus_code}</span>
                                  ) : (
                                    <span className="text-yellow-600">Não preenchido</span>
                                  )}
                                </td>
                                <td className="p-3">{phono.label || "-"}</td>
                                <td className="p-3">
                                  <Badge variant="outline">{translateStatus(phono.status)}</Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditPhonogram(phono)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Projetos Tab */}
              <TabsContent value="projetos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório de Projetos</h2>
                  <Button onClick={handleExportProjectsReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {/* KPIs de Projetos */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Projetos</p>
                          <p className="text-2xl font-bold">{filteredProjects.length}</p>
                        </div>
                        <FolderKanban className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Concluídos</p>
                          <p className="text-2xl font-bold text-green-600">{filteredProjects.filter(p => p.status === 'completed').length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Em Progresso</p>
                          <p className="text-2xl font-bold text-yellow-600">{filteredProjects.filter(p => p.status === 'in_progress').length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Rascunho</p>
                          <p className="text-2xl font-bold text-gray-600">{filteredProjects.filter(p => p.status === 'draft' || p.status === 'planning').length}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-gray-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum projeto encontrado</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Nome</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Data Início</th>
                              <th className="text-left p-3">Data Fim</th>
                              <th className="text-center p-3">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProjects.map(project => (
                              <tr key={project.id} className="border-t border-border hover:bg-muted/30">
                                <td className="p-3 font-medium">{project.name}</td>
                                <td className="p-3">{getArtistName(project.artist_id)}</td>
                                <td className="p-3">
                                  <Badge variant="outline">{translateStatus(project.status)}</Badge>
                                </td>
                                <td className="p-3">{project.start_date ? formatDateBR(new Date(project.start_date)) : "-"}</td>
                                <td className="p-3">{project.end_date ? formatDateBR(new Date(project.end_date)) : "-"}</td>
                                <td className="p-3 text-center">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Lançamentos Tab */}
              <TabsContent value="lancamentos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório de Lançamentos</h2>
                  <Button onClick={handleExportReleasesReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {/* KPIs de Lançamentos */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Lançamentos</p>
                          <p className="text-2xl font-bold">{filteredReleases.length}</p>
                        </div>
                        <Rocket className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Aceitos</p>
                          <p className="text-2xl font-bold text-green-600">{filteredReleases.filter(r => r.status === 'aceita').length}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Em Análise</p>
                          <p className="text-2xl font-bold text-yellow-600">{filteredReleases.filter(r => r.status === 'em_analise' || r.status === 'planning').length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Recusados</p>
                          <p className="text-2xl font-bold text-red-600">{filteredReleases.filter(r => r.status === 'recusada').length}</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">Carregando...</div>
                ) : filteredReleases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Nenhum lançamento encontrado</div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-3">Título</th>
                              <th className="text-left p-3">Artista</th>
                              <th className="text-left p-3">Tipo</th>
                              <th className="text-left p-3">Data Lançamento</th>
                              <th className="text-left p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredReleases.map(release => (
                              <tr key={release.id} className="border-t border-border hover:bg-muted/30">
                                <td className="p-3 font-medium">{release.title}</td>
                                <td className="p-3">{getArtistName(release.artist_id)}</td>
                                <td className="p-3">{release.release_type || release.type || "-"}</td>
                                <td className="p-3">{release.release_date ? formatDateBR(new Date(release.release_date)) : "-"}</td>
                                <td className="p-3">
                                  <Badge variant="outline">{translateStatus(release.status)}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      {/* Edit Modals */}
      <MusicEditModal
        open={editMusicModalOpen}
        onOpenChange={setEditMusicModalOpen}
        song={selectedMusic}
      />
      <PhonogramEditModal
        open={editPhonogramModalOpen}
        onOpenChange={setEditPhonogramModalOpen}
        phonogram={selectedPhonogram}
      />
      <ProjectModal
        open={editProjectModalOpen}
        onOpenChange={setEditProjectModalOpen}
        project={selectedProjectForEdit}
        mode="edit"
      />
    </SidebarProvider>
  );
};

export default RelatoriosAutorais;
