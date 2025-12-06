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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PlusIcon, Trash2Icon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useArtists } from '@/hooks/useArtists';
import { useMusicRegistry } from '@/hooks/useMusicRegistry';
import { useCreatePhonogram, useUpdatePhonogram } from '@/hooks/usePhonograms';

const participantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  percentage: z.number().min(0).max(100).optional(),
});

const phonogramSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  work_id: z.string().optional(),
  isrc: z.string().optional(),
  artist_id: z.string().optional(),
  recording_date: z.string().optional(),
  recording_studio: z.string().optional(),
  recording_location: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).max(59).optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  version_type: z.string().optional(),
  is_remix: z.boolean().default(false),
  remix_artist: z.string().optional(),
  master_owner: z.string().optional(),
  label: z.string().optional(),
  status: z.enum(['pendente', 'em_analise', 'aceita', 'recusada']).default('pendente'),
  participants: z.array(participantSchema).optional(),
});

type PhonogramFormData = z.infer<typeof phonogramSchema>;

interface PhonogramFormProps {
  phonogram?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PhonogramForm({ phonogram, onSuccess, onCancel }: PhonogramFormProps) {
  const { toast } = useToast();
  const { data: artists = [] } = useArtists();
  const { data: works = [] } = useMusicRegistry();
  const createPhonogram = useCreatePhonogram();
  const updatePhonogram = useUpdatePhonogram();

  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(true);

  const getParticipantsFromPhonogram = () => {
    if (phonogram?.participants && Array.isArray(phonogram.participants) && phonogram.participants.length > 0) {
      return phonogram.participants;
    }
    return [];
  };

  const form = useForm<PhonogramFormData>({
    resolver: zodResolver(phonogramSchema),
    defaultValues: {
      title: phonogram?.title || '',
      work_id: phonogram?.work_id || '',
      isrc: phonogram?.isrc || '',
      artist_id: phonogram?.artist_id || '',
      recording_date: phonogram?.recording_date || '',
      recording_studio: phonogram?.recording_studio || '',
      recording_location: phonogram?.recording_location || '',
      duration_minutes: phonogram?.duration ? Math.floor(phonogram.duration / 60) : undefined,
      duration_seconds: phonogram?.duration ? phonogram.duration % 60 : undefined,
      genre: phonogram?.genre || '',
      language: phonogram?.language || 'portugues',
      version_type: phonogram?.version_type || 'original',
      is_remix: phonogram?.is_remix || false,
      remix_artist: phonogram?.remix_artist || '',
      master_owner: phonogram?.master_owner || '',
      label: phonogram?.label || '',
      status: phonogram?.status || 'pendente',
      participants: getParticipantsFromPhonogram(),
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

  const watchIsRemix = form.watch('is_remix');
  const selectedWorkId = form.watch('work_id');
  const selectedArtistId = form.watch('artist_id');

  const selectedWork = works.find(w => w.id === selectedWorkId);
  const selectedArtist = artists.find(a => a.id === selectedArtistId);

  const onSubmit = async (data: PhonogramFormData) => {
    try {
      const totalDuration = ((data.duration_minutes || 0) * 60) + (data.duration_seconds || 0);

      const phonogramData = {
        title: data.title,
        work_id: data.work_id || null,
        isrc: data.isrc || null,
        artist_id: data.artist_id || null,
        recording_date: data.recording_date || null,
        recording_studio: data.recording_studio || null,
        recording_location: data.recording_location || null,
        duration: totalDuration > 0 ? totalDuration : null,
        genre: data.genre || null,
        language: data.language || null,
        version_type: data.version_type || null,
        is_remix: data.is_remix,
        remix_artist: data.is_remix ? data.remix_artist : null,
        master_owner: data.master_owner || null,
        label: data.label || null,
        status: data.status || 'pendente',
        participants: data.participants || [],
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Vincular Obra */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Vincular Obra (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="work_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obra Registrada</FormLabel>
                  <Popover open={workDropdownOpen} onOpenChange={setWorkDropdownOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedWork ? selectedWork.title : "Selecione uma obra..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar obra..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma obra encontrada.</CommandEmpty>
                          <CommandGroup>
                            {works.map((work) => (
                              <CommandItem
                                key={work.id}
                                value={work.title}
                                onSelect={() => {
                                  field.onChange(work.id);
                                  form.setValue('title', work.title);
                                  form.setValue('genre', work.genre || '');
                                  if (work.duration) {
                                    form.setValue('duration_minutes', Math.floor(work.duration / 60));
                                    form.setValue('duration_seconds', work.duration % 60);
                                  }
                                  setWorkDropdownOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === work.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {work.title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informações do Fonograma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Fonograma *</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da gravação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isrc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISRC</FormLabel>
                    <FormControl>
                      <Input placeholder="BR-XXX-XX-XXXXX" {...field} />
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
                    <FormLabel>Situação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aceita">Aceita</SelectItem>
                        <SelectItem value="recusada">Recusada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artista Principal</FormLabel>
                    <Popover open={artistDropdownOpen} onOpenChange={setArtistDropdownOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedArtist ? selectedArtist.name : "Selecione um artista..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar artista..." />
                          <CommandList>
                            <CommandEmpty>Nenhum artista encontrado.</CommandEmpty>
                            <CommandGroup>
                              {artists.map((artist) => (
                                <CommandItem
                                  key={artist.id}
                                  value={artist.name}
                                  onSelect={() => {
                                    field.onChange(artist.id);
                                    setArtistDropdownOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === artist.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {artist.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
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
                        <SelectItem value="instrumental">Instrumental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_seconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (seg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gravação */}
        <Card className="bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Dados da Gravação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="recording_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Gravação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recording_studio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estúdio</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do estúdio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recording_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade/País" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="version_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Versão</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="remix">Remix</SelectItem>
                        <SelectItem value="ao_vivo">Ao Vivo</SelectItem>
                        <SelectItem value="acustico">Acústico</SelectItem>
                        <SelectItem value="cover">Cover</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="master_owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detentor do Master</FormLabel>
                    <FormControl>
                      <Input placeholder="Proprietário da gravação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravadora/Selo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da gravadora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Participantes */}
        <Card className="bg-card">
          <Collapsible open={participantsOpen} onOpenChange={setParticipantsOpen}>
            <CardHeader className="pb-4">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle className="text-lg">Participantes (Intérpretes, Músicos, Produtores)</CardTitle>
                  {participantsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {participantFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name={`participants.${index}.name`}
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
                        name={`participants.${index}.role`}
                        render={({ field }) => (
                          <FormItem>
                            {index === 0 && <FormLabel>Função</FormLabel>}
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Função" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="interprete">Intérprete</SelectItem>
                                <SelectItem value="musico">Músico</SelectItem>
                                <SelectItem value="produtor">Produtor</SelectItem>
                                <SelectItem value="engenheiro_som">Engenheiro de Som</SelectItem>
                                <SelectItem value="tecnico_mixagem">Técnico de Mixagem</SelectItem>
                                <SelectItem value="masterizacao">Masterização</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`participants.${index}.percentage`}
                        render={({ field }) => (
                          <FormItem>
                            {index === 0 && <FormLabel>%</FormLabel>}
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(index)}
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
                  onClick={() => appendParticipant({ name: '', role: '', percentage: 0 })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Participante
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={createPhonogram.isPending || updatePhonogram.isPending}>
            {phonogram?.id ? 'Atualizar Fonograma' : 'Registrar Fonograma'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
