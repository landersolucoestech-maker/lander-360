import React, { useState, useEffect, useRef, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchFilter } from "@/components/filters/SearchFilter";
import { ReleaseForm } from "@/components/forms/ReleaseForm";
import { ReleaseCard } from "@/components/releases/ReleaseCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { ReleaseMetricsModal } from "@/components/modals/ReleaseMetricsModal";
import { Music, Plus, Calendar, TrendingUp, Eye, AlertTriangle, Upload, Download, Loader2, Disc, Users, FileText, BarChart3, Trash2, PieChart } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube, FaDeezer } from "react-icons/fa";
import { useReleaseMetrics } from "@/hooks/useReleaseMetrics";
import { useToast } from "@/hooks/use-toast";
import { useReleases, useDeleteRelease, useCreateRelease } from "@/hooks/useReleases";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { useDataExport } from "@/hooks/useDataExport";
import { formatDateBR } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useArtistFilter } from "@/hooks/useLinkedArtist";
import { useNavigate } from "react-router-dom";

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Component to display release details with metrics
function ReleaseDetailsContent({
  release
}: {
  release: any;
}) {
  const {
    data: metrics
  } = useReleaseMetrics(release?.id);

  // Parse tracks from JSON if needed
  const tracks = Array.isArray(release.tracks) ? release.tracks : [];
  const getDistributorLabel = (id: string) => {
    const map: Record<string, string> = {
      'onerpm': 'ONErpm',
      'distrokid': 'DistroKid',
      '30por1': '30por1',
      'outras_distribuidoras': 'Outras'
    };
    return map[id] || id;
  };
  return <div className="space-y-6">
      {/* Header with cover and basic info */}
      <div className="flex gap-6">
        {(release.cover || release.cover_url) && <div className="flex-shrink-0">
            <img src={release.cover || release.cover_url} alt={release.title} className="w-40 h-40 object-cover rounded-lg shadow-md" />
          </div>}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-2xl font-bold">{release.title}</h3>
            <p className="text-lg text-muted-foreground">{release.artist}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {release.type || release.release_type || 'Single'}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${release.approvalStatus === 'aprovado' ? 'bg-green-500/10 text-green-500' : release.approvalStatus === 'em_analise' ? 'bg-yellow-500/10 text-yellow-500' : release.approvalStatus === 'rejeitado' ? 'bg-red-500/10 text-red-500' : release.approvalStatus === 'pausado' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              {release.approvalStatus === 'aprovado' ? 'Aprovado' : release.approvalStatus === 'em_analise' ? 'Em Análise' : release.approvalStatus === 'rejeitado' ? 'Rejeitado' : release.approvalStatus === 'pausado' ? 'Pausado' : 'Em Análise'}
            </span>
            {release.hasMarketingPlan && <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${release.priority === 'alta' ? 'bg-destructive/10 text-destructive' : release.priority === 'media' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                Prioridade: {release.priority === 'alta' ? 'Alta' : release.priority === 'media' ? 'Média' : 'Baixa'}
              </span>}
          </div>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <p className="font-medium capitalize">{release.status || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Data de Lançamento</label>
          <p className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDateBR(release.releaseDate || release.release_date)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Gênero</label>
          <p className="font-medium capitalize">{release.genre || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Idioma</label>
          <p className="font-medium capitalize">{release.language || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Gravadora</label>
          <p className="font-medium">{release.label || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Copyright</label>
          <p className="font-medium">{release.copyright || '-'}</p>
        </div>
      </div>

      {/* Distributors */}
      {release.distributors && release.distributors.length > 0 && <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Distribuidoras</label>
          <div className="flex flex-wrap gap-2">
            {release.distributors.map((dist: string, index: number) => <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {getDistributorLabel(dist)}
              </span>)}
          </div>
        </div>}

      {/* Distribution Notes */}
      {release.distribution_notes && <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notas de Distribuição
          </label>
          <p className="text-sm bg-muted/30 p-3 rounded-lg">{release.distribution_notes}</p>
        </div>}

      {/* Streaming Metrics */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Métricas de Streaming
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <FaSpotify className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground mb-1">Spotify</div>
            <div className="font-bold">
              {metrics?.byPlatform?.spotify?.streams ? formatNumber(metrics.byPlatform.spotify.streams) : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <FaApple className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-xs text-muted-foreground mb-1">Apple Music</div>
            <div className="font-bold">
              {metrics?.byPlatform?.apple_music?.streams ? formatNumber(metrics.byPlatform.apple_music.streams) : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <FaYoutube className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground mb-1">YouTube</div>
            <div className="font-bold">
              {metrics?.byPlatform?.youtube?.views ? formatNumber(metrics.byPlatform.youtube.views) : '—'}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <FaDeezer className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-xs text-muted-foreground mb-1">Deezer</div>
            <div className="font-bold">
              {metrics?.byPlatform?.deezer?.streams ? formatNumber(metrics.byPlatform.deezer.streams) : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.length > 0 && <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Disc className="h-4 w-4" />
            Faixas ({tracks.length})
          </label>
          <div className="space-y-3">
            {tracks.map((track: any, index: number) => <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="font-medium">{track.title || 'Sem título'}</p>
                      <p className="text-sm text-muted-foreground">{track.artist || release.artist}</p>
                    </div>
                  </div>
                  {track.isrc && <span className="text-xs bg-secondary px-2 py-1 rounded">ISRC: {track.isrc}</span>}
                </div>
                
                {/* Credits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {track.composers && track.composers.length > 0 && <div>
                      <span className="text-muted-foreground">Compositores: </span>
                      <span>{track.composers.join(', ')}</span>
                    </div>}
                  {track.performers && track.performers.length > 0 && <div>
                      <span className="text-muted-foreground">Intérpretes: </span>
                      <span>{track.performers.join(', ')}</span>
                    </div>}
                  {track.producers && track.producers.length > 0 && <div>
                      <span className="text-muted-foreground">Produtores: </span>
                      <span>{track.producers.join(', ')}</span>
                    </div>}
                </div>

                {/* Lyrics preview */}
                {track.lyrics && <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Letra: </span>
                    <span className="text-xs">{track.lyrics.substring(0, 100)}{track.lyrics.length > 100 ? '...' : ''}</span>
                  </div>}
              </div>)}
          </div>
        </div>}
    </div>;
}
const Lancamentos = () => {
  const navigate = useNavigate();
  
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const {
    toast
  } = useToast();
  const {
    data: allReleasesData = [],
    isLoading,
    refetch
  } = useReleases();
  const {
    data: allArtists = []
  } = useArtists();
  const {
    data: allProjects = []
  } = useProjects();
  const deleteRelease = useDeleteRelease();
  const createRelease = useCreateRelease();
  const {
    exportToExcel,
    parseExcelFile
  } = useDataExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Aplicar filtro de artista
  const releasesData = useMemo(() => {
    if (shouldFilter && artistId) {
      return allReleasesData.filter((r: any) => r.artist_id === artistId);
    }
    return allReleasesData;
  }, [allReleasesData, shouldFilter, artistId]);

  const artists = useMemo(() => {
    if (shouldFilter && artistId) {
      return allArtists.filter((a: any) => a.id === artistId);
    }
    return allArtists;
  }, [allArtists, shouldFilter, artistId]);

  const projects = useMemo(() => {
    if (shouldFilter && artistId) {
      return allProjects.filter((p: any) => p.artist_id === artistId);
    }
    return allProjects;
  }, [allProjects, shouldFilter, artistId]);

  // Map database status to UI approval status
  const mapDbStatusToApprovalStatus = (dbStatus: string | undefined): 'em_analise' | 'aprovado' | 'rejeitado' | 'pausado' | 'takedown' => {
    if (!dbStatus) return 'em_analise';
    switch (dbStatus) {
      case 'released':
        return 'aprovado';
      case 'cancelled':
        return 'rejeitado';
      case 'paused':
        return 'pausado';
      case 'takedown':
        return 'takedown';
      case 'aprovado':
        return 'aprovado';
      case 'rejeitado':
        return 'rejeitado';
      case 'pausado':
        return 'pausado';
      case 'em_analise':
        return 'em_analise';
      case 'planning':
      default:
        return 'em_analise';
    }
  };
  const allReleases = releasesData.map((release: any) => {
    const artist = artists.find((a: any) => a.id === release.artist_id);
    return {
      ...release,
      artist: artist?.name || artist?.name || 'Artista Desconhecido',
      cover: release.cover_url,
      releaseDate: release.release_date || new Date().toISOString(),
      approvalStatus: mapDbStatusToApprovalStatus(release.status),
      priority: 'media'
    };
  });
  const [filteredReleases, setFilteredReleases] = useState<any[]>([]);
  const [isNewReleaseModalOpen, setIsNewReleaseModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  useEffect(() => {
    // Reapply current filters when releases data changes
    if (currentSearchTerm || Object.values(currentFilters).some(v => v)) {
      filterReleases(currentSearchTerm, currentFilters);
    } else {
      setFilteredReleases(allReleases);
    }
  }, [releasesData, artists]);
  const filterOptions = [{
    key: "type",
    label: "Tipo",
    options: ["Single", "EP", "Álbum"]
  }, {
    key: "status",
    label: "Status",
    options: ["Em Análise", "Aprovado", "Rejeitado", "Pausado", "Takedown"]
  }, {
    key: "artist",
    label: "Artista",
    options: []
  }];
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [currentFilters, setCurrentFilters] = useState<Record<string, string>>({});
  const handleSearch = (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    filterReleases(searchTerm, currentFilters);
  };
  const handleFilter = (filters: Record<string, string>) => {
    setCurrentFilters(filters);
    filterReleases(currentSearchTerm, filters);
  };
  const handleClear = () => {
    setCurrentSearchTerm("");
    setCurrentFilters({});
    setFilteredReleases(allReleases);
  };
  const filterReleases = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = allReleases;
    if (searchTerm) {
      filtered = filtered.filter(release => release.title.toLowerCase().includes(searchTerm.toLowerCase()) || release.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(release => {
          if (key === "type") return release.type === value;
          if (key === "status") return release.status === value;
          if (key === "artist") return release.artist === value;
          return true;
        });
      }
    });
    setFilteredReleases(filtered);
  };
  const handleNewRelease = () => {
    setIsNewReleaseModalOpen(true);
  };
  const handleViewDetails = (release: any) => {
    setSelectedRelease(release);
    setIsDetailsModalOpen(true);
  };
  const handleEditRelease = (release: any) => {
    setSelectedRelease(release);
    setIsEditModalOpen(true);
  };
  const handleDeleteRelease = (release: any) => {
    setReleaseToDelete(release);
    setIsDeleteModalOpen(true);
  };
  const handleViewMetrics = (release: any) => {
    setSelectedRelease(release);
    setIsMetricsModalOpen(true);
  };
  const confirmDeleteRelease = async () => {
    if (releaseToDelete) {
      try {
        await deleteRelease.mutateAsync(releaseToDelete.id);
        setIsDeleteModalOpen(false);
        setReleaseToDelete(null);
      } catch (error) {
        console.error('Error deleting release:', error);
      }
    }
  };
  const toggleSelectRelease = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReleases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReleases.map(r => r.id));
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      for (const id of selectedIds) {
        await deleteRelease.mutateAsync(id);
      }
      toast({
        title: "Exclusão concluída",
        description: `${selectedIds.length} lançamento(s) excluído(s) com sucesso.`
      });
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error('Error bulk deleting releases:', error);
      toast({
        title: "Erro na exclusão",
        description: "Falha ao excluir lançamentos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };
  const handleExport = () => {
    const artistsMap = artists.reduce((acc: Record<string, string>, artist: any) => {
      acc[artist.id] = artist.name;
      return acc;
    }, {});

    // Add project names to releases data
    const releasesWithProjectNames = releasesData.map((release: any) => {
      const project = projects.find((p: any) => p.id === release.project_id);
      return {
        ...release,
        project_name: project?.name || ''
      };
    });
    exportToExcel(releasesWithProjectNames, "lancamentos", "Lançamentos", "releases", artistsMap);
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await parseExcelFile(file);
      let imported = 0;

      // Map distributors from Portuguese labels to codes
      const distributorMap: Record<string, string> = {
        'onerpm': 'onerpm',
        'ONErpm': 'onerpm',
        'distrokid': 'distrokid',
        'DistroKid': 'distrokid',
        '30por1': '30por1',
        'outras': 'outras_distribuidoras',
        'Outras': 'outras_distribuidoras'
      };

      // Map release type from Portuguese to code
      const releaseTypeMap: Record<string, string> = {
        'Single': 'single',
        'single': 'single',
        'EP': 'ep',
        'ep': 'ep',
        'Álbum': 'album',
        'Album': 'album',
        'album': 'album'
      };

      // Map status from Portuguese to code
      const statusMap: Record<string, string> = {
        'Em Análise': 'em_analise',
        'Aprovado': 'aprovado',
        'Rejeitado': 'rejeitado',
        'Pausado': 'pausado',
        'Takedown': 'takedown',
        'em_analise': 'em_analise',
        'aprovado': 'aprovado',
        'rejeitado': 'rejeitado',
        'pausado': 'pausado',
        'takedown': 'takedown'
      };
      for (const row of data) {
        const title = row['Título do Lançamento'] || row['Título'] || row['title'] || '';
        if (!title) continue;

        // Find artist by name
        const artistName = row['Nome do Artista'] || row['Artista'] || row['artist'] || '';
        const matchedArtist = artists.find((a: any) => a.name?.toLowerCase() === artistName.toLowerCase() || a.stage_name?.toLowerCase() === artistName.toLowerCase());

        // Find project by name
        const projectName = row['Projeto Vinculado'] || row['Projeto'] || row['project_name'] || '';
        const matchedProject = projects.find((p: any) => p.name?.toLowerCase() === projectName.toLowerCase());

        // Parse release type
        const releaseTypeRaw = row['Tipo de Lançamento'] || row['Tipo'] || row['release_type'] || 'single';
        const releaseType = releaseTypeMap[releaseTypeRaw] || 'single';

        // Parse status
        const statusRaw = row['Status'] || row['status'] || 'em_analise';
        const status = statusMap[statusRaw] || 'em_analise';

        // Parse distributors
        const distributorsRaw = row['Plataformas de Distribuição'] || row['Distribuidoras'] || row['platforms'] || '';
        const distributors = distributorsRaw ? String(distributorsRaw).split(',').map((d: string) => {
          const trimmed = d.trim();
          return distributorMap[trimmed] || trimmed.toLowerCase();
        }).filter(Boolean) : [];

        // Parse release date
        let releaseDate = row['Data de Lançamento'] || row['release_date'] || null;
        if (releaseDate && typeof releaseDate === 'number') {
          // Excel date serial number conversion
          const excelEpoch = new Date(1899, 11, 30);
          releaseDate = new Date(excelEpoch.getTime() + releaseDate * 86400000).toISOString().split('T')[0];
        }
        const releaseData = {
          title: title,
          artist_id: matchedArtist?.id || null,
          project_id: matchedProject?.id || null,
          release_type: releaseType as 'single' | 'ep' | 'album',
          type: releaseType as 'single' | 'ep' | 'album',
          release_date: releaseDate,
          status: status,
          distributors: distributors,
          genre: row['Gênero'] || row['genre'] || null,
          language: row['Idioma'] || row['language'] || null,
          label: row['Gravadora'] || row['label'] || null,
          copyright: row['Copyright'] || row['copyright'] || null,
          upc: row['UPC'] || row['upc'] || null
        };
        await createRelease.mutateAsync(releaseData);
        imported++;
      }
      await refetch();
      toast({
        title: "Importação concluída",
        description: `${imported} lançamento(s) importado(s) com sucesso.`
      });
    } catch (error) {
      console.error('Error importing releases:', error);
      toast({
        title: "Erro na importação",
        description: "Falha ao importar lançamentos. Verifique o formato do arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Distribuição</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Gestão de lançamentos e distribuição</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIds.length > 0 && <Button variant="destructive" size="sm" className="gap-1 sm:gap-2" onClick={() => setIsBulkDeleteModalOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Excluir ({selectedIds.length})</span>
                  </Button>}
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="hidden sm:inline">Importar</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={handleExport} disabled={allReleases.length === 0}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button size="sm" className="gap-1 sm:gap-2" onClick={handleNewRelease}>
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Lançamento</span>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            {(() => {
            const activeReleases = allReleases.filter(r => r.status === 'released' || r.approvalStatus === 'aceita').length;
            const scheduledReleases = allReleases.filter(r => {
              if (!r.releaseDate) return false;
              const releaseDate = new Date(r.releaseDate);
              const now = new Date();
              const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              return releaseDate > now && releaseDate <= thirtyDaysFromNow;
            }).length;
            const totalStreams = allReleases.reduce((sum, r) => sum + (r.streams || 0), 0);
            const takedowns = allReleases.filter(r => r.takedown).length;
            const performanceRate = allReleases.length > 0 ? Math.min(Math.round(activeReleases / allReleases.length * 100), 100) : 0;
            return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <DashboardCard title="Lançamentos Ativos" value={activeReleases} description="disponíveis nas plataformas" icon={Music} trend={{
                value: Math.min(activeReleases, 100),
                isPositive: true
              }} />
                  <DashboardCard title="Programados" value={scheduledReleases} description="próximos 30 dias" icon={Calendar} trend={{
                value: Math.min(scheduledReleases, 100),
                isPositive: true
              }} />
                  <DashboardCard title="Performance" value={`${performanceRate}%`} description="taxa de crescimento" icon={TrendingUp} trend={{
                value: performanceRate,
                isPositive: performanceRate > 0
              }} />
                  <DashboardCard title="Total de Streams" value={totalStreams.toLocaleString('pt-BR')} description="reproduções acumuladas" icon={Eye} trend={{
                value: totalStreams,
                isPositive: true
              }} />
                  <DashboardCard title="Takedowns" value={takedowns} description="lançamentos removidos" icon={AlertTriangle} className="border-orange-500/30" />
                </div>;
          })()}


            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar lançamentos por título ou artista..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Releases List */}
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lista de Lançamentos</CardTitle>
                  <CardDescription>Acompanhe todos os seus lançamentos musicais</CardDescription>
                </div>
                {filteredReleases.length > 0 && <div className="flex items-center gap-2">
                    <Checkbox checked={selectedIds.length === filteredReleases.length && filteredReleases.length > 0} onCheckedChange={toggleSelectAll} />
                    <span className="text-sm text-muted-foreground">Selecionar Todos</span>
                  </div>}
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                {allReleases.length === 0 ? <div className="text-center py-12">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum lançamento cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Comece criando seu primeiro lançamento musical</p>
                    <Button onClick={handleNewRelease}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Lançamento
                    </Button>
                  </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {filteredReleases.map(release => <div key={release.id} className="relative">
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox checked={selectedIds.includes(release.id)} onCheckedChange={() => toggleSelectRelease(release.id)} className="bg-background" />
                        </div>
                        <ReleaseCard release={release} onViewDetails={handleViewDetails} onEdit={handleEditRelease} onDelete={handleDeleteRelease} onViewMetrics={handleViewMetrics} />
                      </div>)}
                  </div>}
              </CardContent>
            </Card>

            {/* New Release Modal */}
            <Dialog open={isNewReleaseModalOpen} onOpenChange={setIsNewReleaseModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Lançamento</DialogTitle>
                </DialogHeader>
                <ReleaseForm onSuccess={() => setIsNewReleaseModalOpen(false)} onCancel={() => setIsNewReleaseModalOpen(false)} />
              </DialogContent>
            </Dialog>

            {/* Edit Release Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Lançamento</DialogTitle>
                </DialogHeader>
                <ReleaseForm release={selectedRelease} onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedRelease(null);
              }} onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedRelease(null);
              }} />
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} onConfirm={confirmDeleteRelease} title="Excluir Lançamento" description={`Tem certeza que deseja excluir o lançamento "${releaseToDelete?.title}"? Esta ação não pode ser desfeita.`} />

            {/* Bulk Delete Confirmation Modal */}
            <DeleteConfirmationModal open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen} onConfirm={handleBulkDelete} title="Excluir Lançamentos em Massa" description={`Tem certeza que deseja excluir ${selectedIds.length} lançamento(s)? Esta ação não pode ser desfeita.`} />

            {/* View Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Detalhes do Lançamento
                  </DialogTitle>
                </DialogHeader>
                {selectedRelease && <ReleaseDetailsContent release={selectedRelease} />}
              </DialogContent>
            </Dialog>

            {/* Metrics Modal */}
            {selectedRelease && <ReleaseMetricsModal open={isMetricsModalOpen} onOpenChange={setIsMetricsModalOpen} release={{
            id: selectedRelease.id,
            title: selectedRelease.title,
            artistName: selectedRelease.artist
          }} />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>;
};
export default Lancamentos;