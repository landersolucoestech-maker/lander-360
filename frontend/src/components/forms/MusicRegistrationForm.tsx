import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PlusIcon, Trash2Icon, Search, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { useCrmContacts } from '@/hooks/useCrm';
import { useSearchMusic, useMusicRegistry, useCreateMusicRegistryEntry, useUpdateMusicRegistryEntry } from '@/hooks/useMusicRegistry';
import { AbramusService, AbramusWork, AbramusParticipant } from '@/services/abramusService';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutoContractService } from '@/services/autoContractService';

const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Classe/Função é obrigatória'),
  link: z.string().optional(),
  contract_start_date: z.string().optional(),
  percentage: z.number().min(0, 'Percentual deve ser maior que 0').max(100, 'Percentual não pode ser maior que 100'),
});

const otherTitleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
});

const connectedReferenceSchema = z.object({
  reference: z.string().min(1, 'Referência é obrigatória'),
  type: z.string().optional(),
});

const aiElementSchema = z.object({
  element_type: z.enum(['harmonia', 'melodia', 'letra']),
  tool_name: z.string().optional(),
  prompt: z.string().optional(),
});

const musicRegistrationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  abramus_code: z.string().optional(),
  ecad_code: z.string().optional(),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  language: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).max(59).optional(),
  is_instrumental: z.boolean().default(false),
  is_ai_created: z.boolean().default(false),
  ai_generation_type: z.enum(['total', 'partial']).optional(),
  ai_elements: z.array(aiElementSchema).optional(),
  participants: z.array(participantSchema).optional(),
  other_titles: z.array(otherTitleSchema).optional(),
  connected_references: z.array(connectedReferenceSchema).optional(),
  isrc: z.string().optional(),
  iswc: z.string().optional(),
  status: z.enum(['em_analise', 'aceita', 'recusada']).default('em_analise'),
  artist_id: z.string().optional(),
  project_id: z.string().optional(),
  duration: z.number().optional(),
  recording_date: z.string().optional(),
  lyrics: z.string().optional(),
  audio_file: z.string().optional(),
  phonogram_report: z.string().optional(),
  composers: z.array(participantSchema).optional(),
  performers: z.array(participantSchema).optional(),
  producers: z.array(participantSchema).optional(),
  has_publisher: z.boolean().default(false),
  publishers: z.array(z.object({
    name: z.string(),
    cpf_cnpj: z.string(),
    percentage: z.number(),
  })).optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'Você precisa aceitar os Termos de Uso para continuar',
  }),
});

type MusicRegistrationFormData = z.infer<typeof musicRegistrationSchema>;

interface MusicRegistrationFormProps {
  registration?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MusicRegistrationForm({ registration, onSuccess, onCancel }: MusicRegistrationFormProps) {
  const { toast } = useToast();
  const { data: projects = [] } = useProjects();
  const { data: artists = [] } = useArtists();
  const { data: crmContacts = [] } = useCrmContacts();
  const { data: existingWorks = [] } = useMusicRegistry();
  const createMusicEntry = useCreateMusicRegistryEntry();
  const updateMusicEntry = useUpdateMusicRegistryEntry();

  // Go directly to step 2 (form) - skip step 1 since flow is: projects -> obras
  const [currentStep, setCurrentStep] = useState<1 | 2>(2);
  const [registrationMode, setRegistrationMode] = useState<'existing' | 'new' | null>('new');

  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [isSearchingParticipant, setIsSearchingParticipant] = useState(false);
  const [participantResults, setParticipantResults] = useState<AbramusParticipant[]>([]);
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);

