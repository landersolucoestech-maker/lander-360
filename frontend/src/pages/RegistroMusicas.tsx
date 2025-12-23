import { useState, useEffect, useMemo } from "react";
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
import { WorkTypeSelectionModal } from "@/components/modals/WorkTypeSelectionModal";
import { Music, Plus, FileText, CheckCircle, Clock, Disc, Trash2, Download, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMusicRegistry, useDeleteMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { usePhonograms, useDeletePhonogram } from "@/hooks/usePhonograms";
import { useArtists } from "@/hooks/useArtists";
import { useProjects } from "@/hooks/useProjects";
import { formatDateBR, translateStatus, cn } from "@/lib/utils";
import { useDataExport } from "@/hooks/useDataExport";
import { useCreateMusicRegistryEntry } from "@/hooks/useMusicRegistry";
import { useCreatePhonogram } from "@/hooks/usePhonograms";
import { useRef } from "react";
import { PhonogramService } from "@/services/phonograms";
import { useArtistFilter } from "@/hooks/useLinkedArtist";

const RegistroMusicas = () => {
  // Filtro de artista
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const { data: allMusicRegistry = [], isLoading: isLoadingWorks } = useMusicRegistry();
  const { data: allPhonograms = [], isLoading: isLoadingPhonograms } = usePhonograms();
  const { data: allArtists = [] } = useArtists();
  const { data: allProjects = [] } = useProjects();
  const deleteMusicEntry = useDeleteMusicRegistryEntry();
  const deletePhonogram = useDeletePhonogram();
  const createMusicEntry = useCreateMusicRegistryEntry();
  const createPhonogram = useCreatePhonogram();
  const { exportToExcel, parseExcelFile } = useDataExport();
  
  // Aplicar filtro de artista
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
      return mappedPhonograms.filter((p: any) => p.artist_id === artistId);
    }
    return allPhonograms;
  }, [allPhonograms, shouldFilter, artistId]);

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
  
  const worksFileInputRef = useRef<HTMLInputElement>(null);
  const phonogramsFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("obras");
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [filteredPhonograms, setFilteredPhonograms] = useState<any[]>([]);
  const { toast } = useToast();
  
  // Work modals
  const [workTypeSelectionOpen, setWorkTypeSelectionOpen] = useState(false);
  const [newMusicModalOpen, setNewMusicModalOpen] = useState(false);
  const [isObraReferencia, setIsObraReferencia] = useState(false);
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

  // Filter states - Works
  const [worksSearchTerm, setWorksSearchTerm] = useState("");
  const [worksFilters, setWorksFilters] = useState<Record<string, string>>({});

  // Filter states - Phonograms
  const [phonogramsSearchTerm, setPhonogramsSearchTerm] = useState("");
  const [phonogramsFilters, setPhonogramsFilters] = useState<Record<string, string>>({});

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
  const mappedPhonograms = phonograms.map(phono => {
    // Primeiro tenta buscar artista do fonograma, depois da obra vinculada
    const linkedWork = musicRegistry.find(m => m.id === phono.work_id);
    const phonoArtistId = phono.artist_id || linkedWork?.artist_id;
    const artist = artists.find(a => a.id === phonoArtistId);
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
    setFilteredPhonograms(mappedPhonograms);
  }, [phonograms, artists, musicRegistry]);

  // Extrair gêneros únicos das obras cadastradas e ordenar alfabeticamente
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    allSongs.forEach((song: any) => {
      if (song.genre) genres.add(song.genre);
    });
    // Também buscar de artistas
    (artists || []).forEach((artist: any) => {
      if (artist.genre) genres.add(artist.genre);
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allSongs, artists]);

  // Status ordenados alfabeticamente (sem "Pendente" conforme solicitado)
  const statusOptions = [
    "Aprovada",
    "Cancelado",
    "Em Análise",
    "Pendente de Registro",
    "Recusada",
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: statusOptions
    },
    {
      key: "genre",
      label: "Gênero",
      options: uniqueGenres.length > 0 ? uniqueGenres : ["Todos os Gêneros"]
    }
  ];

  // Work handlers
  const handleSearchWorks = (searchTerm: string) => {
    setWorksSearchTerm(searchTerm);
    filterWorks(searchTerm, worksFilters);
  };

  const handleFilterWorks = (filters: Record<string, string>) => {
    setWorksFilters(filters);
    filterWorks(worksSearchTerm, filters);
  };

  const handleClearWorks = () => {
    setWorksSearchTerm("");
    setWorksFilters({});
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
        const normalizedValue = value.toLowerCase();
        filtered = filtered.filter(song => {
          if (key === "status") return (song.statusDisplay || "").toLowerCase() === normalizedValue;
          if (key === "genre") return (song.genre || "").toLowerCase() === normalizedValue;
          return true;
        });
      }
    });

    setFilteredSongs(filtered);
  };

  // Phonogram handlers
  const handleSearchPhonograms = (searchTerm: string) => {
    setPhonogramsSearchTerm(searchTerm);
    filterPhonograms(searchTerm, phonogramsFilters);
  };

  const handleFilterPhonograms = (filters: Record<string, string>) => {
    setPhonogramsFilters(filters);
    filterPhonograms(phonogramsSearchTerm, filters);
  };

  const handleClearPhonograms = () => {
    setPhonogramsSearchTerm("");
    setPhonogramsFilters({});
    setFilteredPhonograms(mappedPhonograms);
  };

  const filterPhonograms = (searchTerm: string, filters: Record<string, string>) => {
    let filtered = mappedPhonograms;

    if (searchTerm) {
      filtered = filtered.filter(phono =>
        phono.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phono.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (phono.isrc || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const normalizedValue = value.toLowerCase();
        filtered = filtered.filter(phono => {
          if (key === "status") return (phono.statusDisplay || "").toLowerCase() === normalizedValue;
          if (key === "genre") return (phono.genre || "").toLowerCase() === normalizedValue;
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
        // First, delete any linked phonograms
        const linkedPhonograms = await PhonogramService.getByWork(id);
        for (const phonogram of linkedPhonograms) {
          await deletePhonogram.mutateAsync(phonogram.id);
        }
        // Then delete the music registry entry
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
    
    // Add project_name, language and other fields from project to each music registry item
    const enrichedMusicRegistry = musicRegistry.map(music => {
      const project = projects.find(p => p.id === music.project_id);
      let instrumental = false;
      let language = '';
      
      if (project?.audio_files) {
        let audioData = project.audio_files as any;
        if (typeof audioData === 'string') {
          try {
            audioData = JSON.parse(audioData);
          } catch (e) {
            audioData = null;
          }
        }
        if (audioData) {
          instrumental = audioData.instrumental === true || audioData.instrumental === 'true';
          language = audioData.language || '';
        }
      }
      
      return {
        ...music,
        project_name: project?.name || '',
        language: language,
        is_instrumental: instrumental,
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
        const title = row['Título da Obra'] || row['Título'] || row['title'] || '';
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
    
    // Add work_title and work_abramus_code to each phonogram
    const enrichedPhonograms = phonograms.map(phonogram => {
      const work = musicRegistry.find(m => m.id === phonogram.work_id);
      return {
        ...phonogram,
        work_title: work?.title || '',
        work_abramus_code: work?.abramus_code || '',
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
        // Get title from work_title column or title column
        const title = row['Título da Obra'] || row['Título'] || row['title'] || '';
        if (!title) continue;

        // Try to find linked work by ABRAMUS code or title
        const workAbramusCode = row['Código ABRAMUS da Obra'] || row['work_abramus_code'] || '';
        let workId = null;
        
        if (workAbramusCode) {
          const linkedWork = musicRegistry.find(m => m.abramus_code === workAbramusCode);
          workId = linkedWork?.id || null;
        } else {
          // Try to match by title
          const linkedWork = musicRegistry.find(m => m.title?.toLowerCase().trim() === title.toLowerCase().trim());
          workId = linkedWork?.id || null;
        }

        // Parse duration from m:ss format
        let duration = null;
        const durationStr = row['Duração'] || row['duration'] || '';
        if (durationStr) {
          if (String(durationStr).includes(':')) {
            const parts = String(durationStr).split(':');
            duration = (parseInt(parts[0]) * 60) + parseInt(parts[1] || '0');
          } else {
            duration = parseInt(String(durationStr)) || null;
          }
        }

        // Parse participants from formatted strings
        const participants: any[] = [];
        
        // Parse producers
        const producersStr = row['Produtores Fonográficos'] || '';
        if (producersStr) {
          String(producersStr).split(';').forEach(p => {
            const name = p.trim().split('(')[0].trim();
            const percentMatch = p.match(/\((\d+(?:,\d+)?%?)\)/);
            const percentage = percentMatch ? parseFloat(percentMatch[1].replace(',', '.').replace('%', '')) : 0;
            if (name) {
              participants.push({ name, role: 'produtor_fonografico', percentage });
            }
          });
        }

        // Parse interpreters
        const interpretersStr = row['Intérpretes'] || '';
        if (interpretersStr) {
          String(interpretersStr).split(';').forEach(p => {
            const name = p.trim().split('(')[0].trim();
            const percentMatch = p.match(/\((\d+(?:,\d+)?%?)\)/);
            const percentage = percentMatch ? parseFloat(percentMatch[1].replace(',', '.').replace('%', '')) : 0;
            if (name) {
              participants.push({ name, role: 'interprete', percentage });
            }
          });
        }

        // Parse musicians
        const musiciansStr = row['Músicos Acompanhantes'] || '';
        if (musiciansStr) {
          String(musiciansStr).split(';').forEach(p => {
            const name = p.trim().split('(')[0].trim();
            const percentMatch = p.match(/\((\d+(?:,\d+)?%?)\)/);
            const percentage = percentMatch ? parseFloat(percentMatch[1].replace(',', '.').replace('%', '')) : 0;
            if (name) {
              participants.push({ name, role: 'musico', percentage });
            }
          });
        }

        const phonogramData = {
          title: title,
          work_id: workId,
          status: row['Status'] || row['status'] || 'pendente',
          genre: row['Gênero'] || row['genre'] || null,
          isrc: row['ISRC'] || row['isrc'] || null,
          duration: duration,
          label: row['Agregadora'] || row['Gravadora'] || row['label'] || null,
          version_type: row['Classificação'] || row['version_type'] || null,
          recording_date: row['Data de Gravação'] || row['recording_date'] || null,
          recording_location: row['País de Origem'] || row['recording_location'] || null,
          language: row['Instrumental'] === 'Sim' ? 'instrumental' : null,
          participants: participants.length > 0 ? participants : null,
        };

        await createPhonogram.mutateAsync(phonogramData);
        imported++;
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

  const pendingStatuses = ['Pendente', 'pendente', 'Pendente de Registro', 'draft', 'Rascunho', 'N/A'];
  const inReviewStatuses = ['Em Análise', 'em_analise', 'Em análise'];
  const acceptedStatuses = ['Aprovada', 'Aceita', 'aceita', 'aprovada'];

  const worksKPIs = {
    total: allSongs.length,
    pending: allSongs.filter(s => pendingStatuses.includes(s.statusDisplay) || !s.status || s.status === 'pendente').length,
    inReview: allSongs.filter(s => inReviewStatuses.includes(s.statusDisplay) || s.status === 'em_analise').length,
    accepted: allSongs.filter(s => acceptedStatuses.includes(s.statusDisplay) || s.status === 'aceita').length,
    approvalRate: allSongs.length > 0 ? Math.min(Math.round((allSongs.filter(s => acceptedStatuses.includes(s.statusDisplay) || s.status === 'aceita').length / allSongs.length) * 100), 100) : 0,
  };

  const phonogramsKPIs = {
    total: mappedPhonograms.length,
    pending: mappedPhonograms.filter(s => pendingStatuses.includes(s.statusDisplay) || !s.status || s.status === 'pendente').length,
    inReview: mappedPhonograms.filter(s => inReviewStatuses.includes(s.statusDisplay) || s.status === 'em_analise').length,
    accepted: mappedPhonograms.filter(s => acceptedStatuses.includes(s.statusDisplay) || s.status === 'aceita').length,
    approvalRate: mappedPhonograms.length > 0 ? Math.min(Math.round((mappedPhonograms.filter(s => acceptedStatuses.includes(s.statusDisplay) || s.status === 'aceita').length / mappedPhonograms.length) * 100), 100) : 0,
  };

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
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Registro de Músicas</h1>
                  <p className="text-sm text-muted-foreground">
                    Registro e controle de obras musicais e fonogramas
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={activeTab === "obras" ? worksFileInputRef : phonogramsFileInputRef}
                  onChange={activeTab === "obras" ? handleImportWorks : handleImportPhonograms}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeTab === "obras" ? worksFileInputRef.current?.click() : phonogramsFileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={activeTab === "obras" ? handleExportWorks : handleExportPhonograms}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <Button 
                  className="gap-2" 
                  size="sm"
                  onClick={() => activeTab === "obras" ? setWorkTypeSelectionOpen(true) : setNewPhonogramModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  {activeTab === "obras" ? "Nova Obra" : "Novo Fonograma"}
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsContent value="obras" className="space-y-4">
                {/* KPI Cards - Obras */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <DashboardCard
                    title="Total de Obras"
                    value={worksKPIs.total}
                    description="registradas no sistema"
                    icon={Music}
                  />
                  <DashboardCard
                    title="Pendentes de Registro"
                    value={worksKPIs.pending}
                    description="aguardando análise"
                    icon={FileText}
                  />
                  <DashboardCard
                    title="Em Análise"
                    value={worksKPIs.inReview}
                    description="aguardando aprovação"
                    icon={Clock}
                  />
                  <DashboardCard
                    title="Registro Aceito"
                    value={worksKPIs.accepted}
                    description="aprovadas"
                    icon={CheckCircle}
                  />
                  <DashboardCard
                    title="Taxa de Aprovação"
                    value={`${worksKPIs.approvalRate}%`}
                    description="obras aprovadas"
                    icon={CheckCircle}
                  />
                </div>
                {/* Search + Tabs Row */}
                <div className="flex flex-col gap-3">
                  <SearchFilter
                    searchPlaceholder="Buscar obras por título, artista ou ISWC..."
                    filters={filterOptions}
                    onSearch={handleSearchWorks}
                    onFilter={handleFilterWorks}
                    onClear={handleClearWorks}
                  />
                  <TabsList className="w-fit">
                    <TabsTrigger value="obras" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Obras
                    </TabsTrigger>
                    <TabsTrigger value="fonogramas" className="flex items-center gap-2">
                      <Disc className="h-4 w-4" />
                      Fonogramas
                    </TabsTrigger>
                  </TabsList>
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
                        <Button onClick={() => setWorkTypeSelectionOpen(true)}>
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
                            className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            {/* Checkbox + Title Section */}
                            <div className="flex items-center gap-3 min-w-0">
                              <Checkbox
                                checked={selectedWorks.includes(song.id)}
                                onCheckedChange={(checked) => handleSelectWork(song.id, !!checked)}
                              />
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{song.title}</h3>
                                <Badge 
                                  className={cn(
                                    "text-xs",
                                    (song.statusDisplay === "Aceita" || song.statusDisplay === "Aprovada") ? "bg-blue-600 text-white hover:bg-blue-700" :
                                    song.statusDisplay === "Recusada" ? "bg-red-600 text-white hover:bg-red-700" :
                                    "bg-yellow-500 text-black hover:bg-yellow-600"
                                  )}
                                >
                                  {song.statusDisplay}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Info Grid - Responsive */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 lg:gap-4 text-sm pl-10 lg:pl-0">
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Cód. ABRAMUS</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{song.abramus_code || "-"}</div>
                              </div>
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Cód. ECAD</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{song.ecad_code || "-"}</div>
                              </div>
                              <div className="text-left col-span-2 sm:col-span-1">
                                <div className="text-muted-foreground text-xs">Compositores</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate" title={song.composers?.join(", ") || "-"}>
                                  {song.composers?.join(", ") || "-"}
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Editora</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate" title={song.publishers?.join(", ") || "-"}>
                                  {song.publishers?.join(", ") || "-"}
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Gênero</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate capitalize">
                                  {song.genre || "-"}
                                </div>
                              </div>
                            </div>

                            {/* Actions - Responsive */}
                            <div className="flex gap-2 flex-shrink-0 pl-10 lg:pl-0 lg:ml-auto">
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => handleViewSong(song)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => handleEditSong(song)}>
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => {
                                setSelectedSong(song);
                                setDeleteModalOpen(true);
                              }}>
                                Excluir
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fonogramas" className="space-y-4">
                {/* KPI Cards - Fonogramas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  <DashboardCard
                    title="Total de Fonogramas"
                    value={phonogramsKPIs.total}
                    description="registrados no sistema"
                    icon={Disc}
                  />
                  <DashboardCard
                    title="Pendentes de Registro"
                    value={phonogramsKPIs.pending}
                    description="aguardando análise"
                    icon={FileText}
                  />
                  <DashboardCard
                    title="Em Análise"
                    value={phonogramsKPIs.inReview}
                    description="aguardando aprovação"
                    icon={Clock}
                  />
                  <DashboardCard
                    title="Registro Aceito"
                    value={phonogramsKPIs.accepted}
                    description="aprovados"
                    icon={CheckCircle}
                  />
                  <DashboardCard
                    title="Taxa de Aprovação"
                    value={`${phonogramsKPIs.approvalRate}%`}
                    description="fonogramas aprovados"
                    icon={CheckCircle}
                  />
                </div>
                {/* Search + Tabs Row */}
                <div className="flex flex-col gap-3">
                  <SearchFilter
                    searchPlaceholder="Buscar fonogramas por título, artista ou ISRC..."
                    filters={filterOptions}
                    onSearch={handleSearchPhonograms}
                    onFilter={handleFilterPhonograms}
                    onClear={handleClearPhonograms}
                  />
                  <TabsList className="w-fit">
                    <TabsTrigger value="obras" className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Obras
                    </TabsTrigger>
                    <TabsTrigger value="fonogramas" className="flex items-center gap-2">
                      <Disc className="h-4 w-4" />
                      Fonogramas
                    </TabsTrigger>
                  </TabsList>
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

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>Fonogramas Registrados</CardTitle>
                    <CardDescription>
                      Catálogo completo de gravações registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mappedPhonograms.length === 0 ? (
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
                            className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            {/* Checkbox + Title Section */}
                            <div className="flex items-center gap-3 min-w-0">
                              <Checkbox
                                checked={selectedPhonograms.includes(phono.id)}
                                onCheckedChange={(checked) => handleSelectPhonogram(phono.id, !!checked)}
                              />
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Disc className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{phono.title}</h3>
                                <Badge 
                                  className={cn(
                                    "text-xs",
                                    (phono.statusDisplay === "Aceita" || phono.statusDisplay === "Aprovada") ? "bg-blue-600 text-white hover:bg-blue-700" :
                                    phono.statusDisplay === "Recusada" ? "bg-red-600 text-white hover:bg-red-700" :
                                    "bg-yellow-500 text-black hover:bg-yellow-600"
                                  )}
                                >
                                  {phono.statusDisplay}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Info Grid - Responsive */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 lg:gap-4 text-sm pl-10 lg:pl-0">
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Cód Abramus</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{(phono as any).abramus_code || "-"}</div>
                              </div>
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">Cód ECAD</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{(phono as any).ecad_code || "-"}</div>
                              </div>
                              <div className="text-left">
                                <div className="text-muted-foreground text-xs">ISRC</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">{phono.isrc || "-"}</div>
                              </div>
                              <div className="text-left col-span-2 sm:col-span-1">
                                <div className="text-muted-foreground text-xs">Compositores</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">
                                  {(phono as any).workComposers?.join(', ') || "-"}
                                </div>
                              </div>
                              <div className="text-left hidden sm:block">
                                <div className="text-muted-foreground text-xs">Intérpretes</div>
                                <div className="font-medium text-foreground text-xs sm:text-sm truncate">
                                  {phono.participants?.filter((p: any) => p.role === 'interprete').map((p: any) => p.name).join(', ') || "-"}
                                </div>
                              </div>
                            </div>

                            {/* Actions - Responsive */}
                            <div className="flex gap-2 flex-shrink-0 pl-10 lg:pl-0 lg:ml-auto">
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => handleViewPhonogram(phono)}>
                                Ver
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => handleEditPhonogram(phono)}>
                                Editar
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={() => {
                                setSelectedPhonogram(phono);
                                setDeletePhonogramModalOpen(true);
                              }}>
                                Excluir
                              </Button>
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
                    // First, delete any linked phonograms
                    const linkedPhonograms = await PhonogramService.getByWork(selectedSong.id);
                    for (const phonogram of linkedPhonograms) {
                      await deletePhonogram.mutateAsync(phonogram.id);
                    }
                    // Then delete the music registry entry
                    await deleteMusicEntry.mutateAsync(selectedSong.id);
                    setDeleteModalOpen(false);
                    setSelectedSong(null);
                  } catch (error) {
                    console.error('Error deleting music:', error);
                  }
                }
              }}
              title="Excluir Obra"
              description={`Tem certeza que deseja excluir a obra "${selectedSong?.title}"? Esta ação excluirá também os fonogramas vinculados e não pode ser desfeita.`}
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

            {/* Work Type Selection Modal */}
            <WorkTypeSelectionModal
              isOpen={workTypeSelectionOpen}
              onClose={() => setWorkTypeSelectionOpen(false)}
              onSelectAutoral={() => {
                setWorkTypeSelectionOpen(false);
                setIsObraReferencia(false);
                setNewMusicModalOpen(true);
              }}
              onSelectReferencia={() => {
                setWorkTypeSelectionOpen(false);
                setIsObraReferencia(true);
                setNewMusicModalOpen(true);
              }}
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
