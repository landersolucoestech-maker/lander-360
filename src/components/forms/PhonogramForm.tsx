import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusIcon, Trash2Icon, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useArtists } from '@/hooks/useArtists';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { useCreatePhonogram, useUpdatePhonogram } from '@/hooks/usePhonograms';
import { ScrollArea } from '@/components/ui/scroll-area';

const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  percentage: z.number().min(0).max(100).optional(),
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
  status: z.enum(['pendente', 'em_analise', 'aceita', 'recusada']).default('pendente'),
  
  // Participação
  phonographic_producers: z.array(participantSchema).optional(),
  performers: z.array(participantSchema).optional(),
  musicians: z.array(participantSchema).optional(),
});

type PhonogramFormData = z.infer<typeof phonogramSchema>;

interface PhonogramFormProps {
  phonogram?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Toggle Button Component
const ToggleButton = ({ value, onChange, options }: { value: boolean; onChange: (val: boolean) => void; options: [string, string] }) => (
  <div className="flex gap-1">
    <Button
      type="button"
      size="sm"
      variant={!value ? "default" : "outline"}
      className={cn(!value && "bg-primary hover:bg-primary/90")}
      onClick={() => onChange(false)}
    >
      {options[0]}
    </Button>
    <Button
      type="button"
      size="sm"
      variant={value ? "default" : "outline"}
      className={cn(value && "bg-primary hover:bg-primary/90")}
      onClick={() => onChange(true)}
    >
      {options[1]}
    </Button>
  </div>
);

export function PhonogramForm({ phonogram, onSuccess, onCancel }: PhonogramFormProps) {
  const { toast } = useToast();
  const { data: works = [] } = useMusicRegistry();
  const createPhonogram = useCreatePhonogram();
  const updatePhonogram = useUpdatePhonogram();

  const [workSearchOpen, setWorkSearchOpen] = useState(false);
  const [workSearchTerm, setWorkSearchTerm] = useState('');
  const [producersOpen, setProducersOpen] = useState(true);
  const [performersOpen, setPerformersOpen] = useState(false);
  const [musiciansOpen, setMusiciansOpen] = useState(false);

  // Parse ISRC from phonogram
  const parseIsrc = (isrc: string | null) => {
    if (!isrc) return { country: 'BR', registrant: '', year: '', designation: '' };
    const parts = isrc.split('-');
    if (parts.length >= 4) {
      return { country: parts[0], registrant: parts[1], year: parts[2], designation: parts[3] };
    }
    return { country: 'BR', registrant: '', year: '', designation: '' };
  };

  const parsedIsrc = parseIsrc(phonogram?.isrc);

  const form = useForm<PhonogramFormData>({
    resolver: zodResolver(phonogramSchema),
    defaultValues: {
      work_id: phonogram?.work_id || '',
      work_abramus_code: '',
      work_title: '',
      abramus_code: phonogram?.abramus_code || '',
      ecad_code: phonogram?.ecad_code || '',
      aggregator: phonogram?.aggregator || '',
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
      is_instrumental: phonogram?.is_instrumental || false,
      genre: phonogram?.genre || '',
      classification: phonogram?.classification || 'studio',
      media: phonogram?.media || 'todos',
      is_national: phonogram?.is_national ?? true,
      simultaneous_publication: phonogram?.simultaneous_publication || false,
      origin_country: phonogram?.origin_country || 'brazil',
      publication_country: phonogram?.publication_country || 'brazil',
      status: phonogram?.status || 'pendente',
      phonographic_producers: phonogram?.participants?.filter((p: any) => p.role === 'produtor_fonografico') || [],
      performers: phonogram?.participants?.filter((p: any) => p.role === 'interprete') || [],
      musicians: phonogram?.participants?.filter((p: any) => p.role === 'musico') || [],
    },
  });

  const { fields: producerFields, append: appendProducer, remove: removeProducer } = useFieldArray({
    control: form.control,
    name: 'phonographic_producers',
  });

  const { fields: performerFields, append: appendPerformer, remove: removePerformer } = useFieldArray({
    control: form.control,
    name: 'performers',
  });

  const { fields: musicianFields, append: appendMusician, remove: removeMusician } = useFieldArray({
    control: form.control,
    name: 'musicians',
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
    if (work.duration) {
      form.setValue('duration_minutes', Math.floor(work.duration / 60));
      form.setValue('duration_seconds', work.duration % 60);
    }
    setWorkSearchOpen(false);
    toast({
      title: "Obra vinculada",
      description: `Obra "${work.title}" foi vinculada ao fonograma.`,
    });
  };

  const filteredWorks = works.filter(w => 
    w.title?.toLowerCase().includes(workSearchTerm.toLowerCase()) ||
    w.abramus_code?.toLowerCase().includes(workSearchTerm.toLowerCase())
  );

  const onSubmit = async (data: PhonogramFormData) => {
    try {
      const totalDuration = ((data.duration_minutes || 0) * 60) + (data.duration_seconds || 0);
      const isrc = `${data.isrc_country || 'BR'}-${data.isrc_registrant || ''}-${data.isrc_year || ''}-${data.isrc_designation || ''}`;

      // Combine all participants
      const allParticipants = [
        ...(data.phonographic_producers || []).map(p => ({ ...p, role: 'produtor_fonografico' })),
        ...(data.performers || []).map(p => ({ ...p, role: 'interprete' })),
        ...(data.musicians || []).map(p => ({ ...p, role: 'musico' })),
      ];

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
      };

      if (phonogram?.id) {
        await updatePhonogram.mutateAsync({ id: phonogram.id, data: phonogramData });
      } else {
        await createPhonogram.mutateAsync(phonogramData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving phonogram:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar fonograma. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderParticipantSection = (
    title: string,
    fields: any[],
    append: (value: any) => void,
    remove: (index: number) => void,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    fieldName: 'phonographic_producers' | 'performers' | 'musicians',
    percentage: number,
    maxPercentage: number = 100
  ) => (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70">
          <span className="font-medium">{title} - Percentual total: {percentage.toFixed(2)}% de {maxPercentage.toFixed(2)}%</span>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <FormField
                control={form.control}
                name={`${fieldName}.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>Nome</FormLabel>}
                    <FormControl>
                      <Input placeholder="Nome do participante" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-4">
              <FormField
                control={form.control}
                name={`${fieldName}.${index}.percentage`}
                render={({ field }) => (
                  <FormItem>
                    {index === 0 && <FormLabel>Percentual (%)</FormLabel>}
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2Icon className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', role: '', percentage: 0 })}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Vincular Obra */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-10">
                <FormField
                  control={form.control}
                  name="work_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Obra</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="O título da obra será exibido aqui. Clique no botão para pesquisar." 
                          {...field} 
                          readOnly 
                          className="bg-muted/50"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <Button type="button" onClick={() => setWorkSearchOpen(true)} className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Pesquisar
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
                <FormField
                  control={form.control}
                  name="abramus_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód Abramus</FormLabel>
                      <FormControl>
                        <Input placeholder="Código Abramus" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="ecad_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cód ECAD</FormLabel>
                      <FormControl>
                        <Input placeholder="Código ECAD" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="aggregator"
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-4">
                <FormLabel>ISRC</FormLabel>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <FormField
                    control={form.control}
                    name="isrc_country"
                    render={({ field }) => (
                      <FormControl>
                        <Input placeholder="BR" maxLength={2} {...field} />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isrc_registrant"
                    render={({ field }) => (
                      <FormControl>
                        <Input placeholder="XXX" maxLength={3} {...field} />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isrc_year"
                    render={({ field }) => (
                      <FormControl>
                        <Input placeholder="00" maxLength={2} {...field} />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isrc_designation"
                    render={({ field }) => (
                      <FormControl>
                        <Input placeholder="00000" maxLength={5} {...field} />
                      </FormControl>
                    )}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="is_ai_created"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criada por IA</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 2: Datas e Duração */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="emission_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emissão</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="recording_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gravação Original</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="release_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lançamento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormLabel>Duração</FormLabel>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">min</span>
                        </div>
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration_seconds"
                    render={({ field }) => (
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">seg</span>
                        </div>
                      </FormControl>
                    )}
                  />
                </div>
              </div>
              <div className="col-span-4" />
            </div>

            {/* Row 3: Instrumental, Gênero, Classificação */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="is_instrumental"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrumental</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="classification"
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 4: Mídia, Nacional, Publicação, Países */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="media"
                  render={({ field }) => (
                    <FormItem>
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
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="is_national"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacional</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="simultaneous_publication"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publicação Simultânea</FormLabel>
                      <FormControl>
                        <ToggleButton value={field.value} onChange={field.onChange} options={["Não", "Sim"]} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="origin_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País de Origem</FormLabel>
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
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="publication_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País de Publicação</FormLabel>
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
                    </FormItem>
                  )}
                />
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
            {renderParticipantSection(
              "Produtor Fonográfico",
              producerFields,
              appendProducer,
              removeProducer,
              producersOpen,
              setProducersOpen,
              'phonographic_producers',
              producersPercentage,
              41.70
            )}
            {renderParticipantSection(
              "Intérprete",
              performerFields,
              appendPerformer,
              removePerformer,
              performersOpen,
              setPerformersOpen,
              'performers',
              performersPercentage,
              41.65
            )}
            {renderParticipantSection(
              "Músico Acompanhante",
              musicianFields,
              appendMusician,
              removeMusician,
              musiciansOpen,
              setMusiciansOpen,
              'musicians',
              musiciansPercentage,
              16.65
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createPhonogram.isPending || updatePhonogram.isPending}>
            {phonogram?.id ? 'Atualizar Fonograma' : 'Cadastrar Fonograma'}
          </Button>
        </div>

        {/* Work Search Dialog */}
        <Dialog open={workSearchOpen} onOpenChange={setWorkSearchOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pesquisar Obra</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Buscar por título ou código ABRAMUS..."
                value={workSearchTerm}
                onChange={(e) => setWorkSearchTerm(e.target.value)}
              />
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {filteredWorks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhuma obra encontrada</p>
                  ) : (
                    filteredWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleSelectWork(work)}
                      >
                        <div className="font-medium">{work.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {work.abramus_code && `ABRAMUS: ${work.abramus_code}`}
                          {work.genre && ` • ${work.genre}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