  const [participationOpen, setParticipationOpen] = useState(true);
  const [otherTitlesOpen, setOtherTitlesOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  const findCpfByName = (name: string): string => {
    // Note: cpf_cnpj is now stored in artist_sensitive_data table (admin only)
    // This function returns empty as CPF data is no longer accessible from artists table
    if (!name || name.trim() === '') return '';
    return '';
  };

  const calculateTotalPercentage = () => {
    const participants = form.watch('participants') || [];
    return participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
  };
  
  // Convert writers/publishers arrays to participants format for editing
  const getParticipantsFromRegistration = () => {
    if (registration?.participants && registration.participants.length > 0) {
      return registration.participants;
    }
    
    const participants: any[] = [];
    
    // Convert writers to participants
    if (registration?.writers && Array.isArray(registration.writers)) {
      registration.writers.forEach((writer: string) => {
        participants.push({
          name: writer,
          role: 'compositor_autor',
          link: '',
          contract_start_date: '',
          percentage: 0,
        });
      });
    }
    
    // Convert publishers to participants (editors)
    if (registration?.publishers && Array.isArray(registration.publishers)) {
      registration.publishers.forEach((publisher: string) => {
        // Avoid duplicates if already added as writer
        if (!participants.some(p => p.name === publisher)) {
          participants.push({
            name: publisher,
            role: 'editor',
            link: '',
            contract_start_date: '',
            percentage: 0,
          });
        }
      });
    }
    
    return participants;
  };

  const form = useForm<MusicRegistrationFormData>({
    resolver: zodResolver(musicRegistrationSchema),
    defaultValues: {
      title: registration?.title || '',
      abramus_code: registration?.abramus_code || '',
      ecad_code: registration?.ecad_code || '',
      genre: registration?.genre || '',
      language: registration?.language || 'portugues',
      duration_minutes: registration?.duration ? Math.floor(registration.duration / 60) : undefined,
      duration_seconds: registration?.duration ? registration.duration % 60 : undefined,
      is_instrumental: registration?.is_instrumental || false,
      is_ai_created: registration?.is_ai_created || false,
      ai_generation_type: registration?.ai_generation_type || undefined,
      ai_elements: registration?.ai_elements || [],
      participants: getParticipantsFromRegistration(),
      other_titles: registration?.other_titles || [],
      connected_references: registration?.connected_references || [],
      isrc: registration?.isrc || '',
      iswc: registration?.iswc || '',
      status: registration?.status === 'Em Análise' || registration?.status === 'pendente' || !registration?.status ? 'em_analise' : 
              registration?.status === 'Aceita' || registration?.status === 'aceita' ? 'aceita' : 
              registration?.status === 'Recusada' || registration?.status === 'recusada' ? 'recusada' : 'em_analise',
      artist_id: registration?.artist_id || '',
      project_id: registration?.project_id || '',
      lyrics: registration?.lyrics || '',
      accept_terms: registration?.id ? true : false,
    },
  });

  const {
    fields: participantFields,
    append: appendParticipant,
    remove: removeParticipant,
    replace: replaceParticipants,
  } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  const {
    fields: otherTitleFields,
    append: appendOtherTitle,
    remove: removeOtherTitle,
  } = useFieldArray({
    control: form.control,
    name: 'other_titles',
  });

  const {
    fields: referenceFields,
    append: appendReference,
    remove: removeReference,
  } = useFieldArray({
    control: form.control,
    name: 'connected_references',
  });

  const {
    fields: aiElementFields,
    append: appendAiElement,
    remove: removeAiElement,
  } = useFieldArray({
    control: form.control,
    name: 'ai_elements',
  });

  const isAiCreated = form.watch('is_ai_created');
  const aiGenerationType = form.watch('ai_generation_type');
  const watchedParticipants = form.watch('participants');

  // Artistas exclusivos da produtora - quando aparecem, Deyvisson Lander é editor
  // Lista expandida com todos os artistas indicados pelo usuário
  const LANDER_RECORDS_EXCLUSIVE_ARTISTS = [
    // Nomes artísticos
    'dj stay',
    'dj md tr3ze',
    'dj md tr3zê',
    'rapha radamá',
    'rapha radama',
    'mc diogo da gv',
    // Nomes reais (full_name)
    'carlos daniel de moura',
    'raphael lopes de souza',            // Rapha Radamá
    'diogo junior pereira',              // MC Diogo da GV
    'david alexandre ferreira aires',    // DJ MD TR3ZE
    'allison batista barbosa militano',  // DJ Stay
    // Deyvisson (editor padrão)
    'deyvisson lander andrade 06204919652',
    'deyvisson lander andrade',
  ];

  // Track if auto contract has been triggered
  const autoContractTriggeredRef = useRef<Set<string>>(new Set());

  // Track if Deyvisson has been added to prevent infinite loops
  const deyvissonAddedRef = useRef(false);

  // Auto-add Deyvisson Lander Andrade as editor when ANY exclusive artist appears
  // Also trigger auto contract creation for exclusive artists
  useEffect(() => {
    if (!watchedParticipants || watchedParticipants.length === 0) {
      deyvissonAddedRef.current = false;
      return;
    }

    // Check if ANY participant is an exclusive artist (any role, not just composers)
    const hasExclusiveArtist = watchedParticipants.some(p => 
      LANDER_RECORDS_EXCLUSIVE_ARTISTS.includes(p.name?.toLowerCase().trim())
    );

    // Check if Deyvisson is already an editor
    const hasLanderEditor = watchedParticipants.some(p => 
      (p.name?.toLowerCase().trim() === 'deyvisson lander andrade 06204919652' || 
       p.name?.toLowerCase().trim() === 'deyvisson lander andrade') && 
      p.role === 'editor'
    );

    // Only add Deyvisson if an exclusive artist is present and editor not already added
    if (hasExclusiveArtist && !hasLanderEditor) {
      deyvissonAddedRef.current = true;
      appendParticipant({
        name: 'Deyvisson Lander Andrade 06204919652',
        role: 'editor',
        link: 'Link 1',
        contract_start_date: '',
        percentage: 10,
      });
      return; // Exit early, the next effect will handle distribution
    }

    if (hasLanderEditor) {
      deyvissonAddedRef.current = true;
    }

    // Check for exclusive artists for auto contract creation
    const composerRoles = ['compositor_autor', 'compositor', 'autor'];
    const landerArtistComposer = watchedParticipants.find(p => 
      composerRoles.includes(p.role?.toLowerCase()) &&
      LANDER_RECORDS_EXCLUSIVE_ARTISTS.includes(p.name?.toLowerCase().trim())
    );

    if (landerArtistComposer) {
      const artistName = landerArtistComposer.name?.trim();
      if (artistName && !autoContractTriggeredRef.current.has(artistName)) {
        autoContractTriggeredRef.current.add(artistName);
        
        const matchedArtist = artists.find(a => 
          a.name?.toLowerCase() === artistName.toLowerCase() ||
          a.stage_name?.toLowerCase() === artistName.toLowerCase() ||
          a.full_name?.toLowerCase() === artistName.toLowerCase()
        );

        if (matchedArtist) {
          console.log(`Artista exclusivo detectado: ${artistName}. Contrato será criado ao salvar a obra.`);
        }
      }
    }
  }, [watchedParticipants, artists, appendParticipant]);

  // Auto-distribute percentages and assign sequential links
  // If Deyvisson is editor: 10% for him, 90% split among others
  // If Deyvisson is NOT editor: 100% split equally among all participants
  useEffect(() => {
    if (!watchedParticipants || watchedParticipants.length === 0) return;

    // Find Deyvisson's index
    const landerEditorIndex = watchedParticipants.findIndex(p => 
      (p.name?.toLowerCase().trim() === 'deyvisson lander andrade 06204919652' || 
       p.name?.toLowerCase().trim() === 'deyvisson lander andrade') && 
      p.role === 'editor'
    );
    
    const hasLanderEditor = landerEditorIndex !== -1;
    
    let updatedParticipants;
    let needsUpdate = false;

    if (hasLanderEditor) {
      // Deyvisson IS editor: 10% for him with Link 1, others split 90%
      const landerParticipant = watchedParticipants[landerEditorIndex];
      const otherParticipants = watchedParticipants.filter((_, idx) => idx !== landerEditorIndex);
      const otherCount = otherParticipants.length;
      
      const expectedLanderPercentage = 10;
      const remainingPercentage = 90;
      const evenPercentage = otherCount > 0 ? Math.floor(remainingPercentage / otherCount) : 0;
      const remainder = otherCount > 0 ? remainingPercentage - (evenPercentage * otherCount) : 0;
      
      // Check if any values are incorrect
      const landerNeedsUpdate = landerParticipant?.percentage !== expectedLanderPercentage || 
                                landerParticipant?.link !== 'Link 1';
      
      const othersNeedUpdate = otherParticipants.some((p, idx) => {
        const expectedPercentage = idx === otherCount - 1 ? evenPercentage + remainder : evenPercentage;
        const expectedLink = `Link ${idx + 2}`;
        return p.percentage !== expectedPercentage || p.link !== expectedLink;
      });
      
      needsUpdate = landerNeedsUpdate || othersNeedUpdate;
      
      if (needsUpdate) {
        let linkCounter = 2;
        let otherIndex = 0;
        
        updatedParticipants = watchedParticipants.map((p, idx) => {
          if (idx === landerEditorIndex) {
            return {
              ...p,
              link: 'Link 1',
              percentage: 10,
            };
          } else {
            const isLast = otherIndex === otherCount - 1;
            const percentage = isLast ? evenPercentage + remainder : evenPercentage;
            const link = `Link ${linkCounter++}`;
            otherIndex++;
            
            return {
              ...p,
              link: link,
              percentage: percentage,
            };
          }
        });
      }
    } else {
      // Deyvisson is NOT editor: distribute 100% equally among all participants
      const totalParticipants = watchedParticipants.length;
      const evenPercentage = Math.floor(100 / totalParticipants);
      const remainder = 100 - (evenPercentage * totalParticipants);
      
      // Check if any values are incorrect
      needsUpdate = watchedParticipants.some((p, idx) => {
        const expectedPercentage = idx === totalParticipants - 1 ? evenPercentage + remainder : evenPercentage;
        const expectedLink = `Link ${idx + 1}`;
        return p.percentage !== expectedPercentage || p.link !== expectedLink;
      });
      
      if (needsUpdate) {
        updatedParticipants = watchedParticipants.map((p, idx) => {
          const isLast = idx === totalParticipants - 1;
          const percentage = isLast ? evenPercentage + remainder : evenPercentage;
          const link = `Link ${idx + 1}`;
          
          return {
            ...p,
            link: link,
            percentage: percentage,
          };
        });
      }
    }

    if (needsUpdate && updatedParticipants) {
      replaceParticipants(updatedParticipants);
    }
  }, [watchedParticipants, replaceParticipants]);

  // Reset AI fields when is_ai_created becomes false
  useEffect(() => {
    if (!isAiCreated) {
      form.setValue('ai_generation_type', undefined);
      form.setValue('ai_elements', []);
    }
  }, [isAiCreated, form]);

  // Initialize AI elements when ai_generation_type is selected
  useEffect(() => {
    if (isAiCreated && aiGenerationType) {
      const currentElements = form.getValues('ai_elements') || [];
      if (currentElements.length === 0) {
        form.setValue('ai_elements', [
          { element_type: 'harmonia', tool_name: '', prompt: '' },
          { element_type: 'melodia', tool_name: '', prompt: '' },
          { element_type: 'letra', tool_name: '', prompt: '' },
        ]);
      }
    }
  }, [isAiCreated, aiGenerationType, form]);

  // Filter only completed projects for dropdown
  const completedProjects = React.useMemo(() => {
    return projects.filter(project => project.status === 'completed');
  }, [projects]);

  // Build list of available works from completed projects only
  const availableWorks = React.useMemo(() => {
    const works: any[] = [];
    
    // Add works from completed projects audio_files
    completedProjects.forEach(project => {
      let audioFilesData = project.audio_files as any;
      
      // Handle if audio_files is a string (JSON stringified)
      if (typeof audioFilesData === 'string') {
        try {
          audioFilesData = JSON.parse(audioFilesData);
        } catch (e) {
          console.error('Error parsing audio_files:', e);
          return;
        }
      }
      
      // Handle structure: { release_type, songs: [...], observations }
      const songs = audioFilesData?.songs || [];
      
      if (Array.isArray(songs)) {
        songs.forEach((song: any, index: number) => {
          const songName = song.song_name || song.title || '';
          if (songName) {
            works.push({
              id: `${project.id}-${index}`,
              title: songName,
              genre: song.genre || '',
              isrc: song.isrc || '',
              iswc: song.iswc || '',
              language: song.language || 'portugues',
              duration: song.duration_minutes !== undefined || song.duration_seconds !== undefined
                ? ((song.duration_minutes || 0) * 60) + (song.duration_seconds || 0)
                : null,
              duration_minutes: song.duration_minutes || 0,
              duration_seconds: song.duration_seconds || 0,
              lyrics: song.lyrics || '',
              composers: song.composers || [],
              performers: song.performers || [],
              producers: song.producers || [],
              is_instrumental: song.instrumental === 'sim' || song.is_instrumental || false,
              instrumental: song.instrumental,
              recording_date: song.recording_date || '',
              audio_url: song.audio_files?.[0]?.url || song.audio_url || '',
              audio_file: song.audio_files?.[0]?.url || song.audio_file || '',
              collaboration_type: song.collaboration_type || '',
              observations: song.observations || '',
              project_id: project.id,
              project_name: project.name,
              artist_id: project.artist_id,
              source: 'project',
              label: `${songName} - ${project.name}`
            });
          }
        });
      }
    });
    
    return works;
  }, [projects]);

  // Initialize selectedWork when editing an existing registration
  useEffect(() => {
    if (registration && availableWorks.length > 0 && !isInitialized) {
      // Try to find matching work by title
      const matchingWork = availableWorks.find(w => 
        w.title?.toLowerCase().trim() === registration.title?.toLowerCase().trim()
      );
      
      if (matchingWork) {
        setSelectedWork(matchingWork);
      }
      setIsInitialized(true);
    }
  }, [registration, availableWorks, isInitialized]);

  // Select work from search results
  const handleSelectWork = (work: any) => {
    if (work.source === 'local') {
      form.setValue('title', work.title || '');
      form.setValue('genre', work.genre || '');
      form.setValue('isrc', work.isrc || '');
      form.setValue('iswc', work.iswc || '');
      if (work.duration) {
        form.setValue('duration_minutes', Math.floor(work.duration / 60));
        form.setValue('duration_seconds', work.duration % 60);
      }
    } else if (work.source === 'project') {
      // Populate all available fields from project song data
      form.setValue('title', work.title || '');
      form.setValue('genre', work.genre || '');
      form.setValue('isrc', work.isrc || '');
      form.setValue('iswc', work.iswc || '');
      form.setValue('is_instrumental', work.is_instrumental || work.instrumental === 'sim' || false);
      form.setValue('lyrics', work.lyrics || '');
      form.setValue('project_id', work.project_id || '');
      form.setValue('artist_id', work.artist_id || '');
      form.setValue('language', work.language || 'portugues');
      
      if (work.duration) {
        form.setValue('duration_minutes', Math.floor(work.duration / 60));
        form.setValue('duration_seconds', work.duration % 60);
      } else if (work.duration_minutes !== undefined || work.duration_seconds !== undefined) {
        form.setValue('duration_minutes', work.duration_minutes || 0);
        form.setValue('duration_seconds', work.duration_seconds || 0);
      }
      
      // Add composers/authors and other participants to participants grid
      const participants: any[] = [];
      if (work.composers && Array.isArray(work.composers)) {
        const validComposers = work.composers.filter((c: any) => {
          const name = typeof c === 'string' ? c : c?.name;
          return name && name.trim() !== '';
        });
        const composerCount = validComposers.length;
        const defaultPercentage = composerCount > 0 ? Math.floor(100 / composerCount) : 0;
        
        validComposers.forEach((c: any, index: number) => {
          const name = typeof c === 'string' ? c : c?.name || '';
          let percentage = typeof c === 'object' ? (c.percentage || 0) : 0;
          if (percentage === 0 && composerCount > 0) {
            percentage = index === composerCount - 1 
              ? 100 - (defaultPercentage * (composerCount - 1))
              : defaultPercentage;
          }
          
          participants.push({
            name: name,
            role: 'compositor_autor',
            link: typeof c === 'object' ? (c.link || '') : '',
            contract_start_date: typeof c === 'object' ? (c.contract_start_date || '') : '',
            percentage: percentage,
          });
        });
      }

      // Garantir que artistas exclusivos presentes como intérpretes
      // também entrem no grid (como Compositor/Autor) para disparar o editor automático
      // Nota: Produtores NÃO devem ser adicionados ao grid de obras
      const existingNames = new Set(
        participants
          .map(p => p.name?.toLowerCase().trim())
          .filter((n: string | undefined): n is string => !!n)
      );

      // Apenas performers (intérpretes) são verificados para artistas exclusivos
      const performersList = (work as any).performers;
      if (Array.isArray(performersList)) {
        performersList.forEach((p: any) => {
          const name = typeof p === 'string' ? p : p?.name || '';
          const normalized = name.toLowerCase().trim();
          if (
            normalized &&
            !existingNames.has(normalized) &&
            LANDER_RECORDS_EXCLUSIVE_ARTISTS.includes(normalized)
          ) {
            participants.push({
              name,
              role: 'compositor_autor',
              link: typeof p === 'object' ? (p.link || '') : '',
              contract_start_date: typeof p === 'object' ? (p.contract_start_date || '') : '',
              percentage: typeof p === 'object' ? (p.percentage || 0) : 0,
            });
            existingNames.add(normalized);
          }
        });
      }

      if (participants.length > 0) {
        replaceParticipants(participants);
      }
    } else if (work.source === 'abramus') {
      form.setValue('title', work.titulo || '');
      form.setValue('abramus_code', work.codigo_abramus || '');
      form.setValue('ecad_code', work.codigo_ecad || '');
      form.setValue('genre', work.genero || '');
      form.setValue('language', work.idioma || 'portugues');
      form.setValue('is_instrumental', work.instrumental || false);
      
      // Add only composers/authors from ABRAMUS
      if (work.participantes && work.participantes.length > 0) {
        const composerRoles = ['compositor', 'autor'];
        const formattedParticipants = work.participantes
          .filter((p: any) => composerRoles.includes(p.funcao?.toLowerCase()) || p.funcao?.toLowerCase() === 'tradutor')
          .map((p: any) => ({
            name: p.nome,
            role: p.funcao?.toLowerCase() === 'tradutor' ? 'tradutor' : 'compositor_autor',
            link: '',
            contract_start_date: '',
            percentage: p.percentual || 0,
          }));
        replaceParticipants(formattedParticipants);
      }
    }

    setSelectedWork(work);
    setWorkDropdownOpen(false);
    
    toast({
      title: "Obra selecionada",
      description: `Dados da obra "${work.title || work.titulo}" foram preenchidos.`,
    });
  };

  // Search participants in ABRAMUS
  const handleSearchParticipant = async () => {
    if (!participantSearchQuery.trim()) {
      toast({
        title: "Busca vazia",
        description: "Digite o nome ou CPF do participante",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingParticipant(true);
    setParticipantResults([]);

    try {
      // Search in local artists first (cpf_cnpj is now in artist_sensitive_data table - admin only)
      const localArtists = artists.filter(a => 
        a.name?.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
        a.full_name?.toLowerCase().includes(participantSearchQuery.toLowerCase())
      ).map(a => ({
        nome: a.full_name || a.name,
        cpf: '', // CPF now in artist_sensitive_data table (admin only)
        codigo_abramus: '',
        funcoes: ['compositor'],
        obras_registradas: 0,
        source: 'local'
      }));

      // Search ABRAMUS
      const abramusResponse = await AbramusService.searchParticipants(participantSearchQuery);
      const abramusParticipants = abramusResponse.data.map(p => ({ ...p, source: 'abramus' }));

      const combinedResults = [...localArtists, ...abramusParticipants] as any[];
      setParticipantResults(combinedResults);

      if (combinedResults.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: "Nenhum participante encontrado.",
        });
      }
    } catch (error) {
      console.error('Participant search error:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar participantes.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingParticipant(false);
    }
  };

  // Add participant from search
  const handleAddParticipantFromSearch = (participant: any) => {
    appendParticipant({
      name: participant.nome,
      role: participant.funcoes?.[0] || 'compositor',
      link: '',
      contract_start_date: '',
      percentage: 0,
    });
    setShowParticipantDialog(false);
    setParticipantSearchQuery('');
    setParticipantResults([]);
    
    toast({
      title: "Participante adicionado",
      description: `${participant.nome} foi adicionado à lista.`,
    });
  };

  const onSubmit = async (data: MusicRegistrationFormData) => {
    try {
      const totalDuration = ((data.duration_minutes || 0) * 60) + (data.duration_seconds || 0);
      const totalPercentage = (data.participants || []).reduce((sum, p) => sum + p.percentage, 0);
      
      if (data.participants && data.participants.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
        toast({
          title: "Erro de validação",
          description: "A soma das porcentagens dos participantes deve ser 100%",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for database - extract participant names for writers/publishers columns
      const writers = data.participants?.filter(p => 
        ['compositor_autor', 'autor', 'compositor', 'tradutor', 'adaptador', 'versionista'].includes(p.role)
      ).map(p => p.name) || [];
      
      const publishers = data.participants?.filter(p => 
        ['editor', 'sub_editor'].includes(p.role)
      ).map(p => p.name) || [];

      const musicData = {
        title: data.title,
        genre: data.genre,
        isrc: data.isrc || null,
        iswc: data.iswc || null,
        duration: totalDuration > 0 ? totalDuration : null,
        artist_id: data.artist_id || null,
        writers: writers.length > 0 ? writers : null,
        publishers: publishers.length > 0 ? publishers : null,
        status: data.status || 'pendente',
        abramus_code: data.abramus_code || null,
        ecad_code: data.ecad_code || null,
        participants: data.participants || [],
      };

      if (registration?.id) {
        // Update existing entry
        await updateMusicEntry.mutateAsync({ id: registration.id, data: musicData });
      } else {
        // Create new entry
        await createMusicEntry.mutateAsync(musicData);
        
        // Check for exclusive artists and create auto edition contract with real percentage
        const composerRoles = ['compositor_autor', 'compositor', 'autor'];
        const exclusiveArtistComposer = data.participants?.find(p => 
          composerRoles.includes(p.role?.toLowerCase()) &&
          LANDER_RECORDS_EXCLUSIVE_ARTISTS.includes(p.name?.toLowerCase().trim())
        );
        
        if (exclusiveArtistComposer) {
          // Find Lander Records editor to get the real percentage
          const landerEditor = data.participants?.find(p => 
            p.name?.toLowerCase().trim() === 'lander records' && p.role === 'editor'
          );
          
          const landerPercentage = landerEditor?.percentage || 0;
          
          // Find artist in database
          const matchedArtist = artists.find(a => 
            a.name?.toLowerCase() === exclusiveArtistComposer.name?.toLowerCase().trim() ||
            a.stage_name?.toLowerCase() === exclusiveArtistComposer.name?.toLowerCase().trim() ||
            a.full_name?.toLowerCase() === exclusiveArtistComposer.name?.toLowerCase().trim()
          );
          
          if (matchedArtist) {
            const contractId = await AutoContractService.createEditionContract({
              artist_id: matchedArtist.id,
              artist_name: matchedArtist.name,
              music_title: data.title,
              participant_percentage: landerPercentage
            });
            
            if (contractId) {
              toast({
                title: "Contrato de Edição Criado",
                description: `Contrato automático criado para ${matchedArtist.name} com ${landerPercentage}% de participação.`,
              });
            }
          }
        }
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving music:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar música. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const totalPercentage = calculateTotalPercentage();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Step 1: Mode Selection */}
        {currentStep === 1 && (
          <Card className="bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Etapa 1: Selecione o Tipo de Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Option: Select from existing project */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <RadioGroup
                    value={registrationMode || ''}
                    onValueChange={(value) => setRegistrationMode(value as 'existing' | 'new')}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setRegistrationMode('existing')}>
                      <RadioGroupItem value="existing" id="existing" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="existing" className="text-base font-medium cursor-pointer">
                          Buscar Obra Existente (Projeto Concluído)
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Selecione uma obra já cadastrada em um projeto concluído para preencher automaticamente os dados
                        </p>
                        {registrationMode === 'existing' && (
                          <div className="mt-4">
                            <Popover open={workDropdownOpen} onOpenChange={setWorkDropdownOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={workDropdownOpen}
                                  className="w-full justify-between"
                                >
                                  {selectedWork ? selectedWork.title : "Selecione uma obra existente..."}
                                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0 min-w-[var(--radix-popover-trigger-width)]" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar obra..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhuma obra encontrada.</CommandEmpty>
                                    <CommandGroup heading="Obras Disponíveis">
                                      {availableWorks.map((work) => (
                                        <CommandItem
                                          key={work.id}
                                          value={work.label}
                                          onSelect={() => {
                                            handleSelectWork(work);
                                            setWorkDropdownOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedWork?.id === work.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span>{work.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {work.genre ? `${work.genre} • ` : ''}{work.project_name}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {availableWorks.length === 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Nenhuma obra cadastrada em projetos concluídos.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setRegistrationMode('new')}>
                      <RadioGroupItem value="new" id="new" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="new" className="text-base font-medium cursor-pointer">
                          Criar Nova Obra
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Preencha manualmente todos os dados para registrar uma nova obra musical
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep(2)}
                  disabled={registrationMode === 'existing' && !selectedWork}
                >
                  Próxima Etapa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Data */}
        {currentStep === 2 && (
          <>
        {/* Seleção de Projeto Concluído */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Vincular a Projeto Concluído
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Popover open={projectDropdownOpen} onOpenChange={setProjectDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={projectDropdownOpen}
                    className="w-full justify-between"
                  >
                    {selectedProject
                      ? `${selectedProject.name}${selectedProject.description ? ` - ${selectedProject.description}` : ''}`
                      : "Selecione um projeto concluído..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar projeto..." />
                    <CommandList>
                      <CommandEmpty>
                        {completedProjects.length === 0 
                          ? "Nenhum projeto concluído encontrado. Complete um projeto primeiro."
                          : "Nenhum projeto encontrado."}
                      </CommandEmpty>
                      <CommandGroup heading="Projetos Concluídos">
                        {completedProjects.map((project) => {
                          const artistData = artists.find(a => a.id === project.artist_id);
                          const artistName = artistData?.name || artistData?.name || '';
                          return (
                            <CommandItem
                              key={project.id}
                              value={project.name}
                              onSelect={() => {
                                setSelectedProject(project);

                                // Parse audio_files do projeto
                                let audioFilesData = project.audio_files as any;
                                if (typeof audioFilesData === 'string') {
                                  try {
                                    audioFilesData = JSON.parse(audioFilesData);
                                  } catch (e) {
                                    audioFilesData = null;
                                  }
                                }

                                const songs = audioFilesData?.songs || [];

                                if (songs.length > 0) {
                                  const firstSong = songs[0];

                                  const workFromProject = {
                                    source: 'project',
                                    title: firstSong.song_name || firstSong.title || '',
                                    genre: firstSong.genre || '',
                                    isrc: firstSong.isrc || '',
                                    iswc: firstSong.iswc || '',
                                    language: firstSong.language || 'portugues',
                                    duration: (firstSong.duration_minutes || 0) * 60 + (firstSong.duration_seconds || 0),
                                    duration_minutes: firstSong.duration_minutes || 0,
                                    duration_seconds: firstSong.duration_seconds || 0,
                                    lyrics: firstSong.lyrics || '',
                                    is_instrumental: firstSong.instrumental === 'sim' || firstSong.is_instrumental || false,
                                    recording_date: firstSong.recording_date || '',
                                    audio_url: firstSong.audio_files?.[0]?.url || firstSong.audio_url || '',
                                    audio_file: firstSong.audio_files?.[0]?.url || firstSong.audio_file || '',
                                    composers: firstSong.composers || [],
                                    performers: firstSong.performers || [],
                                    producers: firstSong.producers || [],
                                    project_id: project.id,
                                    project_name: project.name,
                                    artist_id: project.artist_id,
                                  };

                                  // Reutiliza toda a lógica central de preenchimento (inclui grid de participantes)
                                  handleSelectWork(workFromProject);
                                } else {
                                  // Fallback mínimo caso o projeto não tenha songs estruturadas
                                  form.setValue('project_id', project.id);
                                  form.setValue('artist_id', project.artist_id || '');
                                }

                                setProjectDropdownOpen(false);
                                toast({
                                  title: "Projeto selecionado",
                                  description: `Dados do projeto "${project.name}" carregados.`,
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedProject?.id === project.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{project.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {artistName && `${artistName} • `}
                                  {project.description || 'Sem descrição'}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {selectedProject && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm">
                    <strong>Projeto:</strong> {selectedProject.name}
                    {selectedProject.description && ` - ${selectedProject.description}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados Principais da Obra */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados Principais da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Cód Abramus, Cód ECAD, Título da Obra, Situação */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="abramus_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód Abramus</FormLabel>
                      <FormControl>
                        <Input placeholder="Código Abramus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="ecad_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód ECAD</FormLabel>
                      <FormControl>
                        <Input placeholder="Código ECAD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Obra *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite para buscar ou criar nova obra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="em_analise">Em Análise</SelectItem>
                          <SelectItem value="aceita">Aceita</SelectItem>
                          <SelectItem value="recusada">Recusada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 2: Gênero Musical, Idioma, Duração, Instrumental?, Criada por IA? */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero Musical</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Português" />
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
                          <SelectItem value="instrumental">Instrumental</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração</FormLabel>
                      <div className="flex items-center gap-1">
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="Mi" 
                            className="w-14"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <span className="text-muted-foreground">:</span>
                        <Input 
                          type="number" 
                          min="0"
                          max="59"
                          placeholder="Se" 
                          className="w-14"
                          value={form.watch('duration_seconds') ?? ''}
                          onChange={(e) => form.setValue('duration_seconds', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="is_instrumental"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrumental?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                          className="flex items-center gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="instrumental-sim" />
                            <Label htmlFor="instrumental-sim" className="text-sm">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="instrumental-nao" />
                            <Label htmlFor="instrumental-nao" className="text-sm">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="is_ai_created"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criada por IA?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                          className="flex items-center gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="ai-sim" />
                            <Label htmlFor="ai-sim" className="text-sm">Sim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="ai-nao" />
                            <Label htmlFor="ai-nao" className="text-sm">Não</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de IA Generativa - exibida quando is_ai_created é true */}
            {isAiCreated && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-4">
                <h3 className="text-base font-semibold">Criado por IA Generativa</h3>
                
                <FormField
                  control={form.control}
                  name="ai_generation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="total" id="ai-total" />
                            <Label htmlFor="ai-total" className="text-sm">
                              A obra foi totalmente gerada pela inteligência artificial generativa.
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="ai-partial" />
                            <Label htmlFor="ai-partial" className="text-sm">
                              A obra foi parcialmente gerada pela inteligência artificial generativa.
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {aiGenerationType && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Elementos da obra musical criados por inteligência artificial generativa:
                  </p>

                  {/* HARMONIA */}
                  <div className="space-y-2">
                    <Label className="font-semibold">HARMONIA:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`ai_elements.0.tool_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Ferramenta</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da ferramenta" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ai_elements.0.prompt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Prompt</FormLabel>
                            <FormControl>
                              <Input placeholder="Prompt utilizado" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentElements = form.getValues('ai_elements') || [];
                          if (currentElements[0]) {
                            currentElements[0] = { element_type: 'harmonia', tool_name: '', prompt: '' };
                            form.setValue('ai_elements', currentElements);
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* MELODIA */}
                  <div className="space-y-2">
                    <Label className="font-semibold">MELODIA:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`ai_elements.1.tool_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Ferramenta</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da ferramenta" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ai_elements.1.prompt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Prompt</FormLabel>
                            <FormControl>
                              <Input placeholder="Prompt utilizado" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentElements = form.getValues('ai_elements') || [];
                          if (currentElements[1]) {
                            currentElements[1] = { element_type: 'melodia', tool_name: '', prompt: '' };
                            form.setValue('ai_elements', currentElements);
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* LETRA */}
                  <div className="space-y-2">
                    <Label className="font-semibold">LETRA:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`ai_elements.2.tool_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Ferramenta</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da ferramenta" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ai_elements.2.prompt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Prompt</FormLabel>
                            <FormControl>
                              <Input placeholder="Prompt utilizado" {...field} value={field.value || ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentElements = form.getValues('ai_elements') || [];
                          if (currentElements[2]) {
                            currentElements[2] = { element_type: 'letra', tool_name: '', prompt: '' };
                            form.setValue('ai_elements', currentElements);
                          }
                        }}
                      >
                        <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participação */}
        <Card className="bg-card">
          <Collapsible open={participationOpen} onOpenChange={setParticipationOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">Participação</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Percentual total: {Math.min(totalPercentage, 100).toFixed(2)}% de 100%
                  </span>
                </div>
                {participationOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowParticipantDialog(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar participante
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => appendParticipant({ name: '', role: '', link: '', contract_start_date: '', percentage: 0 })}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Adicionar participante
                  </Button>
                </div>

{participantFields.length > 0 && (
                  <div className="space-y-3">
                    {/* Sort participants: editors first, then others */}
                    {participantFields
                      .map((field, index) => ({ field, index }))
                      .sort((a, b) => {
                        const aIsEditor = form.watch(`participants.${a.index}.role`) === 'editor';
                        const bIsEditor = form.watch(`participants.${b.index}.role`) === 'editor';
                        if (aIsEditor && !bIsEditor) return -1;
                        if (!aIsEditor && bIsEditor) return 1;
                        return 0;
                      })
                      .map(({ field, index }) => {
                      const isEditor = form.watch(`participants.${index}.role`) === 'editor';
                      return (
                        <div key={field.id} className={`grid grid-cols-1 gap-3 p-4 border rounded-lg items-end ${isEditor ? 'md:grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr_auto]' : 'md:grid-cols-[2fr_1.5fr_1.5fr_0.8fr_auto]'}`}>
                          <FormField
                            control={form.control}
                            name={`participants.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome do participante" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`participants.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Classe/Função *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="compositor_autor">Compositor/Autor</SelectItem>
                                    <SelectItem value="tradutor">Tradutor</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`participants.${index}.link`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link</FormLabel>
                                <FormControl>
                                  <Input placeholder="URL ou link" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {isEditor && (
                            <FormField
                              control={form.control}
                              name={`participants.${index}.contract_start_date`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Início Contrato</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field} 
                                      value={field.value || ''} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={form.control}
                            name={`participants.${index}.percentage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>% Part. *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="0" 
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => removeParticipant(index)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Outros Títulos */}
        <Card className="bg-card">
          <Collapsible open={otherTitlesOpen} onOpenChange={setOtherTitlesOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-lg">Outros Títulos</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendOtherTitle({ title: '' });
                      setOtherTitlesOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  {otherTitlesOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {otherTitleFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`other_titles.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Título Alternativo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o título alternativo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOtherTitle(index)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {otherTitleFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum título alternativo adicionado.
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Referência Conexa */}
        <Card className="bg-card">
          <Collapsible open={referencesOpen} onOpenChange={setReferencesOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-lg">Referência Conexa</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      appendReference({ reference: '', type: '' });
                      setReferencesOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                  {referencesOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                {referenceFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`connected_references.${index}.reference`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Referência</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a referência conexa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 items-end">
                      <FormField
                        control={form.control}
                        name={`connected_references.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sample">Sample</SelectItem>
                                <SelectItem value="remix">Remix</SelectItem>
                                <SelectItem value="versao">Versão</SelectItem>
                                <SelectItem value="adaptacao">Adaptação</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeReference(index)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {referenceFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma referência conexa adicionada.
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Letra da Música */}
        <Card className="bg-card">
          <Collapsible open={lyricsOpen} onOpenChange={setLyricsOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-lg">
                  Letra da Música
                </CardTitle>
                {lyricsOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <FormField
                  control={form.control}
                  name="lyrics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Letra Completa</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite a letra completa da música aqui..."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Termos de Uso */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="accept_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Aceito o Termo - {' '}
                      <Button 
                        type="button"
                        variant="link" 
                        className="p-0 h-auto text-primary underline"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        Leia e aceite os Termos de Uso
                      </Button>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            {registration ? 'Atualizar Obra' : 'Cadastrar Nova Obra'}
          </Button>
        </div>

        {/* Participant Search Dialog */}
        <Dialog open={showParticipantDialog} onOpenChange={setShowParticipantDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Buscar Participante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome ou CPF do participante"
                  value={participantSearchQuery}
                  onChange={(e) => setParticipantSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchParticipant())}
                />
                <Button 
                  type="button" 
                  onClick={handleSearchParticipant}
                  disabled={isSearchingParticipant}
                >
                  {isSearchingParticipant ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {participantResults.length > 0 && (
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {participantResults.map((participant, index) => (
                      <div 
                        key={index}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleAddParticipantFromSearch(participant)}
                      >
                        <p className="font-medium">{participant.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          CPF: {participant.cpf} • {(participant as any).source === 'local' ? 'Base Local' : 'ABRAMUS'}
                        </p>
                        {participant.funcoes && (
                          <p className="text-xs text-muted-foreground">
                            Funções: {participant.funcoes.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {participantResults.length === 0 && participantSearchQuery && !isSearchingParticipant && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum participante encontrado. Você pode adicionar manualmente.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Terms of Use Dialog */}
        <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Termos de Uso - Cadastro de Obras Musicais</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-base">1. DEFINIÇÕES</h3>
                <p>
                  Para os fins deste Termo de Uso, as seguintes definições se aplicam:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Obra Musical:</strong> Composição musical original, incluindo letra (se houver), melodia e arranjo.</li>
                  <li><strong>Titular:</strong> Pessoa física ou jurídica detentora dos direitos autorais sobre a obra musical.</li>
                  <li><strong>Participante:</strong> Compositor, autor, intérprete, produtor ou qualquer pessoa que tenha contribuído para a criação da obra.</li>
                </ul>

                <h3 className="font-semibold text-base">2. DECLARAÇÃO DE TITULARIDADE</h3>
                <p>
                  Ao cadastrar uma obra musical neste sistema, o usuário declara que:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>É o legítimo titular ou representante autorizado dos direitos autorais da obra cadastrada;</li>
                  <li>Possui autorização expressa de todos os coautores, quando aplicável;</li>
                  <li>As informações fornecidas são verdadeiras e completas;</li>
                  <li>A obra não viola direitos de terceiros.</li>
                </ul>

                <h3 className="font-semibold text-base">3. RESPONSABILIDADES</h3>
                <p>
                  O usuário se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manter atualizados os dados cadastrais da obra e dos participantes;</li>
                  <li>Garantir a veracidade das informações sobre percentuais de participação;</li>
                  <li>Informar imediatamente qualquer alteração nos direitos autorais da obra;</li>
                  <li>Arcar com todas as consequências legais decorrentes de informações falsas ou incompletas.</li>
                </ul>

                <h3 className="font-semibold text-base">4. DIREITOS AUTORAIS</h3>
                <p>
                  O cadastro da obra neste sistema não implica em cessão ou transferência de direitos autorais. 
                  Todos os direitos permanecem com seus respectivos titulares. O sistema serve apenas como 
                  ferramenta de gestão e organização das informações das obras musicais.
                </p>

                <h3 className="font-semibold text-base">5. PROTEÇÃO DE DADOS</h3>
                <p>
                  Os dados pessoais dos titulares e participantes serão tratados conforme a Lei Geral de 
                  Proteção de Dados (LGPD - Lei nº 13.709/2018), sendo utilizados exclusivamente para 
                  fins de gestão das obras musicais e comunicações pertinentes.
                </p>

                <h3 className="font-semibold text-base">6. DISPOSIÇÕES GERAIS</h3>
                <p>
                  Este termo poderá ser atualizado a qualquer momento, sendo responsabilidade do usuário 
                  manter-se informado sobre eventuais alterações. A continuidade do uso do sistema após 
                  alterações implica em aceitação das novas condições.
                </p>

                <p className="text-muted-foreground italic mt-6">
                  Última atualização: Dezembro de 2024
                </p>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowTermsDialog(false)}
              >
                Fechar
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  form.setValue('accept_terms', true);
                  setShowTermsDialog(false);
                }}
              >
                Li e Aceito os Termos
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </>
        )}
      </form>
    </Form>
  );
}
