import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProjectInsert, ProjectUpdate } from '@/types/database';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useArtists } from '@/hooks/useArtists';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { AudioUploader } from './AudioUploader';
import { supabase } from '@/integrations/supabase/client';
import { ArtistAutocomplete } from './ArtistAutocomplete';
const audioFileSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  size: z.number().optional(),
  path: z.string().optional(),
});

const songSchema = z.object({
  song_name: z.string().min(1, 'Nome da música é obrigatório'),
  collaboration_type: z.enum(['solo', 'feat']).default('solo'),
  track_type: z.enum(['original', 'remix']).default('original'),
  instrumental: z.enum(['sim', 'nao']).default('nao'),
  duration_minutes: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).max(59).optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  composers: z.array(z.object({ name: z.string() })).optional(),
  performers: z.array(z.object({ name: z.string() })).optional(),
  producers: z.array(z.object({ name: z.string() })).optional(),
  lyrics: z.string().optional(),
  audio_files: z.array(audioFileSchema).optional(),
});

const languageOptions = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Japonês', 'Coreano', 'Mandarim', 'Instrumental', 'Multilíngue', 'Outro'];

const projectSchema = z.object({
  release_type: z.enum(['single', 'ep', 'album']).default('single'),
  ep_album_name: z.string().optional(),
  artist_id: z.string().optional(),
  songs: z.array(songSchema).min(1, 'Pelo menos uma música é obrigatória'),
  observations: z.string().optional(),
  // Campos originais para compatibilidade
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'cancelled']).default('draft'),
  created_by: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: artists = [] } = useArtists();
  const [userId, setUserId] = React.useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      release_type: project?.release_type || 'single',
      ep_album_name: project?.ep_album_name || '',
      artist_id: project?.artist_id || '',
      songs: project?.songs || [{
        song_name: '',
        collaboration_type: 'solo',
        track_type: 'original',
        instrumental: 'nao',
        duration_minutes: undefined,
        duration_seconds: undefined,
        genre: '',
        language: '',
        composers: [{ name: '' }],
        performers: [{ name: '' }],
        producers: [{ name: '' }],
        lyrics: '',
        audio_files: [],
      }],
      observations: project?.observations || '',
      // Campos originais para compatibilidade
      name: project?.name || '',
      description: project?.description || '',
      status: project?.status || 'draft',
      created_by: project?.created_by || '',
    },
  });

  const releaseType = form.watch('release_type');

  const {
    fields: songFields,
    append: appendSong,
    remove: removeSong,
  } = useFieldArray({
    control: form.control,
    name: 'songs',
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Atualizar nome do projeto baseado no primeiro nome da música
      const firstSong = data.songs[0];
      
      // Preparar os dados das músicas com arquivos de áudio para salvar no banco
      const songsData = data.songs.map(song => ({
        song_name: song.song_name,
        collaboration_type: song.collaboration_type,
        track_type: song.track_type,
        instrumental: song.instrumental,
        duration_minutes: song.duration_minutes,
        duration_seconds: song.duration_seconds,
        genre: song.genre,
        language: song.language,
        composers: song.composers,
        performers: song.performers,
        producers: song.producers,
        lyrics: song.lyrics,
        audio_files: song.audio_files || [],
      }));

      // Criar objeto apenas com campos válidos da tabela projects
      // Nome do projeto: se for EP/Album usa o nome do EP/Album, senão usa o nome da primeira música
      const projectName = (data.release_type === 'ep' || data.release_type === 'album') && data.ep_album_name 
        ? data.ep_album_name 
        : firstSong.song_name;
      
      const projectData: any = {
        name: projectName,
        description: `${data.release_type} - ${projectName} (${firstSong.genre})`,
        status: data.status,
        artist_id: data.artist_id || null,
        audio_files: JSON.stringify({
          release_type: data.release_type,
          ep_album_name: data.ep_album_name,
          songs: songsData,
          observations: data.observations,
        }),
      };

      // Apenas incluir created_by se for um novo projeto e tivermos o userId
      if (!project && userId) {
        projectData.created_by = userId;
      }

      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          data: projectData,
        });
      } else {
        await createProject.mutateAsync(projectData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const isLoading = createProject.isPending || updateProject.isPending;
  const formErrors = form.formState.errors;

  // Debug: log validation errors
  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.log('Validation errors:', errors);
  });

  const addNewSong = () => {
    appendSong({
      song_name: '',
      collaboration_type: 'solo',
      track_type: 'original',
      instrumental: 'nao',
      duration_minutes: undefined,
      duration_seconds: undefined,
      genre: '',
      language: '',
      composers: [{ name: '' }],
      performers: [{ name: '' }],
      producers: [{ name: '' }],
      lyrics: '',
      audio_files: [],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="release_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Lançamento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* Campo de nome do EP/Álbum - só aparece quando tipo é EP ou Álbum */}
        {(releaseType === 'ep' || releaseType === 'album') && (
          <FormField
            control={form.control}
            name="ep_album_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do {releaseType === 'ep' ? 'EP' : 'Álbum'} *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`Digite o nome do ${releaseType === 'ep' ? 'EP' : 'Álbum'}`} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="artist_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artista Responsável</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o artista" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Seção de Músicas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {releaseType === 'single' ? 'Música' : 'Músicas'}
            </h3>
            {(releaseType === 'ep' || releaseType === 'album') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewSong}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicionar Música
              </Button>
            )}
          </div>

          {songFields.map((songField, songIndex) => (
            <div key={songField.id} className="border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-medium text-sm sm:text-base">
                  {songFields.length > 1 ? `Música ${songIndex + 1}` : 'Detalhes da Música'}
                </h4>
                {songFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSong(songIndex)}
                    className="self-start sm:self-auto"
                  >
                    <Trash2Icon className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Remover</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.song_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Música *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da música" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.collaboration_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solo/Feat *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="solo">Solo</SelectItem>
                          <SelectItem value="feat">Feat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.track_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original/Remix *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="original">Original</SelectItem>
                          <SelectItem value="remix">Remix</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.instrumental`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrumental *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`songs.${songIndex}.duration_minutes`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Duração</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="Min" 
                              className="w-20"
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
                              className="w-20"
                              value={form.watch(`songs.${songIndex}.duration_seconds`) ?? ''}
                              onChange={(e) => form.setValue(`songs.${songIndex}.duration_seconds`, e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.genre`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero Musical *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`songs.${songIndex}.language`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma da Música *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languageOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SongCreditsSection songIndex={songIndex} form={form} />

              <FormField
                control={form.control}
                name={`songs.${songIndex}.lyrics`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Letra</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite a letra da música..."
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`songs.${songIndex}.audio_files`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arquivos de Áudio (MP3/WAV)</FormLabel>
                    <FormControl>
                      <AudioUploader
                        files={field.value || []}
                        onChange={field.onChange}
                        projectId={project?.id}
                        songIndex={songIndex}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais sobre o projeto..."
                  className="min-h-[100px]"
                  {...field} 
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : (project ? 'Atualizar' : 'Criar Projeto')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Componente separado para os créditos da música
function SongCreditsSection({ songIndex, form }: { songIndex: number; form: any }) {
  const {
    fields: composerFields,
    append: appendComposer,
    remove: removeComposer,
  } = useFieldArray({
    control: form.control,
    name: `songs.${songIndex}.composers`,
  });

  const {
    fields: performerFields,
    append: appendPerformer,
    remove: removePerformer,
  } = useFieldArray({
    control: form.control,
    name: `songs.${songIndex}.performers`,
  });

  const {
    fields: producerFields,
    append: appendProducer,
    remove: removeProducer,
  } = useFieldArray({
    control: form.control,
    name: `songs.${songIndex}.producers`,
  });

  return (
    <div className="space-y-6">
      {/* Compositores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Compositores *</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendComposer({ name: '' })}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Compositor
          </Button>
        </div>
        <div className="space-y-2">
          {composerFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`songs.${songIndex}.composers.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <ArtistAutocomplete 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Nome do compositor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {composerFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeComposer(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Intérpretes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Intérpretes *</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPerformer({ name: '' })}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Intérprete
          </Button>
        </div>
        <div className="space-y-2">
          {performerFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`songs.${songIndex}.performers.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <ArtistAutocomplete 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Nome do intérprete"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {performerFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removePerformer(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Produtores */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Produtores *</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendProducer({ name: '' })}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Produtor
          </Button>
        </div>
        <div className="space-y-2">
          {producerFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`songs.${songIndex}.producers.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <ArtistAutocomplete 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Nome do produtor"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {producerFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeProducer(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}