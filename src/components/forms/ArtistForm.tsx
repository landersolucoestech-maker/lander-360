import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Artist, ArtistInsert, ArtistUpdate } from '@/types/database';
import { useCreateArtist, useUpdateArtist } from '@/hooks/useArtists';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Validação para CPF/CNPJ (formato brasileiro)
const cpfCnpjRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;

// Validação para telefone brasileiro
const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;

// Validação para PIX (CPF, CNPJ, email, telefone ou chave aleatória)
const pixKeyRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
const artistSchema = z.object({
  // Informações Básicas
  artistic_name: z.string().min(1, 'Nome artístico é obrigatório'),
  genre: z.string().min(1, 'Gênero musical é obrigatório'),
  music_language: z.string().optional(),
  artist_image: z.any().optional(),
  documents: z.any().optional(),
  biography: z.string().optional(),
  // Dados Pessoais
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  birth_date: z.date().optional(),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório').regex(cpfCnpjRegex, 'Formato de CPF/CNPJ inválido'),
  rg: z.string().min(1, 'RG é obrigatório'),
  full_address: z.string().min(1, 'Endereço completo é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório').regex(phoneRegex, 'Formato de telefone inválido (ex: (11) 99999-9999)'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  // Dados Bancários
  bank: z.string().min(1, 'Banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  pix_key: z.string().optional().refine(val => !val || pixKeyRegex.test(val), 'Formato de chave PIX inválido'),
  account_holder: z.string().min(1, 'Titular da conta é obrigatório'),
  // Redes Sociais e Perfis
  spotify_profile: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  soundcloud: z.string().optional(),
  // Tipo de Perfil e Dados do Responsável
  profile_type: z.string().min(1, 'Tipo de perfil é obrigatório'),
  manager_name: z.string().optional(),
  manager_phone: z.string().optional(),
  manager_email: z.string().email('Email inválido').optional().or(z.literal('')),
  // Distribuidoras
  distributors: z.array(z.string()).optional(),
  distributor_emails: z.record(z.string().email('Email inválido').optional().or(z.literal(''))).optional(),
  // Observações
  observations: z.string().optional()
});
type ArtistFormData = z.infer<typeof artistSchema>;
interface ArtistFormProps {
  artist?: Artist;
  onSuccess?: () => void;
  onCancel?: () => void;
}
const distributorOptions = ['CD Baby', 'DistroKid', 'TuneCore', 'Ditto Music', 'ONErpm', 'iMusics', 'Symphonic Distribution'];
const languageOptions = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Japonês', 'Coreano', 'Mandarim', 'Instrumental', 'Multilíngue', 'Outro'];
const genreOptions = ['Pop', 'Rock', 'Alternative Rock', 'Indie Rock', 'Classic Rock', 'Hard Rock', 'Metal', 'Heavy Metal', 'Punk', 'Punk Rock', 'Grunge', 'Rap/Hip-Hop', 'Trap', 'Drill', 'R&B', 'Soul', 'Funk', 'Funk Carioca', 'Brega Funk', 'Reggae', 'Ska', 'Dancehall', 'Eletrônica', 'EDM', 'House', 'Deep House', 'Tech House', 'Progressive House', 'Techno', 'Minimal Techno', 'Trance', 'Psytrance', 'Hardstyle', 'Drum and Bass', 'Dubstep', 'Future Bass', 'Sertanejo', 'Sertanejo Universitário', 'MPB', 'Bossa Nova', 'Samba', 'Pagode', 'Choro', 'Forró', 'Xote', 'Baião', 'Piseiro', 'Pisadinha', 'Axé', 'Arrocha', 'Lambada', 'Zouk', 'Carimbó', 'Funk Melody', 'Country', 'Country Pop', 'Folk', 'Bluegrass', 'Gospel', 'Música Religiosa', 'Clássico', 'Ópera', 'New Age', 'Ambient', 'Lo-fi', 'Experimental', 'Instrumental', 'World Music', 'Latin Pop', 'Reggaeton', 'Bachata', 'Salsa', 'Merengue', 'Cumbia', 'Flamenco', 'Tango', 'Afrobeat', 'Afrobeats', 'K-pop', 'J-pop', 'City Pop', 'Bolero', 'Forró Eletrônico', 'Indie', 'Emo', 'Britpop', 'Shoegaze', 'Post-Rock', 'Post-Punk', 'Synthpop', 'Electropop', 'Chillwave', 'Trip Hop', 'Downtempo', 'IDM', 'Blues', 'Jazz', 'Smooth Jazz', 'Latin Jazz', 'Fusion', 'Swing', 'BeBop', 'Hard Bop'];
export function ArtistForm({
  artist,
  onSuccess,
  onCancel
}: ArtistFormProps) {
  const {
    toast
  } = useToast();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const [showManagerFields, setShowManagerFields] = useState(false);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(artist?.image_url || null);
  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      artistic_name: artist?.name || '',
      genre: '',
      music_language: '',
      artist_image: undefined,
      biography: '',
      full_name: '',
      birth_date: undefined,
      cpf_cnpj: '',
      rg: '',
      full_address: '',
      phone: '',
      email: '',
      bank: '',
      agency: '',
      account: '',
      pix_key: '',
      account_holder: '',
      spotify_profile: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      soundcloud: '',
      profile_type: '',
      manager_name: '',
      manager_phone: '',
      manager_email: '',
      distributors: [],
      distributor_emails: {},
      observations: ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (onChange: (value: any) => void) => {
    onChange(undefined);
    setImagePreview(null);
  };

  // Watch profile_type to show/hide manager fields
  const profileType = form.watch('profile_type');
  React.useEffect(() => {
    setShowManagerFields(profileType && profileType !== 'Independente');
  }, [profileType]);
  const onSubmit = async (data: ArtistFormData) => {
    try {
      console.log('Dados do artista:', data);
      const artistData = {
        name: data.artistic_name,
        legal_name: data.full_name,
        // Mapear outros campos conforme necessário para a tabela artists
        ...data
      };
      if (artist) {
        await updateArtist.mutateAsync({
          id: artist.id,
          data: artistData as ArtistUpdate
        });
      } else {
        await createArtist.mutateAsync(artistData as any);
      }
      toast({
        title: 'Sucesso',
        description: `Artista ${artist ? 'atualizado' : 'cadastrado'} com sucesso!`
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error saving artist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar artista. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  const isLoading = createArtist.isPending || updateArtist.isPending;
  return <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {artist ? 'Editar Artista' : 'Cadastro de Artista'}
        </h1>
        <p className="text-muted-foreground">
          Preencha todos os campos obrigatórios (*) para cadastrar o artista
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Seção 1: Informações Básicas */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              1. Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagem do Artista */}
              <div className="md:col-span-2">
                <FormField control={form.control} name="artist_image" render={({
                field
              }) => <FormItem>
                      <FormLabel>Imagem do Artista</FormLabel>
                      <FormControl>
                        <div className="flex items-start gap-6">
                          {imagePreview ? (
                            <div className="relative">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => removeImage(field.onChange)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-full flex items-center justify-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                onChange={e => handleImageChange(e, field.onChange)} 
                              />
                            </div>
                          )}
                          <div className="flex-1 pt-2">
                            <p className="text-sm text-muted-foreground">
                              Clique para adicionar a foto do artista
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Formatos aceitos: JPG, PNG, WEBP (máx. 5MB)
                            </p>
                            {!imagePreview && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => document.querySelector<HTMLInputElement>('input[accept="image/*"]')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Escolher Imagem
                              </Button>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              <FormField control={form.control} name="artistic_name" render={({
              field
            }) => <FormItem>
                    <FormLabel>Nome Artístico *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome usado profissionalmente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="genre" render={({
              field
            }) => <FormItem>
                    <FormLabel>Gênero Musical *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent className="max-h-64 overflow-auto">
                          {genreOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="music_language" render={({
              field
            }) => <FormItem>
                    <FormLabel>Idioma da Música</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                      </FormControl>
                        <SelectContent className="max-h-64 overflow-auto">
                          {languageOptions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />

              <div className="md:col-span-2">
                <FormField control={form.control} name="documents" render={({
                field
              }) => <FormItem>
                      <FormLabel>Documentos Pessoais (PDF)</FormLabel>
                      <FormControl>
                        <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para fazer upload ou arraste arquivos aqui
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Aceita apenas PDF (CNH/Identidade - máx. 5MB)
                          </p>
                          <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => field.onChange(e.target.files?.[0])} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              {/* Biografia */}
              <div className="md:col-span-2">
                <FormField control={form.control} name="biography" render={({
                field
              }) => <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escreva uma breve biografia do artista, incluindo sua trajetória, conquistas e estilo musical..."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>
          </div>

          {/* Seção 2: Dados Pessoais */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              2. Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="full_name" render={({
              field
            }) => <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo conforme documento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="birth_date" render={({
              field
            }) => <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data ou digite</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={date => date > new Date() || date < new Date("1900-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                    
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="cpf_cnpj" render={({
              field
            }) => <FormItem>
                    <FormLabel>CPF / CNPJ *</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00 ou 00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="rg" render={({
              field
            }) => <FormItem>
                    <FormLabel>RG *</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="full_address" render={({
              field
            }) => <FormItem className="md:col-span-2">
                    <FormLabel>Endereço Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, bairro, cidade, estado, CEP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem>
                    <FormLabel>Número de Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>E-mail de Contato *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
          </div>

          {/* Seção 3: Dados Bancários */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              3. Dados Bancários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="bank" render={({
              field
            }) => <FormItem>
                    <FormLabel>Banco *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nubank">Nubank</SelectItem>
                        <SelectItem value="Santander">Santander</SelectItem>
                        <SelectItem value="Caixa">Caixa</SelectItem>
                        <SelectItem value="Itaú">Itaú</SelectItem>
                        <SelectItem value="PicPay">PicPay</SelectItem>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="agency" render={({
              field
            }) => <FormItem>
                    <FormLabel>Agência *</FormLabel>
                    <FormControl>
                      <Input placeholder="0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="account" render={({
              field
            }) => <FormItem>
                    <FormLabel>Conta com Dígito *</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="pix_key" render={({
              field
            }) => <FormItem>
                    <FormLabel>Chave Pix</FormLabel>
                    <FormControl>
                      <Input placeholder="CPF, e-mail, telefone ou chave aleatória" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="account_holder" render={({
              field
            }) => <FormItem className="md:col-span-2">
                    <FormLabel>Titular da Conta *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do titular da conta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
          </div>

          {/* Seção 4: Redes Sociais */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              4. Perfis e Redes Sociais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="spotify_profile" render={({
              field
            }) => <FormItem>
                    <FormLabel>Perfil Spotify</FormLabel>
                    <FormControl>
                      <Input placeholder="Se não tiver, será criado automaticamente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="instagram" render={({
              field
            }) => <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/perfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="youtube" render={({
              field
            }) => <FormItem>
                    <FormLabel>YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/channel/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="tiktok" render={({
              field
            }) => <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl>
                      <Input placeholder="https://tiktok.com/@perfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="soundcloud" render={({
              field
            }) => <FormItem className="md:col-span-2">
                    <FormLabel>SoundCloud</FormLabel>
                    <FormControl>
                      <Input placeholder="https://soundcloud.com/perfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
          </div>

          {/* Seção 5: Tipo de Perfil */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              5. Tipo de Perfil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="profile_type" render={({
              field
            }) => <FormItem>
                    <FormLabel>Tipo de Perfil *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Independente">Independente</SelectItem>
                        <SelectItem value="Com Empresário">Com Empresário</SelectItem>
                        <SelectItem value="Gravadora">Gravadora</SelectItem>
                        <SelectItem value="Editora">Editora</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />

              {showManagerFields && <>
                  <FormField control={form.control} name="manager_name" render={({
                field
              }) => <FormItem>
                        <FormLabel>Nome do Empresário</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="manager_phone" render={({
                field
              }) => <FormItem>
                        <FormLabel>Telefone do Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="manager_email" render={({
                field
              }) => <FormItem>
                        <FormLabel>E-mail do Responsável</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </>}
            </div>
          </div>

          {/* Seção 6: Distribuidoras */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2 text-white">
              6. Distribuidora / Agregadora
            </h3>
            <FormField control={form.control} name="distributors" render={({
            field
          }) => <FormItem>
                  <FormLabel>Selecione as distribuidoras</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {distributorOptions.map(distributor => <div key={distributor} className="flex items-center space-x-2">
                        <Checkbox id={distributor} checked={field.value?.includes(distributor) || false} onCheckedChange={checked => {
                  const current = field.value || [];
                  if (checked) {
                    const newValue = [...current, distributor];
                    field.onChange(newValue);
                    setSelectedDistributors(newValue);
                  } else {
                    const newValue = current.filter(item => item !== distributor);
                    field.onChange(newValue);
                    setSelectedDistributors(newValue);
                  }
                }} />
                        <label htmlFor={distributor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {distributor}
                        </label>
                      </div>)}
                  </div>
                  <FormMessage />
                </FormItem>} />

            {/* E-mails das distribuidoras selecionadas */}
            {selectedDistributors.length > 0 && <div className="space-y-4">
                <h4 className="font-medium">E-mails de Share das Distribuidoras</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDistributors.map(distributor => <FormField key={distributor} control={form.control} name={`distributor_emails.${distributor}` as any} render={({
                field
              }) => <FormItem>
                          <FormLabel>{distributor} - E-mail de Share</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={`email@${distributor.toLowerCase().replace(/\s+/g, '')}.com`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />)}
                </div>
              </div>}
          </div>

          {/* Seção 8: Observações */}
          <div className="space-y-6">
            <h3 className="text-xl border-b pb-2 font-semibold text-white">
              7. Observações
            </h3>
            <FormField control={form.control} name="observations" render={({
            field
          }) => <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Informações adicionais, notas especiais, etc." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? 'Salvando...' : artist ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>;
}