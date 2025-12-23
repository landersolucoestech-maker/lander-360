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
import { usePhonograms } from "@/hooks/usePhonograms";
import { useActiveContracts } from "@/hooks/useContracts";
import { useDataExport } from "@/hooks/useDataExport";
import { useArtistFilter } from "@/hooks/useLinkedArtist";
import { supabase } from "@/integrations/supabase/client";
import { ArtistSensitiveDataService } from "@/services/artistSensitiveData";
import { Users, Plus, Music, DollarSign, Star, Upload, Download, Trash2, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Artistas = () => {
  console.log('==========================================');
  console.log('[ARTISTAS PAGE] COMPONENT MOUNTED - v2');
  console.log('==========================================');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Filtro de artista - se for usuário artista, filtra apenas seus dados
  const { shouldFilter, artistId, isArtistUser } = useArtistFilter();
  
  const { data: allArtists, isLoading, error } = useArtists();
  const { data: artistsCount } = useArtistsCount();
  const { data: allProjects = [] } = useProjects();
  const { data: allReleases = [] } = useReleases();
  const { data: allMusicRegistry = [] } = useMusicRegistry();
  const { data: allPhonograms = [] } = usePhonograms();
  const { data: allActiveContracts = [] } = useActiveContracts();
  const deleteArtist = useDeleteArtist();
  const createArtist = useCreateArtist();
  const { exportToExcel, parseExcelFile } = useDataExport();
  const { toast } = useToast();
  
  // Aplicar filtro de artista nos dados
  const artists = useMemo(() => {
    if (shouldFilter && artistId) {
      return (allArtists || []).filter((a: any) => a.id === artistId);
    }
    return allArtists || [];
  }, [allArtists, shouldFilter, artistId]);

  const projects = useMemo(() => {
    if (shouldFilter && artistId) {
      return allProjects.filter((p: any) => p.artist_id === artistId);
    }
    return allProjects;
  }, [allProjects, shouldFilter, artistId]);

  const releases = useMemo(() => {
    if (shouldFilter && artistId) {
      return allReleases.filter((r: any) => r.artist_id === artistId);
    }
    return allReleases;
  }, [allReleases, shouldFilter, artistId]);

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

  const activeContracts = useMemo(() => {
    if (shouldFilter && artistId) {
      return allActiveContracts.filter((c: any) => c.artist_id === artistId);
    }
    return allActiveContracts;
  }, [allActiveContracts, shouldFilter, artistId]);
  
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

    // Cap all percentage values at 100%
    const capAt100 = (val: number) => Math.min(Math.abs(val), 100);

    return {
      artists: { value: capAt100(Number(artistsTrend.toFixed(1))), isPositive: artistsTrend >= 0 },
      contracts: { value: capAt100(Number(contractsTrend.toFixed(1))), isPositive: contractsTrend >= 0 },
      music: { value: capAt100(Number(musicTrend.toFixed(1))), isPositive: musicTrend >= 0 },
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
    const stats: Record<string, { projetos: number; lancamentos: number; obras: number; fonogramas: number }> = {};
    
    // Get list of artists for name matching
    const artistsList = artists || [];

    // Helper function to parse audio_files
    const parseAudioFiles = (audioFiles: any) => {
      if (!audioFiles) return null;
      if (typeof audioFiles === 'string') {
        try {
          return JSON.parse(audioFiles);
        } catch (e) {
          return null;
        }
      }
      return audioFiles;
    };
    
    // Count projects - both by artist_id and by participation (composer, performer, producer)
    projects.forEach((project: any) => {
      // Direct artist_id link
      if (project.artist_id) {
        if (!stats[project.artist_id]) {
          stats[project.artist_id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
        }
        stats[project.artist_id].projetos++;
      }
      
      // Check participation in songs (composer, performer, producer)
      const audioFiles = parseAudioFiles(project.audio_files);
      const songs = audioFiles?.songs || [];
      
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.stage_name || artist.name;
        
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
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
          }
          stats[artist.id].projetos++;
        }
      });
    });
    
    // Count releases - both by artist_id and by participation
    releases.forEach((release: any) => {
      if (release.artist_id) {
        if (!stats[release.artist_id]) {
          stats[release.artist_id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
        }
        stats[release.artist_id].lancamentos++;
      }
      
      // Check participation in tracks
      let tracks = release.tracks || [];
      if (typeof tracks === 'string') {
        try {
          tracks = JSON.parse(tracks);
        } catch (e) {
          tracks = [];
        }
      }
      
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.stage_name || artist.name;
        
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
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
          }
          stats[artist.id].lancamentos++;
        }
      });
    });
    
    // Count music registry - both by artist_id and by participation
    musicRegistry.forEach((music: any) => {
      if (music.artist_id) {
        if (!stats[music.artist_id]) {
          stats[music.artist_id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
        }
        stats[music.artist_id].obras++;
      }
      
      // Check participation in music registry
      let participants = music.participants || [];
      if (typeof participants === 'string') {
        try {
          participants = JSON.parse(participants);
        } catch (e) {
          participants = [];
        }
      }
      
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.stage_name || artist.name;
        
        if (artistMatchesParticipant(artistName, stageName, participants) && music.artist_id !== artist.id) {
          if (!stats[artist.id]) {
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
          }
          stats[artist.id].obras++;
        }
      });
    });
    
    // Count phonograms - both by artist_id and by participation
    phonograms.forEach((phonogram: any) => {
      if (phonogram.artist_id) {
        if (!stats[phonogram.artist_id]) {
          stats[phonogram.artist_id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
        }
        stats[phonogram.artist_id].fonogramas++;
      }
      
      // Check participation in phonogram
      let participants = phonogram.participants || [];
      if (typeof participants === 'string') {
        try {
          participants = JSON.parse(participants);
        } catch (e) {
          participants = [];
        }
      }
      
      artistsList.forEach((artist: any) => {
        const artistName = artist.full_name || artist.name;
        const stageName = artist.stage_name || artist.name;
        
        if (artistMatchesParticipant(artistName, stageName, participants) && phonogram.artist_id !== artist.id) {
          if (!stats[artist.id]) {
            stats[artist.id] = { projetos: 0, lancamentos: 0, obras: 0, fonogramas: 0 };
          }
          stats[artist.id].fonogramas++;
        }
      });
    });
    
    return stats;
  }, [projects, releases, musicRegistry, phonograms, artists]);

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
        soundcloud: dbArtist.soundcloud,
        deezer: dbArtist.deezer_url,
        apple: dbArtist.apple_music_url
      },
      stats: {
        projetos: artistStats[dbArtist.id]?.projetos || 0,
        obras: artistStats[dbArtist.id]?.obras || 0,
        fonogramas: artistStats[dbArtist.id]?.fonogramas || 0,
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

  // Use real data only - no mock fallbacks
  // Sort: artists with active contracts first, then alphabetically
  const displayArtists = (artists || [])
    .map(transformDatabaseArtist)
    .sort((a: any, b: any) => {
      const aHasContract = artistContractStatusMap[a.id] || false;
      const bHasContract = artistContractStatusMap[b.id] || false;
      
      // First priority: artists with active contracts come first
      if (aHasContract && !bHasContract) return -1;
      if (!aHasContract && bHasContract) return 1;
      
      // Second priority: alphabetical by name
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });

  // Reapply filters when artists data changes
  useEffect(() => {
    if (currentSearchTerm || Object.values(currentFilters).some(v => v)) {
      applyFilters(currentSearchTerm, currentFilters);
    } else {
      setFilteredArtists([]);
    }
  }, [artists]);

  const currentArtists = filteredArtists.length ? filteredArtists : displayArtists;

  // Extrair gêneros únicos dos artistas cadastrados e ordenar alfabeticamente
  const uniqueGenres = useMemo(() => {
    const genres = new Set<string>();
    (artists || []).forEach((artist: any) => {
      if (artist.genre) {
        genres.add(artist.genre);
      }
    });
    return Array.from(genres).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [artists]);

  // Extrair perfis/tipos de artista únicos e ordenar alfabeticamente
  const uniqueProfiles = useMemo(() => {
    const profiles = new Set<string>();
    (artists || []).forEach((artist: any) => {
      // artist_types é um array
      if (Array.isArray(artist.artist_types)) {
        artist.artist_types.forEach((type: string) => {
          if (type) profiles.add(type);
        });
      }
      // perfil pode ser string
      if (artist.perfil) {
        profiles.add(artist.perfil);
      }
    });
    return Array.from(profiles).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [artists]);

  const filterOptions = [
    { key: "genre", label: "Gênero", options: uniqueGenres.length > 0 ? uniqueGenres : ["Todos os Gêneros"] },
    { key: "status", label: "Status", options: ["Ativo", "Inativo"] },
    { key: "perfil", label: "Perfil Artístico", options: uniqueProfiles.length > 0 ? uniqueProfiles : ["Todos os Perfis"] },
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

  const handleExport = async () => {
    const idsToExport = (currentArtists || []).map((a: any) => a.id);

    const rawById = new Map<string, any>((artists || []).map((a: any) => [a.id, a]));
    const baseRows = idsToExport.map((id: string) => rawById.get(id)).filter(Boolean);

    // Se o usuário tiver permissão, inclui campos sensíveis no export
    let rowsToExport = baseRows;
    try {
      const hasSensitiveAccess = await ArtistSensitiveDataService.hasAccess();
      if (hasSensitiveAccess && idsToExport.length) {
        const { data: sensitiveRows, error } = await supabase
          .from('artist_sensitive_data')
          .select('artist_id, cpf_cnpj, rg, full_address, bank, agency, account, pix_key, account_holder')
          .in('artist_id', idsToExport);

        if (!error && sensitiveRows?.length) {
          const sensitiveByArtistId = new Map<string, any>(
            sensitiveRows.map((r: any) => [r.artist_id, r])
          );

          rowsToExport = baseRows.map((artist: any) => {
            const sensitive = sensitiveByArtistId.get(artist.id);
            return sensitive
              ? {
                  ...artist,
                  cpf_cnpj: sensitive.cpf_cnpj ?? null,
                  rg: sensitive.rg ?? null,
                  full_address: sensitive.full_address ?? null,
                  bank: sensitive.bank ?? null,
                  agency: sensitive.agency ?? null,
                  account: sensitive.account ?? null,
                  pix_key: sensitive.pix_key ?? null,
                  account_holder: sensitive.account_holder ?? null,
                }
              : artist;
          });
        }
      }
    } catch {
      // Exporta sem os campos sensíveis
    }

    exportToExcel(rowsToExport, 'artistas', 'Artistas', 'artists');
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
      let partialCount = 0;

      const normalizeHeader = (key: any) =>
        String(key ?? '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_');

      const hasValue = (val: any) =>
        val !== undefined &&
        val !== null &&
        (typeof val === 'number' || typeof val === 'boolean' || String(val).trim() !== '');

      const buildRowIndex = (row: Record<string, any>) => {
        const idx: Record<string, any> = {};
        Object.entries(row || {}).forEach(([k, v]) => {
          idx[normalizeHeader(k)] = v;
        });
        return idx;
      };

      const pick = (row: Record<string, any>, idx: Record<string, any>, keys: string[]) => {
        for (const key of keys) {
          if (hasValue((row as any)[key])) return (row as any)[key];
          const norm = idx[normalizeHeader(key)];
          if (hasValue(norm)) return norm;
        }
        return undefined;
      };

      const toText = (val: any) => (hasValue(val) ? String(val).trim() : '');
      const toNullableText = (val: any) => (hasValue(val) ? String(val).trim() : null);

      const parseExcelDateToISO = (val: any): string | null => {
        if (!hasValue(val)) return null;
        if (val instanceof Date && !Number.isNaN(val.getTime())) return val.toISOString().slice(0, 10);
        if (typeof val === 'number') {
          // Excel serial date (Windows): days since 1899-12-30
          const d = new Date(Date.UTC(1899, 11, 30) + val * 86400000);
          return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
        }

        const str = String(val).trim();
        const br = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (br) return `${br[3]}-${br[2]}-${br[1]}`;
        const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
        return null;
      };

      const parseList = (val: any): string[] => {
        if (!hasValue(val)) return [];
        if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
        return String(val)
          .split(/[\n;,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      };

      const distributorLabelMap: Record<string, string> = {
        cd_baby: 'CD Baby',
        distrokid: 'DistroKid',
        one_rpm: 'ONErpm',
        onerpm: 'ONErpm',
        tunecore: 'TuneCore',
        ditto_music: 'Ditto Music',
        i_musics: 'iMusics',
        imusics: 'iMusics',
        symphonic: 'Symphonic Distribution',
        symphonic_distribution: 'Symphonic Distribution',
      };

      const canonicalizeDistributor = (label: string) => distributorLabelMap[normalizeHeader(label)] || label;

      const parseDistributorEmails = (val: any): Record<string, string> => {
        if (!hasValue(val)) return {};
        if (typeof val === 'object' && !Array.isArray(val)) return val as Record<string, string>;

        const str = String(val).trim();
        if (!str) return {};

        // JSON
        try {
          const json = JSON.parse(str);
          if (json && typeof json === 'object' && !Array.isArray(json)) return json as Record<string, string>;
        } catch {
          // ignore
        }

        // Exported format: "DistroKid: email; ONErpm: email"
        const result: Record<string, string> = {};
        str
          .split(';')
          .map((p) => p.trim())
          .filter(Boolean)
          .forEach((part) => {
            const colonIdx = part.indexOf(':');
            if (colonIdx === -1) return;
            const label = part.slice(0, colonIdx).trim();
            const email = part.slice(colonIdx + 1).trim();
            if (!email) return;
            result[canonicalizeDistributor(label)] = email;
          });

        return result;
      };

      for (const row of data) {
        try {
          const idx = buildRowIndex(row);

          // Alinhado com os rótulos de exportação (useDataExport.ts) + aliases comuns
          const artistTypes = parseList(pick(row, idx, ['Tipos de Artista', 'artist_types']));
          const distributors = parseList(pick(row, idx, ['Distribuidores', 'distributors'])).map(canonicalizeDistributor);
          const distributorEmails = parseDistributorEmails(pick(row, idx, ['E-mails de Share', 'E-mails de share', 'distributor_emails']));

          const artistData: any = {
            name: toText(pick(row, idx, ['Nome Artístico', 'Nome', 'name', 'Nome Artistico'])),
            full_name: toText(pick(row, idx, ['Nome Completo', 'full_name'])),
            birth_date: parseExcelDateToISO(pick(row, idx, ['Data de Nascimento', 'birth_date'])),
            phone: toText(pick(row, idx, ['Telefone', 'phone'])),
            email: toText(pick(row, idx, ['E-mail', 'Email', 'email'])),
            genre: toText(pick(row, idx, ['Gênero Musical', 'Genero Musical', 'Gênero', 'genre'])),
            bio: toText(pick(row, idx, ['Biografia', 'bio'])),
            artist_types: artistTypes,
            profile_type: toText(pick(row, idx, ['Tipo de Perfil', 'profile_type'])),
            spotify_url: toText(pick(row, idx, ['Perfil Spotify', 'Spotify', 'spotify_url'])),
            instagram: toText(pick(row, idx, ['Instagram', 'instagram'])),
            youtube_url: toText(pick(row, idx, ['YouTube', 'youtube_url'])),
            tiktok: toText(pick(row, idx, ['TikTok', 'tiktok'])),
            soundcloud: toText(pick(row, idx, ['SoundCloud', 'soundcloud'])),
            deezer_url: toText(pick(row, idx, ['Deezer', 'deezer_url'])),
            apple_music_url: toText(pick(row, idx, ['Apple Music', 'apple_music_url'])),
            record_label_name: toText(pick(row, idx, ['Nome da Gravadora', 'record_label_name'])),
            label_contact_name: toText(pick(row, idx, ['Nome Contato Gravadora', 'label_contact_name'])),
            label_contact_phone: toText(pick(row, idx, ['Telefone Contato Gravadora', 'label_contact_phone'])),
            label_contact_email: toText(pick(row, idx, ['E-mail Contato Gravadora', 'label_contact_email'])),
            manager_name: toText(pick(row, idx, ['Nome Empresário/Responsável', 'Nome do Empresário', 'manager_name'])),
            manager_phone: toText(pick(row, idx, ['Telefone Empresário/Responsável', 'Telefone do Empresário', 'manager_phone'])),
            manager_email: toText(pick(row, idx, ['E-mail Empresário/Responsável', 'E-mail do Empresário', 'manager_email'])),
            distributors,
            distributor_emails: distributorEmails,
            observations: toText(pick(row, idx, ['Observações', 'observations'])),
          };

          if (!artistData.name) {
            errorCount++;
            continue;
          }

          const createdArtist = await createArtist.mutateAsync(artistData);

          // Dados sensíveis (artist_sensitive_data)
          const sensitiveData: any = {
            cpf_cnpj: toNullableText(pick(row, idx, ['CPF/CNPJ', 'cpf_cnpj'])),
            rg: toNullableText(pick(row, idx, ['RG', 'rg'])),
            full_address: toNullableText(pick(row, idx, ['Endereço Completo', 'Endereco Completo', 'full_address'])),
            bank: toNullableText(pick(row, idx, ['Banco', 'bank'])),
            agency: toNullableText(pick(row, idx, ['Agência', 'Agencia', 'agency'])),
            account: toNullableText(pick(row, idx, ['Conta', 'account'])),
            pix_key: toNullableText(pick(row, idx, ['Chave PIX', 'pix_key'])),
            account_holder: toNullableText(pick(row, idx, ['Titular da Conta', 'account_holder'])),
            email: toNullableText(pick(row, idx, ['E-mail', 'Email', 'email'])),
            phone: toNullableText(pick(row, idx, ['Telefone', 'phone'])),
          };

          const hasSensitiveData = Object.values(sensitiveData).some(hasValue);

          if (hasSensitiveData && createdArtist?.id) {
            const { error: sensitiveError } = await supabase
              .from('artist_sensitive_data')
              .upsert({ artist_id: createdArtist.id, ...sensitiveData }, { onConflict: 'artist_id' });

            if (sensitiveError) {
              console.error('Erro ao salvar dados sensíveis:', sensitiveError);
              partialCount++;
            }
          }

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
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header - personalizado para artistas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isArtistUser ? "Meu Perfil Artístico" : "Artistas"}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {isArtistUser 
                      ? "Informações, contratos e dados da sua carreira" 
                      : "Gerencie seus artistas e contratos"}
                  </p>
                </div>
              </div>
              {/* Botões de ação - ocultos para usuários artistas */}
              {!isArtistUser && (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <span className="hidden sm:inline">Importar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2" onClick={handleExport} disabled={displayArtists.length === 0}>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                  <Button size="sm" className="gap-1 sm:gap-2" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Artista</span>
                  </Button>
                </div>
              )}
            </div>

            {/* KPI Cards - personalizados para artistas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <DashboardCard 
                title={isArtistUser ? "Meu Cadastro" : "Total de Artistas"} 
                value={isLoading ? '...' : (shouldFilter ? artists.length : (artistsCount || displayArtists.length))} 
                description={isArtistUser ? "perfil ativo" : "artistas cadastrados"} 
                icon={Users} 
                trend={isArtistUser ? undefined : kpiTrends.artists} 
              />
              <DashboardCard 
                title={isArtistUser ? "Meus Projetos" : "Projetos Ativos"} 
                value={projects.length} 
                description={isArtistUser ? "projetos vinculados" : "projetos em andamento"} 
                icon={Music} 
              />
              <DashboardCard 
                title={isArtistUser ? "Meus Contratos" : "Contratos Vigentes"} 
                value={activeContracts.length} 
                description={isArtistUser ? "contratos ativos" : "contratos ativos"} 
                icon={DollarSign} 
              />
              <DashboardCard 
                title={isArtistUser ? "Meus Lançamentos" : "Total de Lançamentos"} 
                value={releases.length} 
                description={isArtistUser ? "lançamentos publicados" : "lançamentos no catálogo"} 
                icon={Star} 
              />
            </div>

            {/* Search and Filters */}
            <SearchFilter searchPlaceholder="Buscar artistas por nome, email ou gênero..." filters={filterOptions} onSearch={handleSearch} onFilter={handleFilter} onClear={handleClear} />

            {/* Artists List */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{isArtistUser ? "Meu Perfil de Artista" : "Lista de Artistas"}</CardTitle>
                    <CardDescription>{isArtistUser ? "Visualize suas informações como artista" : "Visão geral de todos os artistas"}</CardDescription>
                  </div>
                  {!isArtistUser && selectedItems.length > 0 && (
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
                            <ArtistCard artist={artist} hasActiveContract={artistContractStatusMap[artist.id] || false} />
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
