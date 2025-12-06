import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MusicRegistrationInsert, MusicRegistrationUpdate } from '@/types/database';
import { PlusIcon, Trash2Icon, FolderOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { useCrmContacts } from '@/hooks/useCrm';
import { Alert, AlertDescription } from '@/components/ui/alert';

const creditSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  percentage: z.number().min(0, 'Percentual deve ser maior que 0').max(100, 'Percentual não pode ser maior que 100'),
});

const publisherSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  percentage: z.number().min(0, 'Porcentagem deve ser maior que 0').max(100, 'Porcentagem não pode ser maior que 100'),
});

const musicRegistrationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  artist_id: z.string().optional(),
  project_id: z.string().optional(),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  duration: z.number().optional(),
  duration_minutes: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).max(59).optional(),
  isrc: z.string().optional(),
  iswc: z.string().optional(),
  ecad_code: z.string().optional(),
  recording_date: z.string().optional(),
  lyrics: z.string().optional(),
  audio_file: z.string().optional(),
  phonogram_report: z.string().optional(),
  composers: z.array(creditSchema).min(1, 'Pelo menos um compositor é obrigatório'),
  performers: z.array(creditSchema).min(1, 'Pelo menos um intérprete é obrigatório'),
  producers: z.array(creditSchema).min(1, 'Pelo menos um produtor é obrigatório'),
  has_publisher: z.boolean().default(false),
  publishers: z.array(publisherSchema).optional(),
  status: z.enum(['pending', 'registered', 'approved', 'rejected']).default('pending'),
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

  // Helper function to find CPF by name from artists or CRM contacts
  const findCpfByName = (name: string): string => {
    if (!name || name.trim() === '') return '';
    
    const normalizedName = name.trim().toLowerCase();
    
    // First, search in artists by name or stage_name
    const artist = artists.find(a => 
      a.name?.toLowerCase() === normalizedName ||
      a.stage_name?.toLowerCase() === normalizedName ||
      a.full_name?.toLowerCase() === normalizedName
    );
    
    if (artist?.cpf_cnpj) {
      return artist.cpf_cnpj;
    }
    
    // If not found in artists, search in CRM contacts
    const crmContact = crmContacts.find(c => 
      c.name?.toLowerCase() === normalizedName
    );
    
    // CRM contacts don't have CPF field in current schema, but we check anyway
    // Return empty string if no CPF found
    return '';
  };
  
  const form = useForm<MusicRegistrationFormData>({
    resolver: zodResolver(musicRegistrationSchema),
    defaultValues: {
      title: registration?.title || '',
      artist_id: registration?.artist_id || '',
      project_id: registration?.project_id || '',
      genre: registration?.genre || '',
      duration: registration?.duration || undefined,
      duration_minutes: registration?.duration ? Math.floor(registration.duration / 60) : undefined,
      duration_seconds: registration?.duration ? registration.duration % 60 : undefined,
      isrc: registration?.isrc || '',
      iswc: registration?.iswc || '',
      ecad_code: registration?.ecad_code || '',
      recording_date: registration?.recording_date || '',
      lyrics: registration?.lyrics || '',
      audio_file: registration?.audio_file || '',
      phonogram_report: registration?.phonogram_report || '',
      composers: registration?.composers || [{ name: '', cpf: '', percentage: 0 }],
      performers: registration?.performers || [{ name: '', cpf: '', percentage: 0 }],
      producers: registration?.producers || [{ name: '', cpf: '', percentage: 0 }],
      has_publisher: registration?.has_publisher || false,
      publishers: registration?.publishers || [{ name: '', cpf_cnpj: '', percentage: 0 }],
      status: registration?.status || 'pending',
    },
  });

  const selectedProjectId = form.watch('project_id');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const {
    fields: composerFields,
    append: appendComposer,
    remove: removeComposer,
  } = useFieldArray({
    control: form.control,
    name: 'composers',
  });

  const {
    fields: performerFields,
    append: appendPerformer,
    remove: removePerformer,
  } = useFieldArray({
    control: form.control,
    name: 'performers',
  });

  const {
    fields: producerFields,
    append: appendProducer,
    remove: removeProducer,
  } = useFieldArray({
    control: form.control,
    name: 'producers',
  });

  const {
    fields: publisherFields,
    append: appendPublisher,
    remove: removePublisher,
  } = useFieldArray({
    control: form.control,
    name: 'publishers',
  });

  const hasPublisher = form.watch('has_publisher');

  // Auto-fill data when project is selected
  useEffect(() => {
    if (selectedProject && !registration) {
      try {
        // Parse audio_files to get project details
        let projectDetails = null;
        if (selectedProject.audio_files && typeof selectedProject.audio_files === 'string') {
          projectDetails = JSON.parse(selectedProject.audio_files);
        } else if (selectedProject.audio_files && typeof selectedProject.audio_files === 'object') {
          projectDetails = selectedProject.audio_files;
        }

        if (projectDetails?.songs && projectDetails.songs.length > 0) {
          const firstSong = projectDetails.songs[0];
          
          // Set title from song name
          if (firstSong.song_name) {
            form.setValue('title', firstSong.song_name);
          }
          
          // Set genre
          if (firstSong.genre) {
            form.setValue('genre', firstSong.genre);
          }

          // Set artist_id from project
          if (selectedProject.artist_id) {
            form.setValue('artist_id', selectedProject.artist_id);
          }

          // Set duration from project
          if (firstSong.duration_minutes !== undefined) {
            form.setValue('duration_minutes', firstSong.duration_minutes);
          }
          if (firstSong.duration_seconds !== undefined) {
            form.setValue('duration_seconds', firstSong.duration_seconds);
          }

          // Set lyrics
          if (firstSong.lyrics) {
            form.setValue('lyrics', firstSong.lyrics);
          }
          
          // Convert composers to the form format (with CPF from artists/CRM and percentage)
          if (firstSong.composers && firstSong.composers.length > 0) {
            const formattedComposers = firstSong.composers
              .filter((c: any) => c.name && c.name.trim() !== '')
              .map((c: any, index: number, arr: any[]) => ({
                name: c.name,
                cpf: c.cpf || findCpfByName(c.name),
                percentage: c.percentage || Math.round(100 / arr.length),
              }));
            
            if (formattedComposers.length > 0) {
              form.setValue('composers', formattedComposers);
            }
          }
          
          // Convert performers to the form format
          if (firstSong.performers && firstSong.performers.length > 0) {
            const formattedPerformers = firstSong.performers
              .filter((p: any) => p.name && p.name.trim() !== '')
              .map((p: any, index: number, arr: any[]) => ({
                name: p.name,
                cpf: p.cpf || findCpfByName(p.name),
                percentage: p.percentage || Math.round(100 / arr.length),
              }));
            
            if (formattedPerformers.length > 0) {
              form.setValue('performers', formattedPerformers);
            }
          }
          
          // Convert producers to the form format
          if (firstSong.producers && firstSong.producers.length > 0) {
            const formattedProducers = firstSong.producers
              .filter((p: any) => p.name && p.name.trim() !== '')
              .map((p: any, index: number, arr: any[]) => ({
                name: p.name,
                cpf: p.cpf || findCpfByName(p.name),
                percentage: p.percentage || Math.round(100 / arr.length),
              }));
            
            if (formattedProducers.length > 0) {
              form.setValue('producers', formattedProducers);
            }
          }

          toast({
            title: "Projeto carregado",
            description: `Informações do projeto "${selectedProject.name}" foram preenchidas automaticamente.`,
          });
        } else {
          toast({
            title: "Projeto selecionado",
            description: `Projeto "${selectedProject.name}" não possui músicas cadastradas. Preencha manualmente.`,
          });
        }
      } catch (error) {
        console.error('Error parsing project data:', error);
        toast({
          title: "Projeto selecionado",
          description: `Não foi possível carregar dados do projeto. Preencha manualmente.`,
        });
      }
    }
  }, [selectedProjectId, projects, artists, crmContacts]);

  const onSubmit = async (data: MusicRegistrationFormData) => {
    try {
      // Calculate total duration in seconds from minutes and seconds
      const totalDuration = ((data.duration_minutes || 0) * 60) + (data.duration_seconds || 0);
      const submissionData = {
        ...data,
        duration: totalDuration > 0 ? totalDuration : undefined,
      };

      // Validate that percentages add up to 100 for each category
      const composerTotal = data.composers.reduce((sum, composer) => sum + composer.percentage, 0);
      const performerTotal = data.performers.reduce((sum, performer) => sum + performer.percentage, 0);
      const producerTotal = data.producers.reduce((sum, producer) => sum + producer.percentage, 0);

      if (Math.abs(composerTotal - 100) > 0.01) {
        toast({
          title: "Erro de validação",
          description: "A soma das porcentagens dos compositores deve ser 100%",
          variant: "destructive",
        });
        return;
      }

      if (Math.abs(performerTotal - 100) > 0.01) {
        toast({
          title: "Erro de validação", 
          description: "A soma das porcentagens dos intérpretes deve ser 100%",
          variant: "destructive",
        });
        return;
      }

      if (Math.abs(producerTotal - 100) > 0.01) {
        toast({
          title: "Erro de validação",
          description: "A soma das porcentagens dos produtores deve ser 100%",
          variant: "destructive",
        });
        return;
      }

      // Here you would call the appropriate service to save the music registration
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projeto Base
            </CardTitle>
            <CardDescription>
              Selecione um projeto para pré-carregar informações ou deixe em branco para preencher manualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projeto (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto existente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} {project.description && `- ${project.description}`}
                        </SelectItem>
                      ))}
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
                  <strong>Projeto selecionado:</strong> {selectedProject.name}
                  <br />
                  {selectedProject.description && (
                    <>
                      <strong>Descrição:</strong> {selectedProject.description}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais da música
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Música *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da música" {...field} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="Min" 
                          className="w-16"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <span className="text-muted-foreground">:</span>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          max="59"
                          placeholder="Seg" 
                          className="w-16"
                          value={form.watch('duration_seconds') ?? ''}
                          onChange={(e) => form.setValue('duration_seconds', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recording_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Gravação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Em Análise</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Publisher Information */}
        <Card>
          <CardHeader>
            <CardTitle>Editora Musical</CardTitle>
            <CardDescription>
              Informações sobre a editora musical (se aplicável)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="has_publisher"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Esta música possui editora musical
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {hasPublisher && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Editoras</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPublisher({ name: '', cpf_cnpj: '', percentage: 0 })}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Adicionar Editora
                    </Button>
                  </div>
                  
                  {publisherFields.map((publisherField, index) => (
                    <div key={publisherField.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg items-end">
                      <FormField
                        control={form.control}
                        name={`publishers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Editora *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da editora musical" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`publishers.${index}.cpf_cnpj`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF/CNPJ *</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`publishers.${index}.percentage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Porcentagem (%)*</FormLabel>
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
                        onClick={() => removePublisher(index)}
                        disabled={publisherFields.length === 1}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Créditos e Participações</CardTitle>
            <CardDescription>
              Configure os créditos dos compositores, intérpretes e produtores (cada categoria deve somar 100%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Compositores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Compositores</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendComposer({ name: '', cpf: '', percentage: 0 })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Compositor
                </Button>
              </div>
              <div className="space-y-3">
                {composerFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`composers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do compositor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`composers.${index}.cpf`}
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
                      name={`composers.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentagem (%)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      {composerFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeComposer(index)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intérpretes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Intérpretes</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPerformer({ name: '', cpf: '', percentage: 0 })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Intérprete
                </Button>
              </div>
              <div className="space-y-3">
                {performerFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`performers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do intérprete" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`performers.${index}.cpf`}
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
                      name={`performers.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentagem (%)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      {performerFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePerformer(index)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Produtores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Produtores</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendProducer({ name: '', cpf: '', percentage: 0 })}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Produtor
                </Button>
              </div>
              <div className="space-y-3">
                {producerFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`producers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do produtor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`producers.${index}.cpf`}
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
                      name={`producers.${index}.percentage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porcentagem (%)*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      {producerFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProducer(index)}
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
            <CardDescription>
              Códigos de identificação e informações complementares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="isrc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISRC</FormLabel>
                    <FormControl>
                      <Input placeholder="BRAB1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iswc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISWC</FormLabel>
                    <FormControl>
                      <Input placeholder="T-123.456.789-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ecad_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código ECAD</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="lyrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Letra da Música</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite a letra completa da música..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            {registration ? 'Atualizar Música' : 'Registrar Música'}
          </Button>
        </div>
      </form>
    </Form>
  );
}