import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusIcon, Trash2Icon, UploadIcon, ImageIcon, MusicIcon, X, FolderOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';

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
  status: z.enum(['em_analise', 'aprovado', 'rejeitado', 'pausado']).default('em_analise'),
  platforms: z.array(z.string()).default([]),
  distribution_notes: z.string().optional(),
  
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
});

type ReleaseFormData = z.infer<typeof releaseSchema>;

interface ReleaseFormProps {
  release?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const platformOptions = [
  { id: 'spotify', label: 'Spotify' },
  { id: 'apple_music', label: 'Apple Music' },
  { id: 'youtube_music', label: 'YouTube Music' },
  { id: 'deezer', label: 'Deezer' },
  { id: 'amazon_music', label: 'Amazon Music' },
  { id: 'tidal', label: 'Tidal' },
  { id: 'soundcloud', label: 'SoundCloud' },
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
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  
  const form = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      project_id: release?.project_id || '',
      release_title: release?.release_title || '',
      artist_name: release?.artist_name || '',
      release_type: release?.release_type || undefined,
      release_date: release?.release_date || '',
      status: release?.status || 'em_analise',
      platforms: release?.platforms || ['spotify', 'apple_music', 'youtube_music', 'deezer'],
      distribution_notes: release?.distribution_notes || '',
      genre: release?.genre || '',
      language: release?.language || '',
      label: release?.label || '',
      copyright: release?.copyright || '',
      cover_art: release?.cover_art || '',
      additional_images: release?.additional_images || [],
      tracks: release?.tracks || [{ 
        title: '', 
        artist: '', 
        composers: [], 
        performers: [], 
        producers: [], 
        isrc: '', 
        audio_file: '', 
        lyrics: '' 
      }],
    },
  });

  const selectedProjectId = form.watch('project_id');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Auto-fill data when project is selected
  useEffect(() => {
    if (selectedProject) {
      toast({
        title: "Projeto selecionado",
        description: `Dados do projeto "${selectedProject.name}" carregados. Complete os campos restantes.`,
      });
    }
  }, [selectedProject, toast]);

  const releaseType = form.watch('release_type');

  const {
    fields: trackFields,
    append: appendTrack,
    remove: removeTrack,
  } = useFieldArray({
    control: form.control,
    name: 'tracks',
  });

  const handleFileUpload = (fileType: string, file: File) => {
    // TODO: Implementar upload para Supabase Storage
    // Por enquanto, apenas simula o upload
    toast({
      title: "Arquivo carregado",
      description: `Arquivo ${fileType}: ${file.name} selecionado com sucesso!`,
    });
    
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
    
    // Simular upload
    const fileUrl = URL.createObjectURL(file);
    setUploadedFiles(prev => ({ ...prev, [fileType]: fileUrl }));
    
    // Atualizar form
    if (fileType === 'cover_art') {
      form.setValue(fileType, fileUrl);
    }
  };

  const onSubmit = async (data: ReleaseFormData) => {
    try {
      // TODO: Implementar salvamento no Supabase
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Lançamento salvo",
        description: "O lançamento foi salvo com sucesso!",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar lançamento.",
        variant: "destructive",
      });
    }
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

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero *</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {uploadedFiles[`track_${index}_audio`] ? (
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
                      Selecionar Áudio
                    </Button>
                  </div>
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
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Selecionar Capa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plataformas de Distribuição */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Plataformas de Distribuição</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {platformOptions.map((platform) => (
                      <FormField
                        key={platform.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={platform.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(platform.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, platform.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== platform.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {platform.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distribution_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Distribuição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas especiais sobre a distribuição..."
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

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {release ? 'Atualizar' : 'Criar Lançamento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}