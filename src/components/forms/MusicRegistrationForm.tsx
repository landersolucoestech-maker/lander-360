import React, { useEffect, useState } from 'react';
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
import { PlusIcon, Trash2Icon, Search, ChevronDown, ChevronUp, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { useCrmContacts } from '@/hooks/useCrm';
import { useSearchMusic, useMusicRegistry } from '@/hooks/useMusicRegistry';
import { AbramusService, AbramusWork, AbramusParticipant } from '@/services/abramusService';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  percentage: z.number().min(0, 'Percentual deve ser maior que 0').max(100, 'Percentual não pode ser maior que 100'),
  role: z.string().optional(),
});

const otherTitleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
});

const connectedReferenceSchema = z.object({
  reference: z.string().min(1, 'Referência é obrigatória'),
  type: z.string().optional(),
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
  participants: z.array(participantSchema).optional(),
  other_titles: z.array(otherTitleSchema).optional(),
  connected_references: z.array(connectedReferenceSchema).optional(),
  isrc: z.string().optional(),
  iswc: z.string().optional(),
  status: z.enum(['pending', 'registered', 'approved', 'rejected']).default('pending'),
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

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
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
    if (!name || name.trim() === '') return '';
    const normalizedName = name.trim().toLowerCase();
    const artist = artists.find(a => 
      a.name?.toLowerCase() === normalizedName ||
      a.stage_name?.toLowerCase() === normalizedName ||
      a.full_name?.toLowerCase() === normalizedName
    );
    if (artist?.cpf_cnpj) return artist.cpf_cnpj;
    return '';
  };

  const calculateTotalPercentage = () => {
    const participants = form.watch('participants') || [];
    return participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
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
      participants: registration?.participants || [],
      other_titles: registration?.other_titles || [],
      connected_references: registration?.connected_references || [],
      isrc: registration?.isrc || '',
      iswc: registration?.iswc || '',
      status: registration?.status || 'pending',
      artist_id: registration?.artist_id || '',
      project_id: registration?.project_id || '',
      lyrics: registration?.lyrics || '',
      accept_terms: false,
    },
  });

  const {
    fields: participantFields,
    append: appendParticipant,
    remove: removeParticipant,
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

  // Search existing works (local DB + ABRAMUS)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Busca vazia",
        description: "Digite um título, gênero ou código para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setShowSearchResults(true);

    try {
      // Search local database
      const localResults = existingWorks.filter(work => 
        work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.isrc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.iswc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(work => ({ ...work, source: 'local' }));

      // Search ABRAMUS
      const abramusResponse = await AbramusService.searchWorks(searchQuery);
      const abramusResults = abramusResponse.data.map(work => ({ ...work, source: 'abramus' }));

      const combinedResults = [...localResults, ...abramusResults];
      setSearchResults(combinedResults);

      if (combinedResults.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: "Nenhuma obra encontrada. Você pode criar uma nova.",
        });
      } else {
        toast({
          title: "Busca concluída",
          description: `${combinedResults.length} obra(s) encontrada(s)`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar obras. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

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
    } else if (work.source === 'abramus') {
      form.setValue('title', work.titulo || '');
      form.setValue('abramus_code', work.codigo_abramus || '');
      form.setValue('ecad_code', work.codigo_ecad || '');
      form.setValue('genre', work.genero || '');
      form.setValue('language', work.idioma || 'portugues');
      form.setValue('is_instrumental', work.instrumental || false);
      
      // Add participants from ABRAMUS
      if (work.participantes && work.participantes.length > 0) {
        const formattedParticipants = work.participantes.map((p: any) => ({
          name: p.nome,
          cpf: p.cpf,
          role: p.funcao,
          percentage: p.percentual,
        }));
        form.setValue('participants', formattedParticipants);
      }
    }

    setShowSearchResults(false);
    setSearchQuery('');
    
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
      // Search in local artists first
      const localArtists = artists.filter(a => 
        a.name?.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
        a.full_name?.toLowerCase().includes(participantSearchQuery.toLowerCase()) ||
        a.cpf_cnpj?.includes(participantSearchQuery)
      ).map(a => ({
        nome: a.full_name || a.name,
        cpf: a.cpf_cnpj || '',
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
      cpf: participant.cpf,
      role: participant.funcoes?.[0] || 'compositor',
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

      toast({
        title: "Sucesso",
        description: "Música registrada com sucesso!",
      });
      
      onSuccess?.();
    } catch (error) {
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
        {/* Buscar Obra Existente */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Buscar Obra Existente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Digite o título, gênero ou código e pressione ENTER para buscar" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2">
                  {searchResults.length} resultado(s) encontrado(s):
                </p>
                {searchResults.map((work, index) => (
                  <div 
                    key={index}
                    className="p-3 hover:bg-accent rounded-md cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectWork(work)}
                  >
                    <div>
                      <p className="font-medium">{work.title || work.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {work.genre || work.genero} • {work.source === 'local' ? 'Base Local' : 'ABRAMUS'}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm">
                      Selecionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados Principais da Obra */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados Principais da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Cód Abramus, Cód ECAD, Título da Obra */}
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
              <div className="md:col-span-8">
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
                    Percentual total: {totalPercentage.toFixed(2)}% de 100%
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
                    onClick={() => appendParticipant({ name: '', cpf: '', percentage: 0, role: '' })}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Adicionar participante
                  </Button>
                </div>

                {participantFields.length > 0 && (
                  <div className="space-y-3">
                    {participantFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg items-end">
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
                          name={`participants.${index}.cpf`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF *</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" {...field} />
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
                              <FormLabel>Função</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="compositor">Compositor</SelectItem>
                                  <SelectItem value="autor">Autor</SelectItem>
                                  <SelectItem value="interprete">Intérprete</SelectItem>
                                  <SelectItem value="produtor">Produtor</SelectItem>
                                  <SelectItem value="adaptador">Adaptador</SelectItem>
                                  <SelectItem value="tradutor">Tradutor</SelectItem>
                                  <SelectItem value="versionista">Versionista</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`participants.${index}.percentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>% Participação *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
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
                          onClick={() => removeParticipant(index)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
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
      </form>
    </Form>
  );
}
