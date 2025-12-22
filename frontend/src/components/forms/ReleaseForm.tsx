import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusIcon, Trash2Icon, UploadIcon, ImageIcon, MusicIcon, X, FolderOpen, AlertCircle, Loader2, ExternalLink, LogIn, BarChart3 } from 'lucide-react';
import { FaSpotify, FaApple } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { usePhonograms } from '@/hooks/usePhonograms';
import { useCreateRelease, useUpdateRelease } from '@/hooks/useReleases';
import { useReleaseMetrics, useUpdateManualMetrics } from '@/hooks/useReleaseMetrics';
import { DateInput } from '@/components/ui/date-input';
import { supabase } from '@/integrations/supabase/client';
import { ReleaseShareModal } from '@/components/modals/ReleaseShareModal';

const trackSchema = z.object({
  title: z.string().min(1, 'Título da faixa é obrigatório'),
  artist: z.string().min(1, 'Artista é obrigatório'),
  composers: z.array(z.string()).default([]),
  performers: z.array(z.string()).default([]),
  producers: z.array(z.string()).default([]),
  isrc: z.string().optional(),
  audio_file: z.string().optional(),
  lyrics: z.string().optional(),
});

const releaseSchema = z.object({
  // Project linkage
  project_id: z.string().optional(),
  
  // Basic info
  release_title: z.string().min(1, 'Título é obrigatório'),
  artist_name: z.string().min(1, 'Nome do artista é obrigatório'),
  release_type: z.enum(['single', 'ep', 'album']).optional(),
  release_date: z.string().optional(),
  status: z.enum(['em_analise', 'aprovado', 'rejeitado', 'pausado', 'takedown']).default('em_analise'),
  platforms: z.array(z.string()).max(1, 'Selecione apenas uma distribuidora').default([]),
  distribution_notes: z.string().optional(),
  upc: z.string().max(20, 'Código UPC deve ter no máximo 20 caracteres').optional(),
  
  // Metadados
  genre: z.string().min(1, 'Gênero é obrigatório'),
  language: z.string().min(1, 'Idioma é obrigatório'),
  label: z.string().optional(),
  copyright: z.string().optional(),
  
  // Artes
  cover_art: z.string().optional(),
  additional_images: z.array(z.string()).default([]),
  
  // Faixas
  tracks: z.array(trackSchema).min(1, 'Pelo menos uma faixa é obrigatória'),
  
  // Métricas manuais
  spotify_streams: z.number().optional(),
  apple_music_streams: z.number().optional(),
});

type ReleaseFormData = z.infer<typeof releaseSchema>;

interface ReleaseFormProps {
  release?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const distributorOptions = [
  { id: '30por1', label: '30por1', description: 'Distribuidora brasileira independente', website: 'https://30por1.com.br' },
  { id: 'distrokid', label: 'DistroKid', description: 'Distribuidora digital com distribuição ilimitada', website: 'https://distrokid.com' },
  { id: 'onerpm', label: 'ONErpm', description: 'Distribuidora global com presença na América Latina', website: 'https://onerpm.com' },
  { id: 'outras_distribuidoras', label: 'Outras', description: 'Outras distribuidoras digitais', website: '' },
];

// Componente para gerenciar lista de strings múltiplas
interface MultiStringFieldProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}

function MultiStringField({ label, placeholder, values, onChange }: MultiStringFieldProps) {
  const addField = () => {
    onChange([...values, '']);
  };

  const removeField = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const updateField = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  // Ensure at least one field is always present
  const displayValues = values.length === 0 ? [''] : values;

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      {displayValues.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => updateField(index, e.target.value)}
          />
          {displayValues.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeField(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addField}
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Adicionar {label === "Compositores" ? "Compositor" : label === "Produtores" ? "Produtor" : label.slice(0, -1)}
      </Button>
    </div>
  );
}

