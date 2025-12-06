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
import { MusicRegistrationInsert, MusicRegistrationUpdate } from '@/types/database';
import { PlusIcon, Trash2Icon, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { useCrmContacts } from '@/hooks/useCrm';
import { Label } from '@/components/ui/label';

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
  // Legacy fields for backward compatibility
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
});

type MusicRegistrationFormData = z.infer<typeof musicRegistrationSchema>;

interface MusicRegistrationFormProps {
  registration?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MusicRegistrationForm({ registration, onSuccess, onCancel }: MusicRegistrationFormProps) {
  const { toast } = useToast();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: artists = [] } = useArtists();
  const { data: crmContacts = [] } = useCrmContacts();

  const [searchQuery, setSearchQuery] = useState('');
  const [participationOpen, setParticipationOpen] = useState(true);
  const [otherTitlesOpen, setOtherTitlesOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);

  // Helper function to find CPF by name from artists or CRM contacts
  const findCpfByName = (name: string): string => {
    if (!name || name.trim() === '') return '';
    
    const normalizedName = name.trim().toLowerCase();
    
    const artist = artists.find(a => 
      a.name?.toLowerCase() === normalizedName ||
      a.stage_name?.toLowerCase() === normalizedName ||
      a.full_name?.toLowerCase() === normalizedName
    );
    
    if (artist?.cpf_cnpj) {
      return artist.cpf_cnpj;
    }
    
    return '';
  };

  // Calculate total participation percentage
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

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Busca vazia",
        description: "Digite um título, gênero ou código para buscar",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Buscando...",
      description: `Pesquisando por: ${searchQuery}`,
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
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="Digite o título, gênero ou código e pressione ENTER para buscar" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
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
                    onClick={() => {
                      toast({
                        title: "Buscar participante",
                        description: "Funcionalidade de busca em desenvolvimento",
                      });
                    }}
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

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            {registration ? 'Atualizar Obra' : 'Cadastrar Nova Obra'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
