import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, Download, Users, Music, Disc, Filter, Calendar, 
  Building2, CheckCircle, XCircle, AlertTriangle, DollarSign,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatDateBR, translateStatus } from "@/lib/utils";
import XLSX from "xlsx-js-style";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry } from "@/hooks/useMusicRegistry";
import { usePhonograms } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { DateInput } from "@/components/ui/date-input";

const RelatoriosAutorais = () => {
  const { toast } = useToast();
  const { data: musicRegistry = [], isLoading: isLoadingMusic } = useMusicRegistry();
  const { data: phonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: artists = [] } = useArtists();
  const { data: projects = [] } = useProjects();

  // Filter states
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("artista");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

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
      if (selectedProject !== "all" && music.project_id !== selectedProject) return false;
      if (selectedStatus !== "all" && music.status !== selectedStatus) return false;
      if (startDate && music.release_date && new Date(music.release_date) < startDate) return false;
      if (endDate && music.release_date && new Date(music.release_date) > endDate) return false;
      return true;
    });
  }, [musicRegistry, selectedArtist, selectedProject, selectedStatus, startDate, endDate]);

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

  // ECAD/Associações report data
  const ecadReport = useMemo(() => {
    const worksWithCodes = filteredMusic.filter(m => m.ecad_code || m.abramus_code);
    const worksWithoutCodes = filteredMusic.filter(m => !m.ecad_code && !m.abramus_code);
    const phonogramsWithCodes = filteredPhonograms.filter(p => (p as any).ecad_code || (p as any).abramus_code || p.isrc);
    const phonogramsWithoutCodes = filteredPhonograms.filter(p => !(p as any).ecad_code && !(p as any).abramus_code && !p.isrc);

    return {
      totalWorks: filteredMusic.length,
      worksRegistered: worksWithCodes.length,
      worksPending: worksWithoutCodes.length,
      totalPhonograms: filteredPhonograms.length,
      phonogramsRegistered: phonogramsWithCodes.length,
      phonogramsPending: phonogramsWithoutCodes.length,
      details: {
        worksWithCodes,
        worksWithoutCodes,
        phonogramsWithCodes,
        phonogramsWithoutCodes
      }
    };
  }, [filteredMusic, filteredPhonograms]);

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
      "Royalties Conferidos": (music as any).royalties_verified ? "Sim" : "Não",
      "Valor Esperado": (music as any).royalties_expected || 0,
      "Valor Recebido": (music as any).royalties_received || 0,
      "Divergência": ((music as any).royalties_expected || 0) - ((music as any).royalties_received || 0)
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
      "Royalties Conferidos": (phono as any).royalties_verified ? "Sim" : "Não",
      "Valor Esperado": (phono as any).royalties_expected || 0,
      "Valor Recebido": (phono as any).royalties_received || 0,
      "Divergência": ((phono as any).royalties_expected || 0) - ((phono as any).royalties_received || 0)
    }));

    exportToExcel(data, "relatorio_fonogramas");
  };

  const handleExportEcadReport = () => {
    const worksData = filteredMusic.map(music => ({
      "Tipo": "Obra",
      "Título": music.title,
      "Artista": getArtistName(music.artist_id),
      "ISWC": music.iswc || "-",
      "Cód. ECAD": music.ecad_code || "-",
      "Cód. ABRAMUS": music.abramus_code || "-",
      "Compositores": music.writers?.join(", ") || "-",
      "Editoras": music.publishers?.join(", ") || "-",
      "Status Registro": (music.ecad_code || music.abramus_code) ? "Registrado" : "Pendente"
    }));

    const phonogramData = filteredPhonograms.map(phono => ({
      "Tipo": "Fonograma",
      "Título": phono.title,
      "Artista": getArtistName(phono.artist_id),
      "ISRC": phono.isrc || "-",
      "Cód. ECAD": (phono as any).ecad_code || "-",
      "Cód. ABRAMUS": (phono as any).abramus_code || "-",
      "Gravadora": phono.label || "-",
      "Proprietário Master": phono.master_owner || "-",
      "Status Registro": ((phono as any).ecad_code || (phono as any).abramus_code || phono.isrc) ? "Registrado" : "Pendente"
    }));

    exportToExcel([...worksData, ...phonogramData], "relatorio_ecad_associacoes");
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
    setSelectedProject("all");
    setSelectedStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const isLoading = isLoadingMusic || isLoadingPhonograms;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-14 lg:h-16 shrink-0 items-center gap-2 border-b border-border px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <h1 className="text-lg lg:text-xl font-semibold text-foreground">Relatórios Autorais</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Relatórios para ECAD, associações e gestão de royalties</p>
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
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
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
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto">
                <TabsTrigger value="artista" className="gap-2">
                  <Users className="h-4 w-4" />
                  Por Artista
                </TabsTrigger>
                <TabsTrigger value="obras" className="gap-2">
                  <Music className="h-4 w-4" />
                  Obras
                </TabsTrigger>
                <TabsTrigger value="fonogramas" className="gap-2">
                  <Disc className="h-4 w-4" />
                  Fonogramas
                </TabsTrigger>
                <TabsTrigger value="ecad" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  ECAD/Associações
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
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Conferido</th>
                              <th className="text-right p-3">Esperado</th>
                              <th className="text-right p-3">Recebido</th>
                              <th className="text-right p-3">Divergência</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMusic.map(music => {
                              const divergence = ((music as any).royalties_expected || 0) - ((music as any).royalties_received || 0);
                              return (
                                <tr key={music.id} className="border-t border-border hover:bg-muted/30">
                                  <td className="p-3 font-medium">{music.title}</td>
                                  <td className="p-3">{getArtistName(music.artist_id)}</td>
                                  <td className="p-3">{music.iswc || "-"}</td>
                                  <td className="p-3">{music.ecad_code || "-"}</td>
                                  <td className="p-3">
                                    <Badge variant="outline">{translateStatus(music.status)}</Badge>
                                  </td>
                                  <td className="p-3">
                                    {(music as any).royalties_verified ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </td>
                                  <td className="p-3 text-right">R$ {((music as any).royalties_expected || 0).toFixed(2)}</td>
                                  <td className="p-3 text-right">R$ {((music as any).royalties_received || 0).toFixed(2)}</td>
                                  <td className={cn(
                                    "p-3 text-right font-medium",
                                    divergence > 0 ? "text-red-600" : divergence < 0 ? "text-green-600" : ""
                                  )}>
                                    {divergence > 0 && <TrendingDown className="inline h-4 w-4 mr-1" />}
                                    {divergence < 0 && <TrendingUp className="inline h-4 w-4 mr-1" />}
                                    {divergence === 0 && <Minus className="inline h-4 w-4 mr-1" />}
                                    R$ {Math.abs(divergence).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
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
                              <th className="text-left p-3">Gravadora</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Conferido</th>
                              <th className="text-right p-3">Esperado</th>
                              <th className="text-right p-3">Recebido</th>
                              <th className="text-right p-3">Divergência</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPhonograms.map(phono => {
                              const divergence = ((phono as any).royalties_expected || 0) - ((phono as any).royalties_received || 0);
                              return (
                                <tr key={phono.id} className="border-t border-border hover:bg-muted/30">
                                  <td className="p-3 font-medium">{phono.title}</td>
                                  <td className="p-3">{getArtistName(phono.artist_id)}</td>
                                  <td className="p-3">{phono.isrc || "-"}</td>
                                  <td className="p-3">{phono.label || "-"}</td>
                                  <td className="p-3">
                                    <Badge variant="outline">{translateStatus(phono.status)}</Badge>
                                  </td>
                                  <td className="p-3">
                                    {(phono as any).royalties_verified ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </td>
                                  <td className="p-3 text-right">R$ {((phono as any).royalties_expected || 0).toFixed(2)}</td>
                                  <td className="p-3 text-right">R$ {((phono as any).royalties_received || 0).toFixed(2)}</td>
                                  <td className={cn(
                                    "p-3 text-right font-medium",
                                    divergence > 0 ? "text-red-600" : divergence < 0 ? "text-green-600" : ""
                                  )}>
                                    {divergence > 0 && <TrendingDown className="inline h-4 w-4 mr-1" />}
                                    {divergence < 0 && <TrendingUp className="inline h-4 w-4 mr-1" />}
                                    {divergence === 0 && <Minus className="inline h-4 w-4 mr-1" />}
                                    R$ {Math.abs(divergence).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ECAD/Associações Tab */}
              <TabsContent value="ecad" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Relatório ECAD/Associações</h2>
                  <Button onClick={handleExportEcadReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Obras Registradas</p>
                          <p className="text-2xl font-bold text-green-600">{ecadReport.worksRegistered}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Obras Pendentes</p>
                          <p className="text-2xl font-bold text-yellow-600">{ecadReport.worksPending}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Fonogramas Registrados</p>
                          <p className="text-2xl font-bold text-green-600">{ecadReport.phonogramsRegistered}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Fonogramas Pendentes</p>
                          <p className="text-2xl font-bold text-yellow-600">{ecadReport.phonogramsPending}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Items List */}
                {(ecadReport.worksPending > 0 || ecadReport.phonogramsPending > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        Itens Pendentes de Registro
                      </CardTitle>
                      <CardDescription>
                        Obras e fonogramas sem código ECAD/ABRAMUS
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {ecadReport.details.worksWithoutCodes.slice(0, 10).map(music => (
                          <div key={music.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Music className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{music.title}</p>
                                <p className="text-sm text-muted-foreground">{getArtistName(music.artist_id)} • Obra</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Sem Código
                            </Badge>
                          </div>
                        ))}
                        {ecadReport.details.phonogramsWithoutCodes.slice(0, 10).map(phono => (
                          <div key={phono.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Disc className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{phono.title}</p>
                                <p className="text-sm text-muted-foreground">{getArtistName(phono.artist_id)} • Fonograma</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Sem ISRC/Código
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RelatoriosAutorais;