export function ReleaseForm({ release, onSuccess, onCancel }: ReleaseFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: artists = [] } = useArtists();
  const { data: musicRegistry = [] } = useMusicRegistry();
  const { data: phonograms = [] } = usePhonograms();
  const createRelease = useCreateRelease();
  const updateRelease = useUpdateRelease();
  
  // State for share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [savedRelease, setSavedRelease] = useState<any>(null);
  
  // Fetch existing metrics for edit mode
  const { data: existingMetrics } = useReleaseMetrics(release?.id);
  const updateManualMetrics = useUpdateManualMetrics();

  // Filtrar projetos que estão: concluídos + com obra registrada + com fonograma registrado
  const availableProjects = useMemo(() => {
    // Obter títulos das obras registradas com status 'aceita'
    const registeredWorkTitles = new Set(
      musicRegistry
        .filter(w => w.status === 'aceita')
        .map(w => w.title?.toLowerCase().trim())
        .filter(Boolean)
    );
    
    // Obter títulos dos fonogramas registrados
    const phonogramTitles = new Set(
      phonograms.map(p => p.title?.toLowerCase().trim()).filter(Boolean)
    );
    
    // Filtrar projetos concluídos que têm obra registrada e fonograma com mesmo nome
    return projects.filter(project => {
      if (project.status !== 'completed') return false;
      
      const projectName = project.name?.toLowerCase().trim();
      if (!projectName) return false;
      
      // Verificar se existe obra registrada com o mesmo nome
      const hasRegisteredWork = registeredWorkTitles.has(projectName);
      
      // Verificar se existe fonograma com o mesmo nome
      const hasPhonogram = phonogramTitles.has(projectName);
      
      return hasRegisteredWork && hasPhonogram;
    });
  }, [projects, musicRegistry, phonograms]);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>(() => {
    // Initialize with existing cover when editing
    if (release?.cover_url || release?.cover_art) {
      return { cover_art: release.cover_url || release.cover_art };
    }
    return {};
  });
  
  // Map release artist to get display name
  const releaseArtist = release?.artist_id 
    ? artists.find(a => a.id === release.artist_id) 
    : null;
  const artistDisplayName = releaseArtist?.stage_name || releaseArtist?.name || '';

  // Map database status to form status
  const mapDbStatusToFormStatus = (dbStatus: string | undefined): 'em_analise' | 'aprovado' | 'rejeitado' | 'pausado' => {
    if (!dbStatus) return 'em_analise';
    switch (dbStatus) {
      case 'released': return 'aprovado';
      case 'cancelled': return 'rejeitado';
      case 'paused': return 'pausado';
      case 'planning':
      default: return 'em_analise';
    }
  };

  // Parse tracks from database JSON
  const parseTracks = (tracksData: any) => {
    if (!tracksData) return null;
    if (Array.isArray(tracksData) && tracksData.length > 0) {
      return tracksData.map((track: any) => ({
        title: track.title || '',
        artist: track.artist || artistDisplayName || '',
        composers: Array.isArray(track.composers) ? track.composers : [],
        performers: Array.isArray(track.performers) ? track.performers : [],
        producers: Array.isArray(track.producers) ? track.producers : [],
        isrc: track.isrc || '',
        audio_file: track.audio_file || '',
        lyrics: track.lyrics || '',
      }));
    }
    return null;
  };

  const parsedTracks = parseTracks(release?.tracks);

  const form = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      project_id: release?.project_id || '',
      // Map database field 'title' to form field 'release_title'
      release_title: release?.title || release?.release_title || '',
      // Get artist name from artist_id or stored value
      artist_name: artistDisplayName || release?.artist_name || '',
      release_type: release?.release_type || release?.type || undefined,
      release_date: release?.release_date || '',
      status: mapDbStatusToFormStatus(release?.status),
      // Map database field 'distributors' to form field 'platforms'
      platforms: release?.distributors || release?.platforms || ['onerpm'],
      distribution_notes: release?.distribution_notes || '',
      upc: release?.upc || '',
      genre: release?.genre || '',
      language: release?.language || '',
      label: release?.label || '',
      copyright: release?.copyright || '',
      // Map database field 'cover_url' to form field 'cover_art'
      cover_art: release?.cover_url || release?.cover_art || '',
      additional_images: release?.additional_images || [],
      tracks: parsedTracks || [{ 
        title: '', 
        artist: '', 
        composers: [], 
        performers: [], 
        producers: [], 
        isrc: '', 
        audio_file: '', 
        lyrics: '' 
      }],
      // Métricas manuais
      spotify_streams: 0,
      apple_music_streams: 0,
    },
  });

  // Update metrics fields when existing metrics are loaded
  useEffect(() => {
    if (existingMetrics) {
      if (existingMetrics.byPlatform.spotify?.streams) {
        form.setValue('spotify_streams', existingMetrics.byPlatform.spotify.streams);
      }
      if (existingMetrics.byPlatform.apple_music?.streams) {
        form.setValue('apple_music_streams', existingMetrics.byPlatform.apple_music.streams);
      }
    }
  }, [existingMetrics, form]);

  const selectedProjectId = form.watch('project_id');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Auto-fill data when project is selected
  useEffect(() => {
    if (selectedProject) {
      // Parse audio_files data
      let audioData: any = null;
      if (selectedProject.audio_files) {
        if (typeof selectedProject.audio_files === 'string') {
          try {
            audioData = JSON.parse(selectedProject.audio_files);
          } catch {
            audioData = null;
          }
        } else {
          audioData = selectedProject.audio_files;
        }
      }
      
      // Set release title from project name
      form.setValue('release_title', selectedProject.name || '');
      
      // Set release type from audio_files
      if (audioData?.release_type) {
        form.setValue('release_type', audioData.release_type as 'single' | 'ep' | 'album');
      }
      
      // Get artist from project's artist_id - use stage_name first, then name
      const projectArtist = artists.find(a => a.id === selectedProject.artist_id);
      if (projectArtist) {
        const artistDisplayName = projectArtist.stage_name || projectArtist.name || '';
        form.setValue('artist_name', artistDisplayName);
        
        // Auto-select artist's distributors
        if (projectArtist.distributors && projectArtist.distributors.length > 0) {
          // Map distributor names to form values
          const distributorMap: Record<string, string> = {
            'ONErpm': 'onerpm',
            'DistroKid': 'distrokid',
            '30por1': '30por1',
            'Believe': 'believe',
            'TuneCore': 'tunecore',
            'CD Baby': 'cd_baby',
          };
          const mappedDistributors = projectArtist.distributors
            .map((d: string) => distributorMap[d] || d.toLowerCase())
            .filter(Boolean);
          // Only use the first distributor
          if (mappedDistributors.length > 0) {
            form.setValue('platforms', [mappedDistributors[0]]);
          }
        }
      }
      
      // Get songs data
      const songs = audioData?.songs || [];
      if (songs.length > 0) {
        const firstSong = songs[0];
        
        // Set genre from first song
        if (firstSong.genre) {
          form.setValue('genre', firstSong.genre.toLowerCase());
        }
        
        // Set language from first song
        if (firstSong.language) {
          const langMap: Record<string, string> = {
            'Português': 'portugues',
            'Inglês': 'ingles',
            'Espanhol': 'espanhol',
            'Instrumental': 'instrumental'
          };
          form.setValue('language', langMap[firstSong.language] || firstSong.language.toLowerCase());
        }
        
        // Get artist display name for tracks
        const trackArtistName = projectArtist?.stage_name || projectArtist?.name || 
          firstSong.performers?.[0]?.name || firstSong.composers?.[0]?.name || '';
        
        // Create tracks from songs - find ISRC from phonogram
        const tracks = songs.map((song: any) => {
          // Find the music registry entry that matches this song
          const matchingWork = musicRegistry.find(m => 
            m.title?.toLowerCase() === song.song_name?.toLowerCase()
          );
          
          // Find the phonogram linked to this work to get the ISRC
          let isrcCode = '';
          if (matchingWork) {
            const matchingPhonogram = phonograms.find(p => p.work_id === matchingWork.id);
            if (matchingPhonogram?.isrc) {
              isrcCode = matchingPhonogram.isrc;
            }
          }
          
          return {
            title: song.song_name || '',
            artist: trackArtistName,
            composers: (song.composers || []).map((c: any) => c.name).filter(Boolean),
            performers: (song.performers || []).map((p: any) => p.name).filter(Boolean),
            producers: (song.producers || []).map((p: any) => p.name).filter(Boolean),
            isrc: isrcCode,
            audio_file: song.audio_files?.[0]?.url || '',
            lyrics: song.lyrics || '',
          };
        });
        
        if (tracks.length > 0) {
          form.setValue('tracks', tracks);
        }
      }
      
      toast({
        title: "Projeto selecionado",
        description: `Dados do projeto "${selectedProject.name}" carregados.`,
      });
    }
  }, [selectedProject, artists, musicRegistry, phonograms, form, toast]);

  const releaseType = form.watch('release_type');

  const {
    fields: trackFields,
    append: appendTrack,
    remove: removeTrack,
  } = useFieldArray({
    control: form.control,
    name: 'tracks',
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (fileType: string, file: File) => {
    // Validações
    if (fileType === 'cover_art' || fileType.startsWith('additional_')) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Formato não suportado",
          description: "Use apenas imagens JPEG, PNG ou WebP.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Imagem muito grande",
          description: "O tamanho máximo permitido é 10MB.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (fileType.includes('audio')) {
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
      if (!validAudioTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mp3') && !file.name.toLowerCase().endsWith('.wav')) {
        toast({
          title: "Formato não suportado",
          description: "Use apenas arquivos de áudio MP3 ou WAV.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo para áudio é 25MB.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Upload to Supabase Storage
    if (fileType === 'cover_art') {
      setIsUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `covers/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('release-covers')
          .upload(filePath, file);
        
        if (error) {
          throw error;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('release-covers')
          .getPublicUrl(filePath);
        
        setUploadedFiles(prev => ({ ...prev, [fileType]: publicUrl }));
        form.setValue('cover_art', publicUrl);
        
        toast({
          title: "Imagem carregada",
          description: "A capa foi carregada com sucesso!",
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: "Erro no upload",
          description: error.message || "Erro ao carregar a imagem.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // For audio files, still use blob URL for now
      const fileUrl = URL.createObjectURL(file);
      setUploadedFiles(prev => ({ ...prev, [fileType]: fileUrl }));
      toast({
        title: "Arquivo carregado",
        description: `Arquivo ${file.name} selecionado com sucesso!`,
      });
    }
  };

  const onSubmit = async (data: ReleaseFormData) => {
    try {
      // Find the artist_id from the selected project
      const projectArtist = artists.find(a => 
        a.stage_name === data.artist_name || a.name === data.artist_name
      );
      
      // Check if status is changing to "aprovado" and was not already approved
      const isBeingApproved = data.status === 'aprovado' && 
        (release?.status !== 'released' && release?.status !== 'aprovado');
      
      // Determine status - only set to 'released' if we have a release date
      let mappedStatus = 'planning';
      if (data.status === 'aprovado') {
        // Only set to 'released' if there's a release date, otherwise keep as 'approved'
        mappedStatus = data.release_date ? 'released' : 'approved';
      } else if (data.status === 'rejeitado') {
        mappedStatus = 'cancelled';
      } else if (data.status === 'pausado') {
        mappedStatus = 'paused';
      } else if (data.status === 'em_analise') {
        mappedStatus = 'pending';
      } else if (data.status === 'takedown') {
        mappedStatus = 'takedown';
      }
      
      const releaseData = {
        title: data.release_title,
        artist_id: projectArtist?.id || selectedProject?.artist_id || null,
        release_type: data.release_type || 'single',
        type: data.release_type || 'single',
        release_date: data.release_date || null,
        planned_release_date: data.release_date || null,
        status: mappedStatus,
        cover_url: data.cover_art || null,
        genre: data.genre || null,
        language: data.language || null,
        label: data.label || null,
        copyright: data.copyright || null,
        distributors: data.platforms || [],
        tracks: data.tracks || [],
        project_id: data.project_id || null,
        upc: data.upc || null,
      };
      
      let releaseId = release?.id;
      let savedReleaseData = null;
      
      if (releaseId) {
        await updateRelease.mutateAsync({
          id: releaseId,
          data: releaseData
        });
        savedReleaseData = { id: releaseId, ...releaseData, artist_id: projectArtist?.id || selectedProject?.artist_id };
      } else {
        const newRelease = await createRelease.mutateAsync(releaseData);
        releaseId = newRelease?.id;
        savedReleaseData = newRelease;
      }
      
      // Save manual metrics if provided and we have a release ID
      if (releaseId) {
        if (data.spotify_streams && data.spotify_streams > 0) {
          await updateManualMetrics.mutateAsync({
            releaseId,
            platform: 'spotify',
            streams: data.spotify_streams,
          });
        }
        if (data.apple_music_streams && data.apple_music_streams > 0) {
          await updateManualMetrics.mutateAsync({
            releaseId,
            platform: 'apple_music',
            streams: data.apple_music_streams,
          });
        }
      }
      
      // If status is being changed to "aprovado", open share modal
      if (isBeingApproved && savedReleaseData) {
        setSavedRelease(savedReleaseData);
        setShareModalOpen(true);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error saving release:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar lançamento.",
        variant: "destructive",
      });
    }
  };

  const handleShareModalSuccess = () => {
    setShareModalOpen(false);
    setSavedRelease(null);
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projeto Base
            </CardTitle>
            <CardDescription>
              Selecione um projeto para pré-carregar informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProjects.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nenhum projeto disponível. Fluxo: Projeto Concluído → Obra Registrada (Aceita) → Fonograma Registrado.
                        </div>
                      ) : (
                        availableProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} {project.description && `- ${project.description}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedProject && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Projeto:</strong> {selectedProject.name}
                  {selectedProject.description && ` - ${selectedProject.description}`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Complete as informações do lançamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="release_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Lançamento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do single/álbum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artist_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Artista *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome do artista principal" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="release_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Lançamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="ep">EP</SelectItem>
                        <SelectItem value="album">Álbum</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código UPC</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o código UPC" {...field} maxLength={20} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hip_hop">Hip Hop</SelectItem>
                        <SelectItem value="eletronica">Eletrônica</SelectItem>
                        <SelectItem value="sertanejo">Sertanejo</SelectItem>
                        <SelectItem value="funk">Funk</SelectItem>
                        <SelectItem value="mpb">MPB</SelectItem>
                        <SelectItem value="samba">Samba</SelectItem>
                        <SelectItem value="reggae">Reggae</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="blues">Blues</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="reggaeton">Reggaeton</SelectItem>
                        <SelectItem value="trap">Trap</SelectItem>
                        <SelectItem value="indie">Indie</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma da Música *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="portugues">Português</SelectItem>
                        <SelectItem value="ingles">Inglês</SelectItem>
                        <SelectItem value="espanhol">Espanhol</SelectItem>
                        <SelectItem value="frances">Francês</SelectItem>
                        <SelectItem value="italiano">Italiano</SelectItem>
                        <SelectItem value="alemao">Alemão</SelectItem>
                        <SelectItem value="japones">Japonês</SelectItem>
                        <SelectItem value="coreano">Coreano</SelectItem>
                        <SelectItem value="mandarim">Mandarim</SelectItem>
                        <SelectItem value="instrumental">Instrumental</SelectItem>
                        <SelectItem value="multilingue">Multilíngue</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="release_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Lançamento</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                        onChange={(date) => {
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        }}
                        placeholder="DD/MM/AAAA"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="rejeitado">Rejeitado</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>


        {/* Faixas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MusicIcon className="h-5 w-5" />
                {releaseType === 'single' ? 'Faixa' : 'Faixas'}
              </div>
              {(releaseType === 'ep' || releaseType === 'album') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                   onClick={() => appendTrack({ 
                     title: '', 
                     artist: '', 
                     composers: [], 
                     performers: [], 
                     producers: [], 
                     isrc: '', 
                     audio_file: '', 
                     lyrics: '' 
                   })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Faixa
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trackFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {releaseType === 'single' ? 'Faixa' : `Faixa ${index + 1}`}
                  </h4>
                  {(releaseType === 'ep' || releaseType === 'album') && trackFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTrack(index)}
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Faixa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da música" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tracks.${index}.artist`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artista *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome do artista" 
                            {...field} 
                            value={field.value || form.getValues('artist_name')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tracks.${index}.isrc`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código ISRC</FormLabel>
                        <FormControl>
                          <Input placeholder="BR-UBC-12-34567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Compositores, Intérpretes e Produtores */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.composers`}
                    render={({ field }) => (
                      <FormItem>
                        <MultiStringField
                          label="Compositores"
                          placeholder="Nome do compositor"
                          values={field.value || []}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tracks.${index}.performers`}
                    render={({ field }) => (
                      <FormItem>
                        <MultiStringField
                          label="Intérpretes"
                          placeholder="Nome do intérprete"
                          values={field.value || []}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tracks.${index}.producers`}
                    render={({ field }) => (
                      <FormItem>
                        <MultiStringField
                          label="Produtores"
                          placeholder="Nome do produtor"
                          values={field.value || []}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Upload de Áudio para a Faixa */}
                <div className="space-y-2">
                  <FormLabel>Arquivo de Áudio</FormLabel>
                  <FormField
                    control={form.control}
                    name={`tracks.${index}.audio_file`}
                    render={({ field }) => (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {field.value ? (
                          <div className="space-y-2">
                            <p className="text-sm text-green-600 flex items-center justify-center gap-2">
                              <MusicIcon className="h-4 w-4" />
                              Áudio carregado
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-full">
                              {field.value.split('/').pop()?.substring(0, 50) || 'Arquivo de áudio'}
                            </p>
                          </div>
                        ) : uploadedFiles[`track_${index}_audio`] ? (
                          <p className="text-sm text-green-600">Áudio carregado com sucesso</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            MP3 ou WAV (máx. 25MB)
                          </p>
                        )}
                        <input
                          type="file"
                          accept=".mp3,.wav,audio/mpeg,audio/wav"
                          className="hidden"
                          id={`track-${index}-audio-upload`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(`track_${index}_audio`, file);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`track-${index}-audio-upload`)?.click()}
                          className="mt-2"
                        >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          {field.value ? 'Substituir Áudio' : 'Selecionar Áudio'}
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`tracks.${index}.lyrics`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Letra (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Letra da música..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravadora/Selo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da gravadora ou selo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copyright</FormLabel>
                    <FormControl>
                      <Input placeholder="© 2024 Nome do detentor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload de Artes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Artes do Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Capa Principal */}
            <div className="space-y-4">
              <FormLabel>Capa Principal *</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedFiles.cover_art ? (
                  <div className="space-y-2">
                    <img 
                      src={uploadedFiles.cover_art} 
                      alt="Capa" 
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                    <p className="text-sm text-green-600">Capa carregada com sucesso</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar a capa ou arraste e solte aqui
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: JPEG, PNG, WebP (máx. 10MB) - Recomendado: 3000x3000px
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="cover-art-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload('cover_art', file);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('cover-art-upload')?.click()}
                  className="mt-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Selecionar Capa
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plataformas de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
            <CardDescription>Selecione a distribuidora para envio às plataformas digitais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="platforms"
              render={({ field }) => {
                const selectedDistributorId = field.value?.[0] || '';
                const selectedDistributor = distributorOptions.find(d => d.id === selectedDistributorId);
                
                return (
                  <FormItem>
                    <FormLabel>Distribuidora *</FormLabel>
                    <Select 
                      value={selectedDistributorId} 
                      onValueChange={(value) => field.onChange([value])}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a distribuidora">
                            {selectedDistributor && (
                              <div className="flex items-center gap-2">
                                <MusicIcon className="h-4 w-4 text-primary" />
                                {selectedDistributor.label}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {distributorOptions.map((distributor) => (
                          <SelectItem key={distributor.id} value={distributor.id}>
                            <div className="flex items-center gap-2">
                              <MusicIcon className="h-4 w-4 text-primary" />
                              {distributor.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Card da distribuidora selecionada */}
                    {selectedDistributor && (
                      <div className="mt-4 border border-border rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MusicIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{selectedDistributor.label}</h4>
                              <p className="text-sm text-muted-foreground">{selectedDistributor.description}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-1 whitespace-nowrap">
                            ✕ Não conectado
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button 
                            type="button" 
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => {
                              toast({
                                title: "Conectar Distribuidora",
                                description: `Redirecionando para configurar conexão com ${selectedDistributor.label}...`,
                              });
                              navigate('/configuracoes');
                            }}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Conectar com {selectedDistributor.label}
                          </Button>
                          {selectedDistributor.website && (
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => window.open(selectedDistributor.website, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Abrir site
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="distribution_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Distribuição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas especiais sobre a distribuição (ex: data preferencial, territórios, exclusividades...)"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Métricas de Streaming (apenas para edição) */}
        {release?.id && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas de Streaming
              </CardTitle>
              <CardDescription>
                Insira manualmente os streams do Spotify for Artists e Apple Music Connect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spotify_streams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaSpotify className="h-4 w-4 text-green-500" />
                        Streams Spotify
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 150000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apple_music_streams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FaApple className="h-4 w-4 text-muted-foreground" />
                        Streams Apple Music
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 75000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Acesse o Spotify for Artists e Apple Music Connect para obter os dados reais de streaming.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {release ? 'Atualizar' : 'Criar Lançamento'}
          </Button>
        </div>
      </form>

      {/* Share Modal - opens when release is approved */}
      <ReleaseShareModal
        open={shareModalOpen}
        onOpenChange={(open) => {
          setShareModalOpen(open);
          if (!open) {
            handleShareModalSuccess();
          }
        }}
        release={savedRelease}
        onSuccess={handleShareModalSuccess}
      />
    </Form>
  );
}