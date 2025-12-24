import React, { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PlusIcon, Trash2Icon, ChevronDown, ChevronUp, Search, Upload, FileAudio, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useArtists } from '@/hooks/useArtists';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { useCreatePhonogram, useUpdatePhonogram } from '@/hooks/usePhonograms';
import { useProjects } from '@/hooks/useProjects';
import { useCrmContacts } from '@/hooks/useCrm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
const participantSchema = z.object({
  name: z.string().optional().default(''),
  role: z.string().optional().default(''),
  percentage: z.number().min(0).max(100).optional()
});
const phonogramSchema = z.object({
  // Vincular Obra
  work_id: z.string().optional(),
  work_abramus_code: z.string().optional(),
  work_title: z.string().optional(),
  // Dados do Fonograma
  abramus_code: z.string().optional(),
  ecad_code: z.string().optional(),
  aggregator: z.string().optional(),
  isrc_country: z.string().optional(),
  isrc_registrant: z.string().optional(),
  isrc_year: z.string().optional(),
  isrc_designation: z.string().optional(),
  is_ai_created: z.boolean().default(false),
  emission_date: z.string().optional(),
  recording_date: z.string().optional(),
  release_date: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).max(59).optional(),
  is_instrumental: z.boolean().default(false),
  genre: z.string().optional(),
  classification: z.string().optional(),
  media: z.string().optional(),
  is_national: z.boolean().default(true),
  simultaneous_publication: z.boolean().default(false),
  origin_country: z.string().optional(),
  publication_country: z.string().optional(),
  status: z.enum(['em_analise', 'aceita', 'recusada']).default('em_analise'),
  // Participação
  phonographic_producers: z.array(participantSchema).optional(),
  performers: z.array(participantSchema).optional(),
  musicians: z.array(participantSchema).optional(),
  // Áudio e Termos
  audio_file: z.any().optional(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos de uso"
  })
});
type PhonogramFormData = z.infer<typeof phonogramSchema>;
interface PhonogramFormProps {
  phonogram?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Toggle Button Component
const ToggleButton = ({
  value,
  onChange,
  options
}: {
  value: boolean;
  onChange: (val: boolean) => void;
  options: [string, string];
}) => <div className="flex gap-1">
    <Button type="button" size="sm" variant={!value ? "default" : "outline"} className={cn(!value && "bg-primary hover:bg-primary/90")} onClick={() => onChange(false)}>
      {options[0]}
    </Button>
    <Button type="button" size="sm" variant={value ? "default" : "outline"} className={cn(value && "bg-primary hover:bg-primary/90")} onClick={() => onChange(true)}>
      {options[1]}
    </Button>
  </div>;
export function PhonogramForm({
  phonogram,
  onSuccess,
  onCancel
}: PhonogramFormProps) {
  const {
    toast
  } = useToast();
  const {
    data: works = []
  } = useMusicRegistry();
  const {
    data: projects = []
  } = useProjects();
  const {
    data: artists = []
  } = useArtists();
  const {
    data: crmContacts = []
  } = useCrmContacts();
  const createPhonogram = useCreatePhonogram();
  const updatePhonogram = useUpdatePhonogram();

  // Go directly to step 2 (form) - skip step 1 since flow is: projects -> obras -> fonogramas
  const [currentStep, setCurrentStep] = useState<1 | 2>(2);
  const [selectedWork, setSelectedWorkState] = useState<any>(phonogram?.work_id ? works.find(w => w.id === phonogram.work_id) : null);
  const [workSearchOpen, setWorkSearchOpen] = useState(false);
  const [workSearchTerm, setWorkSearchTerm] = useState('');
  // Abrir seções se houver participantes ao editar
  const hasProducers = phonogram?.participants?.some((p: any) => p.role === 'produtor_fonografico');
  const hasPerformers = phonogram?.participants?.some((p: any) => p.role === 'interprete');
  const hasMusicians = phonogram?.participants?.some((p: any) => p.role === 'musico');
  const [producersOpen, setProducersOpen] = useState(hasProducers || true);
  const [performersOpen, setPerformersOpen] = useState(!!hasPerformers);
  const [musiciansOpen, setMusiciansOpen] = useState(!!hasMusicians);
  const [audioUploadOpen, setAudioUploadOpen] = useState(!!phonogram?.audio_url);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(phonogram?.audio_url || null);
  const [projectAudioInfo, setProjectAudioInfo] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [participantSearchTerms, setParticipantSearchTerms] = useState<Record<string, string>>({});
  const [openParticipantPopovers, setOpenParticipantPopovers] = useState<Record<string, boolean>>({});

  // Parse ISRC from phonogram
  const parseIsrc = (isrc: string | null) => {
    if (!isrc) return {
      country: 'BR',
      registrant: '',
      year: '',
      designation: ''
    };
    const parts = isrc.split('-');
    if (parts.length >= 4) {
      return {
        country: parts[0],
        registrant: parts[1],
        year: parts[2],
        designation: parts[3]
      };
    }
    return {
      country: 'BR',
      registrant: '',
      year: '',
      designation: ''
    };
  };
  const parsedIsrc = parseIsrc(phonogram?.isrc);
  // Buscar obra vinculada para preencher work_title e work_abramus_code
  const linkedWork = works.find((w: any) => w.id === phonogram?.work_id);
  const form = useForm<PhonogramFormData>({
    resolver: zodResolver(phonogramSchema),
    defaultValues: {
      work_id: phonogram?.work_id || '',
      work_abramus_code: linkedWork?.abramus_code || phonogram?.abramus_code || '',
      work_title: phonogram?.title || linkedWork?.title || '',
      abramus_code: phonogram?.abramus_code || linkedWork?.abramus_code || '',
      ecad_code: phonogram?.ecad_code || linkedWork?.ecad_code || '',
      aggregator: phonogram?.aggregator || phonogram?.label || '',
      isrc_country: parsedIsrc.country,
      isrc_registrant: parsedIsrc.registrant,
      isrc_year: parsedIsrc.year,
      isrc_designation: parsedIsrc.designation,
      is_ai_created: phonogram?.is_ai_created || false,
      emission_date: phonogram?.emission_date || '',
      recording_date: phonogram?.recording_date || '',
      release_date: phonogram?.release_date || '',
      duration_minutes: phonogram?.duration ? Math.floor(phonogram.duration / 60) : 0,
      duration_seconds: phonogram?.duration ? phonogram.duration % 60 : 0,
      is_instrumental: phonogram?.language === 'instrumental' || phonogram?.is_instrumental || false,
      genre: phonogram?.genre || '',
      classification: phonogram?.classification || phonogram?.version_type || 'studio',
      media: phonogram?.media || 'todos',
      is_national: phonogram?.is_national ?? (phonogram?.language === 'portugues' || true),
      simultaneous_publication: phonogram?.simultaneous_publication || false,
      origin_country: phonogram?.origin_country || phonogram?.recording_location || 'brazil',
      publication_country: phonogram?.publication_country || 'brazil',
      status: phonogram?.status === 'Em Análise' || phonogram?.status === 'pendente' || !phonogram?.status ? 'em_analise' : 
              phonogram?.status === 'Aceita' || phonogram?.status === 'aceita' ? 'aceita' : 
              phonogram?.status === 'Recusada' || phonogram?.status === 'recusada' ? 'recusada' : 'em_analise',
      phonographic_producers: phonogram?.participants?.filter((p: any) => p.role === 'produtor_fonografico')?.length > 0 ? phonogram.participants.filter((p: any) => p.role === 'produtor_fonografico') : [{
        name: 'Deyvisson Lander Andrade 06204919652',
        role: 'produtor_fonografico',
        percentage: 41.70
      }],
      performers: phonogram?.participants?.filter((p: any) => p.role === 'interprete') || [],
      musicians: phonogram?.participants?.filter((p: any) => p.role === 'musico') || [],
      // Se está editando, já aceitou os termos antes
      accept_terms: !!phonogram?.id
    }
  });
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        toast({
          title: "Áudio carregado",
          description: `Arquivo "${file.name}" foi adicionado.`
        });
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de áudio válido.",
          variant: "destructive"
        });
      }
    }
  };
  const removeAudioFile = () => {
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };
  const {
    fields: producerFields,
    append: appendProducer,
    remove: removeProducer
  } = useFieldArray({
    control: form.control,
    name: 'phonographic_producers'
  });
  const {
    fields: performerFields,
    append: appendPerformer,
    remove: removePerformer
  } = useFieldArray({
    control: form.control,
    name: 'performers'
  });
  const {
    fields: musicianFields,
    append: appendMusician,
    remove: removeMusician
  } = useFieldArray({
    control: form.control,
    name: 'musicians'
  });
  const calculateTotalPercentage = (participants: any[]) => {
    return participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
  };
  const producersPercentage = calculateTotalPercentage(form.watch('phonographic_producers') || []);
  const performersPercentage = calculateTotalPercentage(form.watch('performers') || []);
  const musiciansPercentage = calculateTotalPercentage(form.watch('musicians') || []);
  const totalPercentage = producersPercentage + performersPercentage + musiciansPercentage;
  const handleSelectWork = (work: any) => {
    form.setValue('work_id', work.id);
    form.setValue('work_abramus_code', work.abramus_code || '');
    form.setValue('work_title', work.title);
    form.setValue('genre', work.genre || '');
    // Preencher códigos ABRAMUS e ECAD da obra selecionada
    form.setValue('abramus_code', work.abramus_code || '');
    form.setValue('ecad_code', work.ecad_code || '');
    // Preencher is_instrumental se disponível na obra
    form.setValue('is_instrumental', work.is_instrumental || work.language === 'instrumental' || false);
    // Preencher is_ai_created se disponível na obra
    form.setValue('is_ai_created', work.is_ai_created || false);
    
    if (work.duration) {
      form.setValue('duration_minutes', Math.floor(work.duration / 60));
      form.setValue('duration_seconds', work.duration % 60);
    }
    let interpreters: any[] = [];
    let musicianProducers: any[] = [];
    let loadedAudioFile: {
      name: string;
      url: string;
      size: number;
    } | null = null;

    // Helper para parsear audio_files (pode ser string JSON ou objeto)
    const parseAudioFiles = (audioFiles: any) => {
      if (!audioFiles) return null;
      if (typeof audioFiles === 'string') {
        try {
          return JSON.parse(audioFiles);
        } catch {
          return null;
        }
      }
      return audioFiles;
    };

    // Buscar intérpretes, produtores e áudio do projeto relacionado
    const relatedProject = projects.find((p: any) => {
      const parsedAudioFiles = parseAudioFiles(p.audio_files);
      if (!parsedAudioFiles || !parsedAudioFiles.songs) return false;
      return parsedAudioFiles.songs.some((song: any) => song.song_name?.toLowerCase() === work.title?.toLowerCase());
    });
    if (relatedProject) {
      const parsedAudioFiles = parseAudioFiles(relatedProject.audio_files);
      if (parsedAudioFiles?.songs) {
        // Encontrar a música específica dentro do projeto
        const matchingSong = parsedAudioFiles.songs.find((song: any) => song.song_name?.toLowerCase() === work.title?.toLowerCase());
        if (matchingSong) {
          // Preencher Intérpretes (performers do projeto)
          if (matchingSong.performers && matchingSong.performers.length > 0) {
            const performerCount = matchingSong.performers.filter((p: any) => p.name && p.name.trim() !== '').length;
            const defaultPercentagePerPerformer = performerCount > 0 ? 41.70 / performerCount : 0;
            interpreters = matchingSong.performers.filter((p: any) => p.name && p.name.trim() !== '').map((p: any) => ({
              name: p.name || '',
              role: 'interprete',
              percentage: p.percentage || defaultPercentagePerPerformer
            }));
          }

          // Preencher Músicos Acompanhantes (producers do projeto - sempre são produtores)
          if (matchingSong.producers && matchingSong.producers.length > 0) {
            const musicianCount = matchingSong.producers.filter((p: any) => p.name && p.name.trim() !== '').length;
            const defaultPercentagePerMusician = musicianCount > 0 ? 16.60 / musicianCount : 0;
            musicianProducers = matchingSong.producers.filter((p: any) => p.name && p.name.trim() !== '').map((p: any) => ({
              name: p.name || '',
              role: 'musico',
              percentage: p.percentage || defaultPercentagePerMusician
            }));
          }

          // Carregar arquivo de áudio do projeto
          if (matchingSong.audio_files && matchingSong.audio_files.length > 0) {
            const projectAudio = matchingSong.audio_files[0];
            if (projectAudio.url) {
              loadedAudioFile = {
                name: projectAudio.name || 'Áudio do Projeto',
                url: projectAudio.url || '',
                size: projectAudio.size || 0
              };
            }
          }
        }
      }
    }

    // Se não encontrou no projeto, tentar nos participantes da obra
    if (interpreters.length === 0) {
      const workParticipants = work.participants || [];
      const filteredInterpreters = workParticipants.filter((p: any) => p.role === 'interprete' || p.role === 'Intérprete' || p.role?.toLowerCase().includes('interprete')).filter((p: any) => p.name && p.name.trim() !== '');
      const defaultPercentagePerPerformer = filteredInterpreters.length > 0 ? 41.70 / filteredInterpreters.length : 0;
      interpreters = filteredInterpreters.map((p: any) => ({
        name: p.name || '',
        role: 'interprete',
        percentage: p.percentage || defaultPercentagePerPerformer
      }));
    }
    if (musicianProducers.length === 0) {
      const workParticipants = work.participants || [];
      const filteredMusicians = workParticipants.filter((p: any) => p.role === 'produtor' || p.role === 'Produtor' || p.role?.toLowerCase().includes('produtor')).filter((p: any) => p.name && p.name.trim() !== '');
      const defaultPercentagePerMusician = filteredMusicians.length > 0 ? 16.60 / filteredMusicians.length : 0;
      musicianProducers = filteredMusicians.map((p: any) => ({
        name: p.name || '',
        role: 'musico',
        percentage: p.percentage || defaultPercentagePerMusician
      }));
    }
    if (interpreters.length > 0) {
      form.setValue('performers', interpreters);
      setPerformersOpen(true);
    }
    if (musicianProducers.length > 0) {
      form.setValue('musicians', musicianProducers);
      setMusiciansOpen(true);
    }

    // Definir áudio carregado do projeto
    if (loadedAudioFile) {
      setProjectAudioInfo(loadedAudioFile);
      setAudioUploadOpen(true);
    }
    setWorkSearchOpen(false);
    const audioMessage = loadedAudioFile ? ' Áudio do projeto carregado.' : '';
    toast({
      title: "Obra vinculada",
      description: `Obra "${work.title}" foi vinculada ao fonograma.${interpreters.length > 0 ? ` ${interpreters.length} intérprete(s) carregado(s).` : ''}${musicianProducers.length > 0 ? ` ${musicianProducers.length} músico(s) acompanhante(s) carregado(s).` : ''}${audioMessage}`
    });
  };
  // Filter works to show those with status 'aceita' or 'em_analise' (pending or approved)
  const completedWorks = works.filter((w: any) => w.status === 'aceita' || w.status === 'em_analise' || w.status === 'pendente');
  const filteredWorks = completedWorks.filter(w => w.title?.toLowerCase().includes(workSearchTerm.toLowerCase()) || w.abramus_code?.toLowerCase().includes(workSearchTerm.toLowerCase()));
  const onSubmit = async (data: PhonogramFormData) => {
    try {
      setIsUploadingAudio(true);
      const totalDuration = (data.duration_minutes || 0) * 60 + (data.duration_seconds || 0);
      const isrc = `${data.isrc_country || 'BR'}-${data.isrc_registrant || ''}-${data.isrc_year || ''}-${data.isrc_designation || ''}`;

      // Combine all participants and filter out empty ones
      const allParticipants = [...(data.phonographic_producers || []).filter(p => p.name && p.name.trim() !== '').map(p => ({
        ...p,
        role: 'produtor_fonografico'
      })), ...(data.performers || []).filter(p => p.name && p.name.trim() !== '').map(p => ({
        ...p,
        role: 'interprete'
      })), ...(data.musicians || []).filter(p => p.name && p.name.trim() !== '').map(p => ({
        ...p,
        role: 'musico'
      }))];

      // Handle audio upload
      let audioUrl = existingAudioUrl || projectAudioInfo?.url || null;
      if (audioFile) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `phonograms/${fileName}`;
        const {
          data: uploadData,
          error: uploadError
        } = await supabase.storage.from('project-audio').upload(filePath, audioFile);
        if (uploadError) {
          console.error('Error uploading audio:', uploadError);
          toast({
            title: "Erro no upload",
            description: "Falha ao fazer upload do áudio. O fonograma será salvo sem áudio.",
            variant: "destructive"
          });
        } else {
          const {
            data: urlData
          } = supabase.storage.from('project-audio').getPublicUrl(filePath);
          audioUrl = urlData.publicUrl;
        }
      }
      const phonogramData = {
        title: data.work_title || 'Sem título',
        work_id: data.work_id || null,
        isrc: isrc !== 'BR---' ? isrc : null,
        recording_date: data.recording_date || null,
        duration: totalDuration > 0 ? totalDuration : null,
        genre: data.genre || null,
        language: data.is_instrumental ? 'instrumental' : 'portugues',
        status: data.status || 'pendente',
        participants: allParticipants,
        audio_url: audioUrl
      };
      if (phonogram?.id) {
        await updatePhonogram.mutateAsync({
          id: phonogram.id,
          data: phonogramData
        });
      } else {
        await createPhonogram.mutateAsync(phonogramData);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving phonogram:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar fonograma. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingAudio(false);
    }
  };
  // Helper para parsear audio_files (pode ser string JSON ou objeto)
  const parseAudioFiles = (audioFiles: any) => {
    if (!audioFiles) return null;
    if (typeof audioFiles === 'string') {
      try {
        return JSON.parse(audioFiles);
      } catch {
        return null;
      }
    }
    return audioFiles;
  };

  // Extrair performers únicos dos projetos para autocomplete de intérpretes
  const getProjectPerformers = (): Array<{
    name: string;
    projectName: string;
  }> => {
    const performersSet = new Map<string, {
      name: string;
      projectName: string;
    }>();
    projects.forEach((project: any) => {
      const parsedAudioFiles = parseAudioFiles(project.audio_files);
      if (parsedAudioFiles?.songs) {
        parsedAudioFiles.songs.forEach((song: any) => {
          if (song.performers && Array.isArray(song.performers)) {
            song.performers.forEach((p: any) => {
              if (p.name && p.name.trim() !== '' && !performersSet.has(p.name.toLowerCase())) {
                performersSet.set(p.name.toLowerCase(), {
                  name: p.name,
                  projectName: project.name
                });
              }
            });
          }
        });
      }
    });
    return Array.from(performersSet.values());
  };

  // Extrair producers únicos dos projetos para autocomplete de músicos acompanhantes
  const getProjectProducers = (): Array<{
    name: string;
    projectName: string;
  }> => {
    const producersSet = new Map<string, {
      name: string;
      projectName: string;
    }>();
    projects.forEach((project: any) => {
      const parsedAudioFiles = parseAudioFiles(project.audio_files);
      if (parsedAudioFiles?.songs) {
        parsedAudioFiles.songs.forEach((song: any) => {
          if (song.producers && Array.isArray(song.producers)) {
            song.producers.forEach((p: any) => {
              if (p.name && p.name.trim() !== '' && !producersSet.has(p.name.toLowerCase())) {
                producersSet.set(p.name.toLowerCase(), {
                  name: p.name,
                  projectName: project.name
                });
              }
            });
          }
        });
      }
    });
    return Array.from(producersSet.values());
  };
  const getFilteredArtists = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) return artists.slice(0, 15);
    const term = searchTerm.toLowerCase();
    return artists.filter((artist: any) => artist.name?.toLowerCase().includes(term) || artist.full_name?.toLowerCase().includes(term)).slice(0, 15);
  };

  // Filtrar performers dos projetos para intérpretes
  const getFilteredPerformers = (searchTerm: string) => {
    const allPerformers = getProjectPerformers();
    if (!searchTerm || searchTerm.length < 1) return allPerformers.slice(0, 15);
    const term = searchTerm.toLowerCase();
    return allPerformers.filter(p => p.name.toLowerCase().includes(term)).slice(0, 15);
  };

  // Filtrar producers dos projetos para músicos acompanhantes
  const getFilteredProducers = (searchTerm: string) => {
    const allProducers = getProjectProducers();
    if (!searchTerm || searchTerm.length < 1) return allProducers.slice(0, 15);
    const term = searchTerm.toLowerCase();
    return getProjectProducers().filter(p => p.name.toLowerCase().includes(term)).slice(0, 15);
  };
  const handleSelectArtist = (artist: any, fieldName: string, index: number) => {
    const displayName = artist.name || artist.full_name;
    form.setValue(`${fieldName}.${index}.name` as any, displayName);
    setOpenParticipantPopovers(prev => ({
      ...prev,
      [`${fieldName}_${index}`]: false
    }));
    setParticipantSearchTerms(prev => ({
      ...prev,
      [`${fieldName}_${index}`]: ''
    }));
  };
  const handleSelectProjectParticipant = (participant: {
    name: string;
    projectName: string;
  }, fieldName: string, index: number) => {
    form.setValue(`${fieldName}.${index}.name` as any, participant.name);
    setOpenParticipantPopovers(prev => ({
      ...prev,
      [`${fieldName}_${index}`]: false
    }));
    setParticipantSearchTerms(prev => ({
      ...prev,
      [`${fieldName}_${index}`]: ''
    }));
  };
  const renderParticipantSection = (title: string, fields: any[], append: (value: any) => void, remove: (index: number) => void, isOpen: boolean, setIsOpen: (open: boolean) => void, fieldName: 'phonographic_producers' | 'performers' | 'musicians', percentage: number, maxPercentage: number = 100) => {
    // Filtrar contatos do CRM
    const getFilteredCrmContacts = (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 1) return crmContacts.slice(0, 15);
      const term = searchTerm.toLowerCase();
      return crmContacts.filter((contact: any) => contact.name?.toLowerCase().includes(term) || contact.company?.toLowerCase().includes(term)).slice(0, 15);
    };

    // Determinar fonte de autocomplete baseado no tipo de participante
    const getFilteredSuggestions = (searchTerm: string) => {
      if (fieldName === 'performers') {
        // Para intérpretes, buscar dos performers dos projetos + artistas
        const projectPerformers = getFilteredPerformers(searchTerm);
        const artistSuggestions = getFilteredArtists(searchTerm).map(a => ({
          name: a.name || a.full_name,
          projectName: 'Artista cadastrado',
          isArtist: true,
          isCrmContact: false,
          artistData: a
        }));
        return [...projectPerformers.map(p => ({
          ...p,
          isArtist: false,
          isCrmContact: false,
          artistData: null
        })), ...artistSuggestions];
      } else if (fieldName === 'musicians') {
        // Para músicos acompanhantes, buscar dos producers dos projetos + artistas
        const projectProducers = getFilteredProducers(searchTerm);
        const artistSuggestions = getFilteredArtists(searchTerm).map(a => ({
          name: a.name || a.full_name,
          projectName: 'Artista cadastrado',
          isArtist: true,
          isCrmContact: false,
          artistData: a
        }));
        return [...projectProducers.map(p => ({
          ...p,
          isArtist: false,
          isCrmContact: false,
          artistData: null
        })), ...artistSuggestions];
      } else {
        // Para produtores fonográficos, buscar de artistas (pessoa física) e contatos CRM (pessoa jurídica/física)
        const artistSuggestions = getFilteredArtists(searchTerm).map(a => ({
          name: a.name || a.full_name,
          projectName: 'Pessoa Física - Artista',
          isArtist: true,
          isCrmContact: false,
          artistData: a
        }));
        const crmSuggestions = getFilteredCrmContacts(searchTerm).map(c => ({
          name: c.company ? `${c.name} (${c.company})` : c.name,
          projectName: c.company ? 'Pessoa Jurídica - CRM' : 'Pessoa Física - CRM',
          isArtist: false,
          isCrmContact: true,
          artistData: null,
          crmData: c
        }));
        return [...artistSuggestions, ...crmSuggestions];
      }
    };
    const getPlaceholder = () => {
      if (fieldName === 'performers') return 'Digite para buscar intérprete...';
      if (fieldName === 'musicians') return 'Digite para buscar músico...';
      return 'Digite para buscar artista ou empresa...';
    };
    const getHeading = () => {
      if (fieldName === 'performers') return 'Intérpretes';
      if (fieldName === 'musicians') return 'Músicos';
      return 'Artistas e Contatos';
    };
    return <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70">
            <span className="font-medium">{title} - Percentual total: {percentage.toFixed(2)}% de {maxPercentage.toFixed(2)}%</span>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          {fields.map((field, index) => {
          const popoverKey = `${fieldName}_${index}`;
          const searchTerm = participantSearchTerms[popoverKey] || '';
          const filteredSuggestions = getFilteredSuggestions(searchTerm);
          const isPopoverOpen = openParticipantPopovers[popoverKey] || false;
          return <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-7">
                  <FormField control={form.control} name={`${fieldName}.${index}.name`} render={({
                field: formField
              }) => <FormItem className="flex flex-col">
                      {index === 0 && <FormLabel>Nome</FormLabel>}
                      <div className="relative">
                        <FormControl>
                          <Input className="pl-3 pr-10 text-left" placeholder={getPlaceholder()} value={formField.value} onChange={e => {
                      formField.onChange(e.target.value);
                      setParticipantSearchTerms(prev => ({
                        ...prev,
                        [popoverKey]: e.target.value
                      }));
                      setOpenParticipantPopovers(prev => ({
                        ...prev,
                        [popoverKey]: true
                      }));
                    }} />
                        </FormControl>
                        <Popover open={isPopoverOpen} onOpenChange={open => {
                    setOpenParticipantPopovers(prev => ({
                      ...prev,
                      [popoverKey]: open
                    }));
                    if (open) {
                      setParticipantSearchTerms(prev => ({
                        ...prev,
                        [popoverKey]: ''
                      }));
                    }
                  }}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-2">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[350px] p-0 z-50 bg-popover" align="end" sideOffset={4}>
                            <Command>
                              <CommandInput placeholder="Buscar..." value={searchTerm} onValueChange={value => {
                          setParticipantSearchTerms(prev => ({
                            ...prev,
                            [popoverKey]: value
                          }));
                        }} />
                              <CommandList>
                                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                                <CommandGroup heading={getHeading()}>
                                  {filteredSuggestions.map((suggestion: any, suggestionIndex) => <CommandItem key={`${suggestion.name}-${suggestionIndex}`} onSelect={() => {
                              if (suggestion.isArtist && suggestion.artistData) {
                                handleSelectArtist(suggestion.artistData, fieldName, index);
                              } else if (suggestion.isCrmContact) {
                                form.setValue(`${fieldName}.${index}.name` as any, suggestion.name);
                                setOpenParticipantPopovers(prev => ({
                                  ...prev,
                                  [popoverKey]: false
                                }));
                                setParticipantSearchTerms(prev => ({
                                  ...prev,
                                  [popoverKey]: ''
                                }));
                              } else {
                                handleSelectProjectParticipant(suggestion, fieldName, index);
                              }
                            }} className="cursor-pointer">
                                      <Check className={cn("mr-2 h-4 w-4", formField.value === suggestion.name ? "opacity-100" : "opacity-0")} />
                                      <div className="flex flex-col">
                                        <span>{suggestion.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {suggestion.projectName}
                                        </span>
                                      </div>
                                    </CommandItem>)}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormItem>} />
                </div>
                <div className="col-span-3">
                  <FormField control={form.control} name={`${fieldName}.${index}.percentage`} render={({
                field
              }) => <FormItem>
                        {index === 0 && <FormLabel>Percentual (%)</FormLabel>}
                        <FormControl>
                          <Input type="number" min={0} max={100} step={0.01} placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                      </FormItem>} />
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2Icon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>;
        })}
        <Button type="button" variant="outline" size="sm" onClick={() => append({
          name: '',
          role: '',
          percentage: 0
        })}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CollapsibleContent>
    </Collapsible>;
  };
  const onError = (errors: any) => {
    console.log('Validation errors:', errors);
    const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => `${field}: ${error?.message || 'Campo inválido'}`).join(', ');
    toast({
      title: "Erro de validação",
      description: errorMessages || "Por favor, preencha todos os campos obrigatórios.",
      variant: "destructive"
    });
  };

  // Filter works to show those with status 'aceita' or 'em_analise' for step 1
  const filteredWorksStep1 = works.filter((work: any) => {
    if (work.status !== 'aceita' && work.status !== 'em_analise' && work.status !== 'pendente') return false;
    const searchLower = workSearchTerm.toLowerCase();
    return work.title?.toLowerCase().includes(searchLower) || work.abramus_code?.toLowerCase().includes(searchLower);
  });

  // Handle work selection in step 1
  const handleStep1WorkSelect = (work: any) => {
    setSelectedWorkState(work);
    handleSelectWork(work);
  };
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Step 1: Work Selection */}
        {currentStep === 1 && <Card className="bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Etapa 1: Vincular Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Selecione uma obra musical registrada para vincular ao fonograma que será criado.
              </p>
              
              {/* Search input */}
              <div className="space-y-4">
                <Input placeholder="Buscar por título ou código ABRAMUS..." value={workSearchTerm} onChange={e => setWorkSearchTerm(e.target.value)} />
                
                {/* Works list */}
                <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="p-2 space-y-2">
                    {filteredWorksStep1.length === 0 ? <p className="text-center text-muted-foreground py-8">
                        Nenhuma obra encontrada. Registre uma obra primeiro.
                      </p> : filteredWorksStep1.map((work: any) => {
                        const statusDisplay = work.status === 'aceita' ? 'Aprovada' : 
                                             work.status === 'em_analise' ? 'Em Análise' : 
                                             work.status === 'pendente' ? 'Pendente' : work.status;
                        return <div key={work.id} className={cn("p-4 border rounded-lg cursor-pointer transition-colors", selectedWork?.id === work.id ? "border-primary bg-primary/10" : "hover:bg-accent/50")} onClick={() => handleStep1WorkSelect(work)}>
                          <div className="flex items-center gap-2">
                            {selectedWork?.id === work.id && <Check className="h-4 w-4 text-primary" />}
                            <div className="flex-1">
                              <div className="font-medium">{work.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {work.abramus_code && `ABRAMUS: ${work.abramus_code}`}
                                {work.genre && ` • ${work.genre}`}
                                {` • ${statusDisplay}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      })}
                  </div>
                </ScrollArea>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="button" onClick={() => setCurrentStep(2)} disabled={!selectedWork}>
                  Próxima Etapa
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* Step 2: Form Data */}
        {currentStep === 2 && <>

            {/* Vincular Obra - now read-only summary */}
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-10">
                    <FormField control={form.control} name="work_title" render={({
                  field
                }) => <FormItem>
                          <FormLabel>Título da Obra Vinculada</FormLabel>
                          <FormControl>
                            <Input placeholder="O título da obra será exibido aqui." {...field} readOnly className="bg-muted/50" />
                          </FormControl>
                        </FormItem>} />
                  </div>
                  <div className="col-span-2">
                    <Button type="button" onClick={() => setWorkSearchOpen(true)} variant="outline" className="w-full gap-2">
                      <Search className="h-4 w-4" />
                      ​Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

        {/* Dados do Fonograma */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados do Fonograma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Códigos e ISRC */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField control={form.control} name="abramus_code" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Cód Abramus</FormLabel>
                      <FormControl>
                        <Input placeholder="Código Abramus" {...field} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="ecad_code" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Cód ECAD</FormLabel>
                      <FormControl>
                        <Input placeholder="Código ECAD" {...field} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="aggregator" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Agregadora</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="onerpm">ONErpm</SelectItem>
                          <SelectItem value="distrokid">DistroKid</SelectItem>
                          <SelectItem value="believe">Believe</SelectItem>
                          <SelectItem value="tunecore">TuneCore</SelectItem>
                          <SelectItem value="cdbaby">CD Baby</SelectItem>
                          <SelectItem value="30por1">30por1</SelectItem>
                          <SelectItem value="outras">Outras</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
              <div className="col-span-4">
                <FormLabel>ISRC</FormLabel>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <FormField control={form.control} name="isrc_country" render={({
                    field
                  }) => <FormControl>
                        <Input placeholder="BR" maxLength={2} {...field} />
                      </FormControl>} />
                  <FormField control={form.control} name="isrc_registrant" render={({
                    field
                  }) => <FormControl>
                        <Input placeholder="XXX" maxLength={3} {...field} />
                      </FormControl>} />
                  <FormField control={form.control} name="isrc_year" render={({
                    field
                  }) => <FormControl>
                        <Input placeholder="00" maxLength={2} {...field} />
                      </FormControl>} />
                  <FormField control={form.control} name="isrc_designation" render={({
                    field
                  }) => <FormControl>
                        <Input placeholder="00000" maxLength={5} {...field} />
                      </FormControl>} />
                </div>
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="is_ai_created" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Criada por IA</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>} />
              </div>
            </div>

            {/* Row 2: Datas, Duração e Instrumental */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField control={form.control} name="emission_date" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Emissão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="recording_date" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Gravação Original</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="release_date" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Lançamento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormLabel>Duração</FormLabel>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <FormField control={form.control} name="duration_minutes" render={({
                    field
                  }) => <FormControl>
                        <div className="relative">
                          <Input type="number" min={0} placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                        </div>
                      </FormControl>} />
                  <FormField control={form.control} name="duration_seconds" render={({
                    field
                  }) => <FormControl>
                        <div className="relative">
                          <Input type="number" min={0} max={59} placeholder="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">seg</span>
                        </div>
                      </FormControl>} />
                </div>
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="is_instrumental" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Instrumental</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="genre" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Gênero Musical</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="SEM GÊNERO MUSICAL" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sem_genero">SEM GÊNERO MUSICAL</SelectItem>
                          <SelectItem value="mpb">MPB</SelectItem>
                          <SelectItem value="rock">Rock</SelectItem>
                          <SelectItem value="pop">Pop</SelectItem>
                          <SelectItem value="sertanejo">Sertanejo</SelectItem>
                          <SelectItem value="funk">Funk</SelectItem>
                          <SelectItem value="trap">Trap</SelectItem>
                          <SelectItem value="eletronica">Eletrônica</SelectItem>
                          <SelectItem value="hip_hop">Hip Hop</SelectItem>
                          <SelectItem value="pagode">Pagode</SelectItem>
                          <SelectItem value="forro">Forró</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
            </div>

            {/* Row 3: Classificação, Mídia, Nacional, Publicação, Países, Status */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField control={form.control} name="classification" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Classificação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="STUDIO" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="studio">STUDIO</SelectItem>
                          <SelectItem value="ao_vivo">AO VIVO</SelectItem>
                          <SelectItem value="remix">REMIX</SelectItem>
                          <SelectItem value="acustico">ACÚSTICO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="media" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Mídia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="TODOS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todos">TODOS</SelectItem>
                          <SelectItem value="digital">DIGITAL</SelectItem>
                          <SelectItem value="fisico">FÍSICO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="is_national" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Nacional</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="simultaneous_publication" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Pub. Simultânea</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="status" render={({
                  field
                }) => <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Em Análise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="em_analise">Em Análise</SelectItem>
                          <SelectItem value="aceita">Aceita</SelectItem>
                          <SelectItem value="recusada">Recusada</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
              <div className="col-span-2">
                <FormField control={form.control} name="origin_country" render={({
                  field
                }) => <FormItem>
                      <FormLabel>País Origem</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="BRAZIL" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brazil">BRAZIL</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                          <SelectItem value="uk">UK</SelectItem>
                          <SelectItem value="portugal">PORTUGAL</SelectItem>
                          <SelectItem value="outro">OUTRO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
            </div>

            {/* Row 4: País Publicação */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField control={form.control} name="publication_country" render={({
                  field
                }) => <FormItem>
                      <FormLabel>País Publicação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="BRAZIL" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brazil">BRAZIL</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                          <SelectItem value="uk">UK</SelectItem>
                          <SelectItem value="portugal">PORTUGAL</SelectItem>
                          <SelectItem value="outro">OUTRO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participação */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Participação</CardTitle>
              <span className="text-sm text-muted-foreground">Percentual total: {totalPercentage.toFixed(2)}% de 100%</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderParticipantSection("Produtor Fonográfico", producerFields, appendProducer, removeProducer, producersOpen, setProducersOpen, 'phonographic_producers', producersPercentage, 41.70)}
            {renderParticipantSection("Intérprete", performerFields, appendPerformer, removePerformer, performersOpen, setPerformersOpen, 'performers', performersPercentage, 41.70)}
            {renderParticipantSection("Músico Acompanhante", musicianFields, appendMusician, removeMusician, musiciansOpen, setMusiciansOpen, 'musicians', musiciansPercentage, 16.60)}
          </CardContent>
        </Card>

        {/* Upload de Áudio */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6 py-[10px]">
            <Collapsible open={audioUploadOpen} onOpenChange={setAudioUploadOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70">
                  <span className="font-medium">
                    Upload de Áudio {audioFile ? `- ${audioFile.name}` : projectAudioInfo ? `- ${projectAudioInfo.name}` : ''}
                  </span>
                  {audioUploadOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-4">
                  <input type="file" ref={audioInputRef} accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  
                  {/* Exibir áudio existente do banco (ao editar) */}
                  {existingAudioUrl && !audioFile && !projectAudioInfo && <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium">Áudio salvo</p>
                          <p className="text-sm text-muted-foreground">
                            Arquivo de áudio já cadastrado
                          </p>
                          <audio controls className="mt-2 h-8">
                            <source src={existingAudioUrl} />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => audioInputRef.current?.click()}>
                          Substituir
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setExistingAudioUrl(null)}>
                          <X className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>}
                  
                  {/* Exibir áudio do projeto se carregado */}
                  {projectAudioInfo && !audioFile && <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{projectAudioInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {projectAudioInfo.size > 0 ? `${(projectAudioInfo.size / (1024 * 1024)).toFixed(2)} MB - ` : ''}Carregado do projeto
                          </p>
                          {projectAudioInfo.url && (
                            <audio controls className="mt-2 h-8">
                              <source src={projectAudioInfo.url} />
                              Seu navegador não suporta o elemento de áudio.
                            </audio>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => audioInputRef.current?.click()}>
                          Substituir
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setProjectAudioInfo(null)}>
                          <X className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>}
                  
                  {/* Upload manual quando não há áudio */}
                  {!audioFile && !projectAudioInfo && !existingAudioUrl && <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => audioInputRef.current?.click()}>
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Clique para fazer upload do arquivo de áudio</p>
                      <p className="text-sm text-muted-foreground mt-1">MP3, WAV, FLAC, etc.</p>
                    </div>}
                  
                  {/* Arquivo de áudio enviado manualmente */}
                  {audioFile && <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{audioFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={removeAudioFile}>
                        <X className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Aceito o Termo */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FormField control={form.control} name="accept_terms" render={({
                field
              }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Aceito o Termo <span className="text-destructive">*</span> -{" "}
                        <Button type="button" variant="link" className="p-0 h-auto text-primary underline" onClick={() => setTermsDialogOpen(true)}>
                          Leia e aceite os Termos de Uso
                        </Button>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>}
          <Button type="submit" disabled={createPhonogram.isPending || updatePhonogram.isPending}>
            {phonogram?.id ? 'Atualizar Fonograma' : 'Cadastrar Fonograma'}
          </Button>
        </div>

        {/* Terms Dialog */}
        <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Termos de Uso</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground">1. Objeto</h3>
                <p>
                  O presente termo estabelece as condições gerais de uso para o registro de fonogramas 
                  na plataforma Lander 360º, incluindo a submissão de arquivos de áudio e metadados 
                  relacionados às gravações sonoras.
                </p>
                
                <h3 className="font-semibold text-foreground">2. Declarações do Usuário</h3>
                <p>
                  Ao registrar um fonograma, o usuário declara que possui todos os direitos necessários 
                  sobre a gravação, incluindo autorizações de intérpretes, músicos e produtores 
                  fonográficos envolvidos na criação do fonograma.
                </p>
                
                <h3 className="font-semibold text-foreground">3. Responsabilidades</h3>
                <p>
                  O usuário é integralmente responsável pela veracidade das informações fornecidas, 
                  incluindo dados de participação, percentuais de direitos e identificadores como ISRC.
                </p>
                
                <h3 className="font-semibold text-foreground">4. Propriedade Intelectual</h3>
                <p>
                  O registro do fonograma na plataforma não transfere quaisquer direitos de propriedade 
                  intelectual. A plataforma atua apenas como intermediária no processo de registro 
                  junto aos órgãos competentes.
                </p>
                
                <h3 className="font-semibold text-foreground">5. Proteção de Dados</h3>
                <p>
                  Os dados fornecidos serão tratados em conformidade com a Lei Geral de Proteção de 
                  Dados (LGPD) e utilizados exclusivamente para fins de registro e gestão de direitos.
                </p>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" onClick={() => {
                form.setValue('accept_terms', true);
                setTermsDialogOpen(false);
                toast({
                  title: "Termos aceitos",
                  description: "Você aceitou os termos de uso."
                });
              }}>
                Li e Aceito os Termos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Work Search Dialog */}
        <Dialog open={workSearchOpen} onOpenChange={setWorkSearchOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pesquisar Obra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Buscar por título ou código ABRAMUS..." value={workSearchTerm} onChange={e => setWorkSearchTerm(e.target.value)} />
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredWorks.length === 0 ? <p className="text-center text-muted-foreground py-4">Nenhuma obra encontrada</p> : filteredWorks.map(work => <div key={work.id} className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleSelectWork(work)}>
                        <div className="font-medium">{work.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {work.abramus_code && `ABRAMUS: ${work.abramus_code}`}
                          {work.genre && ` • ${work.genre}`}
                        </div>
                      </div>)}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
          </>}
      </form>
    </Form>;
}