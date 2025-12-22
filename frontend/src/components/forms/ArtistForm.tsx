import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, X, FileText, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn, formatDateForDB } from '@/lib/utils';
import { Artist, ArtistInsert, ArtistUpdate } from '@/types/database';
import { useCreateArtist, useUpdateArtist } from '@/hooks/useArtists';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCrmContacts } from '@/hooks/useCrm';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ArtistSensitiveDataService } from '@/services/artistSensitiveData';

// Validação para CPF/CNPJ (formato brasileiro)
const cpfCnpjRegex = /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/;

// Validação para telefone brasileiro
const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;

// Validação para PIX (CPF, CNPJ, email, telefone ou chave aleatória)
const pixKeyRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\(\d{2}\)\s?\d{4,5}-?\d{4}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
const artistTypeOptions = ['Compositor', 'DJ', 'DJ / Produtor', 'Intérprete', 'Músico', 'Produtor', 'Banda'];

// Opções de funções para músicos
const musicianRoleOptions = [
  'Vocalista',
  'Backing vocal',
  'Guitarrista',
  'Baixista',
  'Baterista',
  'Tecladista',
  'Violonista',
  'Saxofonista',
  'Trompetista',
  'Violinista',
  'Percussionista',
  'DJ',
  'Produtor musical',
  'Diretor musical',
  'Arranjador',
  'Multi-instrumentista',
  'Outro'
];

const artistSchema = z.object({
  // Informações Básicas
  artistic_name: z.string().min(1, 'Nome artístico é obrigatório'),
  genre: z.string().min(1, 'Gênero musical é obrigatório'),
  music_language: z.string().optional(),
  artist_image: z.any().optional(),
  documents: z.any().optional(),
  presskit: z.any().optional(),
  biography: z.string().optional(),
  artist_types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de artista'),
  musician_roles: z.array(z.string()).optional(), // Funções do músico
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
  deezer: z.string().optional(),
  apple_music: z.string().optional(),
  // Tipo de Perfil e Dados do Responsável
  profile_type: z.string().min(1, 'Tipo de perfil é obrigatório'),
  record_label_name: z.string().optional(),
  label_contact_name: z.string().optional(),
  label_contact_phone: z.string().optional(),
  label_contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
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
const distributorOptions = ['CD Baby', 'Ditto Music', 'DistroKid', 'iMusics', 'ONErpm', 'Symphonic Distribution', 'TuneCore'];
const languageOptions = ['Alemão', 'Coreano', 'Espanhol', 'Francês', 'Inglês', 'Instrumental', 'Italiano', 'Japonês', 'Mandarim', 'Multilíngue', 'Outro', 'Português'];
const genreOptions = ['Afrobeat', 'Afrobeats', 'Alternative Rock', 'Ambient', 'Arrocha', 'Axé', 'Bachata', 'Baião', 'BeBop', 'Blues', 'Bluegrass', 'Bolero', 'Bossa Nova', 'Brega Funk', 'Britpop', 'Carimbó', 'Chillwave', 'Choro', 'City Pop', 'Classic Rock', 'Clássico', 'Country', 'Country Pop', 'Cumbia', 'Dancehall', 'Deep House', 'Downtempo', 'Drill', 'Drum and Bass', 'Dubstep', 'EDM', 'Electropop', 'Eletrônica', 'Emo', 'Experimental', 'Flamenco', 'Folk', 'Forró', 'Forró Eletrônico', 'Funk', 'Funk Carioca', 'Funk Melody', 'Fusion', 'Future Bass', 'Gospel', 'Grunge', 'Hard Bop', 'Hard Rock', 'Hardstyle', 'Heavy Metal', 'House', 'IDM', 'Indie', 'Indie Rock', 'Instrumental', 'J-pop', 'Jazz', 'K-pop', 'Lambada', 'Latin Jazz', 'Latin Pop', 'Lo-fi', 'Merengue', 'Metal', 'Minimal Techno', 'MPB', 'Música Religiosa', 'New Age', 'Ópera', 'Pagode', 'Pisadinha', 'Piseiro', 'Pop', 'Post-Punk', 'Post-Rock', 'Progressive House', 'Psytrance', 'Punk', 'Punk Rock', 'R&B', 'Rap/Hip-Hop', 'Reggae', 'Reggaeton', 'Rock', 'Salsa', 'Samba', 'Sertanejo', 'Sertanejo Universitário', 'Shoegaze', 'Ska', 'Smooth Jazz', 'Soul', 'Swing', 'Synthpop', 'Tango', 'Tech House', 'Techno', 'Trance', 'Trap', 'Trip Hop', 'World Music', 'Xote', 'Zouk'];
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
  const { data: crmContacts = [] } = useCrmContacts();
  const [showManagerFields, setShowManagerFields] = useState(false);
  const [showRecordLabelFields, setShowRecordLabelFields] = useState(false);
  const [selectedDistributors, setSelectedDistributors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(artist?.image_url || null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(artist?.documents_url ? 'Documento carregado' : null);
  const [presskitFile, setPresskitFile] = useState<File | null>(null);
  const [presskitName, setPresskitName] = useState<string | null>((artist as any)?.presskit_url ? 'Presskit carregado' : null);
  const [isUploadingPresskit, setIsUploadingPresskit] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [openContactPopover, setOpenContactPopover] = useState(false);
  const [openRecordLabelPopover, setOpenRecordLabelPopover] = useState(false);
  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      artistic_name: artist?.name || artist?.stage_name || '',
      genre: artist?.genre || '',
      music_language: '',
      artist_image: undefined,
      biography: artist?.bio || '',
      artist_types: (artist as any)?.artist_types || [],
      full_name: artist?.full_name || '',
      birth_date: artist?.birth_date ? new Date(artist.birth_date) : undefined,
      cpf_cnpj: '', // Loaded from artist_sensitive_data table (admin only)
      rg: '', // Loaded from artist_sensitive_data table (admin only)
      full_address: '', // Loaded from artist_sensitive_data table (admin only)
      phone: artist?.phone || '',
      email: artist?.email || '',
      bank: '', // Loaded from artist_sensitive_data table (admin only)
      agency: '', // Loaded from artist_sensitive_data table (admin only)
      account: '', // Loaded from artist_sensitive_data table (admin only)
      pix_key: '', // Loaded from artist_sensitive_data table (admin only)
      account_holder: '', // Loaded from artist_sensitive_data table (admin only)
      spotify_profile: artist?.spotify_url || '',
      instagram: artist?.instagram || '',
      youtube: artist?.youtube_url || '',
      tiktok: artist?.tiktok || '',
      soundcloud: artist?.soundcloud || '',
      deezer: (artist as any)?.deezer_url || '',
      apple_music: (artist as any)?.apple_music_url || '',
      profile_type: artist?.profile_type || '',
      record_label_name: (artist as any)?.record_label_name || '',
      label_contact_name: (artist as any)?.label_contact_name || '',
      label_contact_phone: (artist as any)?.label_contact_phone || '',
      label_contact_email: (artist as any)?.label_contact_email || '',
      manager_name: artist?.manager_name || '',
      manager_phone: artist?.manager_phone || '',
      manager_email: artist?.manager_email || '',
      distributors: artist?.distributors || [],
      distributor_emails: (artist?.distributor_emails as Record<string, string>) || {},
      observations: artist?.observations || ''
    }
  });

  // Initialize selected distributors from artist data
  React.useEffect(() => {
    if (artist?.distributors && Array.isArray(artist.distributors)) {
      setSelectedDistributors(artist.distributors);
    }
  }, [artist]);

  // Load sensitive data when editing an artist
  useEffect(() => {
    const loadSensitiveData = async () => {
      if (artist?.id) {
        try {
          const sensitiveData = await ArtistSensitiveDataService.getByArtistId(artist.id);
          if (sensitiveData) {
            form.setValue('cpf_cnpj', sensitiveData.cpf_cnpj || '');
            form.setValue('rg', sensitiveData.rg || '');
            form.setValue('full_address', sensitiveData.full_address || '');
            form.setValue('bank', sensitiveData.bank || '');
            form.setValue('agency', sensitiveData.agency || '');
            form.setValue('account', sensitiveData.account || '');
            form.setValue('pix_key', sensitiveData.pix_key || '');
            form.setValue('account_holder', sensitiveData.account_holder || '');
          }
        } catch (error) {
          console.error('Error loading sensitive data:', error);
        }
      }
    };
    loadSensitiveData();
  }, [artist?.id, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 5MB.',
          variant: 'destructive'
        });
        return;
      }
      setDocumentFile(file);
      setDocumentName(file.name);
      onChange(file);
      toast({
        title: 'Documento selecionado',
        description: `Arquivo "${file.name}" pronto para upload.`
      });
    }
  };

  const removeDocument = (onChange: (value: any) => void) => {
    setDocumentFile(null);
    setDocumentName(null);
    onChange(undefined);
  };

  const handlePresskitChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O Presskit deve ter no máximo 10MB.',
          variant: 'destructive'
        });
        return;
      }
      setPresskitFile(file);
      setPresskitName(file.name);
      onChange(file);
      toast({
        title: 'Presskit selecionado',
        description: `Arquivo "${file.name}" pronto para upload.`
      });
    }
  };

  const removePresskit = (onChange: (value: any) => void) => {
    setPresskitFile(null);
    setPresskitName(null);
    onChange(undefined);
  };

  const removeImage = (onChange: (value: any) => void) => {
    onChange(undefined);
    setImagePreview(null);
  };

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  // Watch profile_type to show/hide manager fields
  const profileType = form.watch('profile_type');
  const recordLabelName = form.watch('record_label_name');
  
  React.useEffect(() => {
    setShowManagerFields(profileType === 'Com Empresário' || profileType === 'Gravadora' || profileType === 'Editora');
    setShowRecordLabelFields(profileType === 'Gravadora');
  }, [profileType]);
  
  // Get unique companies from CRM contacts
  const uniqueCompanies = React.useMemo(() => {
    const companies = crmContacts
      .filter((contact: any) => contact.company && contact.company.trim() !== '')
      .map((contact: any) => contact.company.trim());
    return [...new Set(companies)].sort();
  }, [crmContacts]);
  
  // Filter CRM contacts by selected company (record label)
  const filteredCrmContacts = React.useMemo(() => {
    if (!recordLabelName || profileType !== 'Gravadora') return [];
    return crmContacts.filter((contact: any) => 
      contact.company?.toLowerCase() === recordLabelName.toLowerCase()
    );
  }, [crmContacts, recordLabelName, profileType]);
  
  const handleSelectRecordLabel = (companyName: string) => {
    form.setValue('record_label_name', companyName);
    // Clear manager fields when changing record label
    form.setValue('manager_name', '');
    form.setValue('manager_phone', '');
    form.setValue('manager_email', '');
    setOpenRecordLabelPopover(false);
  };
  
  const handleSelectCrmContact = (contactId: string) => {
    const contact = crmContacts.find((c: any) => c.id === contactId);
    if (contact) {
      form.setValue('manager_name', contact.name || '');
      form.setValue('manager_phone', contact.phone || '');
      form.setValue('manager_email', contact.email || '');
    }
    setOpenContactPopover(false);
  };
  
  const getManagerLabel = (field: 'name' | 'phone' | 'email') => {
    if (profileType === 'Com Empresário') {
      return field === 'name' ? 'Nome do Empresário' : field === 'phone' ? 'Telefone do Empresário' : 'E-mail do Empresário';
    }
    return field === 'name' ? 'Nome do Responsável' : field === 'phone' ? 'Telefone do Responsável' : 'E-mail do Responsável';
  };
  const onSubmit = async (data: ArtistFormData) => {
    try {
      let imageUrl = artist?.image_url || null;
      let documentsUrl = artist?.documents_url || null;
      let presskitUrl = (artist as any)?.presskit_url || null;

      // Upload imagem do artista se houver novo arquivo
      if (data.artist_image instanceof File) {
        setIsUploadingImage(true);
        try {
          imageUrl = await uploadFile(data.artist_image, 'avatars', 'artists');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: 'Erro no upload da imagem',
            description: 'Não foi possível fazer o upload da imagem. Tente novamente.',
            variant: 'destructive'
          });
          setIsUploadingImage(false);
          return;
        }
        setIsUploadingImage(false);
      }

      // Upload documento se houver novo arquivo
      if (documentFile) {
        setIsUploadingDocument(true);
        try {
          documentsUrl = await uploadFile(documentFile, 'artist-documents', 'documents');
        } catch (error) {
          console.error('Error uploading document:', error);
          toast({
            title: 'Erro no upload do documento',
            description: 'Não foi possível fazer o upload do documento. Tente novamente.',
            variant: 'destructive'
          });
          setIsUploadingDocument(false);
          return;
        }
        setIsUploadingDocument(false);
      }

      // Upload presskit se houver novo arquivo
      if (presskitFile) {
        setIsUploadingPresskit(true);
        try {
          presskitUrl = await uploadFile(presskitFile, 'artist-documents', 'presskits');
        } catch (error) {
          console.error('Error uploading presskit:', error);
          toast({
            title: 'Erro no upload do presskit',
            description: 'Não foi possível fazer o upload do presskit. Tente novamente.',
            variant: 'destructive'
          });
          setIsUploadingPresskit(false);
          return;
        }
        setIsUploadingPresskit(false);
      }

      // Artist data (non-sensitive fields only)
      const artistData = {
        name: data.artistic_name,
        genre: data.genre,
        bio: data.biography,
        full_name: data.full_name,
        birth_date: formatDateForDB(data.birth_date),
        phone: data.phone,
        email: data.email,
        spotify_url: data.spotify_profile || null,
        instagram: data.instagram || null,
        youtube_url: data.youtube || null,
        tiktok: data.tiktok || null,
        soundcloud: data.soundcloud || null,
        deezer_url: data.deezer || null,
        apple_music_url: data.apple_music || null,
        profile_type: data.profile_type,
        record_label_name: data.record_label_name || null,
        label_contact_name: data.label_contact_name || null,
        label_contact_phone: data.label_contact_phone || null,
        label_contact_email: data.label_contact_email || null,
        manager_name: data.manager_name || null,
        manager_phone: data.manager_phone || null,
        manager_email: data.manager_email || null,
        distributors: data.distributors || [],
        distributor_emails: data.distributor_emails || {},
        observations: data.observations || null,
        image_url: imageUrl,
        documents_url: documentsUrl,
        presskit_url: presskitUrl,
        artist_types: data.artist_types || [],
      };

      // Sensitive data stored separately (admin only access)
      const sensitiveData = {
        cpf_cnpj: data.cpf_cnpj || null,
        rg: data.rg || null,
        full_address: data.full_address || null,
        bank: data.bank || null,
        agency: data.agency || null,
        account: data.account || null,
        pix_key: data.pix_key || null,
        account_holder: data.account_holder || null,
      };
      
      let artistId: string;
      
      if (artist) {
        await updateArtist.mutateAsync({
          id: artist.id,
          data: artistData
        });
        artistId = artist.id;
      } else {
        const newArtist = await createArtist.mutateAsync(artistData);
        artistId = newArtist.id;
      }

      // Save sensitive data to artist_sensitive_data table
      try {
        await ArtistSensitiveDataService.upsert(artistId, sensitiveData);
      } catch (error) {
        console.error('Error saving sensitive data:', error);
        // Continue even if sensitive data fails (user may not have admin role)
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
  return <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
          {artist ? 'Editar Artista' : 'Cadastro de Artista'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Preencha todos os campos obrigatórios (*) para cadastrar o artista
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          
          {/* Seção 1: Informações Básicas */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold border-b pb-2 text-white">
              1. Informações Básicas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              {/* Tipo de Artista */}
              <FormField
                control={form.control}
                name="artist_types"
                render={() => (
                  <FormItem>
                    <div className="flex flex-wrap items-center gap-4">
                      <FormLabel className="mb-0">Tipo de Artista *</FormLabel>
                      {artistTypeOptions.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="artist_types"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type}
                                className="flex flex-row items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== type
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer mb-0">
                                  {type}
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

              <div className="md:col-span-2">
                <FormField control={form.control} name="documents" render={({
                field
              }) => <FormItem>
                      <FormLabel>Documentos Pessoais (PDF)</FormLabel>
                      <FormControl>
                        {documentName ? (
                          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{documentName}</p>
                              <p className="text-xs text-muted-foreground">Documento pronto para upload</p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeDocument(field.onChange)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para fazer upload ou arraste arquivos aqui
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Aceita apenas PDF (CNH/Identidade - máx. 5MB)
                            </p>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                              onChange={e => handleDocumentChange(e, field.onChange)} 
                            />
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>

              {/* Presskit/Midiakit */}
              <div className="md:col-span-2">
                <FormField control={form.control} name="presskit" render={({
                field
              }) => <FormItem>
                      <FormLabel>Presskit / Midiakit (PDF)</FormLabel>
                      <FormControl>
                        {presskitName ? (
                          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{presskitName}</p>
                              <p className="text-xs text-muted-foreground">Presskit pronto para upload</p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removePresskit(field.onChange)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Clique para fazer upload ou arraste o arquivo aqui
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Aceita apenas PDF (Presskit/Midiakit - máx. 10MB)
                            </p>
                            <input 
                              type="file" 
                              accept=".pdf" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                              onChange={e => handlePresskitChange(e, field.onChange)} 
                            />
                          </div>
                        )}
                      </FormControl>
                      <FormDescription>
                        Faça upload do Presskit ou Midiakit do artista em formato PDF
                      </FormDescription>
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
            }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="DD/MM/AAAA"
                        className="flex-1"
                        value={field.value ? format(field.value, "dd/MM/yyyy") : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          let formatted = value.replace(/\D/g, '');
                          if (formatted.length >= 2) {
                            formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
                          }
                          if (formatted.length >= 5) {
                            formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
                          }
                          e.target.value = formatted;
                          
                          if (formatted.length === 10) {
                            const [day, month, year] = formatted.split('/').map(Number);
                            const date = new Date(year, month - 1, day);
                            if (!isNaN(date.getTime()) && date <= new Date() && date >= new Date("1900-01-01")) {
                              field.onChange(date);
                            }
                          } else if (value === '') {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar 
                          mode="single" 
                          selected={field.value} 
                          onSelect={field.onChange} 
                          disabled={date => date > new Date() || date < new Date("1900-01-01")} 
                          initialFocus 
                          className={cn("p-3 pointer-events-auto")} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

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
                        <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                        <SelectItem value="Bradesco">Bradesco</SelectItem>
                        <SelectItem value="C6 Bank">C6 Bank</SelectItem>
                        <SelectItem value="Caixa">Caixa</SelectItem>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Itaú">Itaú</SelectItem>
                        <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                        <SelectItem value="Next">Next</SelectItem>
                        <SelectItem value="Nubank">Nubank</SelectItem>
                        <SelectItem value="Original">Original</SelectItem>
                        <SelectItem value="PagBank">PagBank</SelectItem>
                        <SelectItem value="PicPay">PicPay</SelectItem>
                        <SelectItem value="Safra">Safra</SelectItem>
                        <SelectItem value="Santander">Santander</SelectItem>
                        <SelectItem value="Sicoob">Sicoob</SelectItem>
                        <SelectItem value="Sicredi">Sicredi</SelectItem>
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
            }) => <FormItem>
                    <FormLabel>SoundCloud</FormLabel>
                    <FormControl>
                      <Input placeholder="https://soundcloud.com/perfil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="deezer" render={({
              field
            }) => <FormItem>
                    <FormLabel>Deezer</FormLabel>
                    <FormControl>
                      <Input placeholder="https://deezer.com/artist/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="apple_music" render={({
              field
            }) => <FormItem>
                    <FormLabel>Apple Music</FormLabel>
                    <FormControl>
                      <Input placeholder="https://music.apple.com/artist/..." {...field} />
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
                        <SelectItem value="Com Empresário">Com Empresário</SelectItem>
                        <SelectItem value="Editora">Editora</SelectItem>
                        <SelectItem value="Gravadora">Gravadora</SelectItem>
                        <SelectItem value="Independente">Independente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />

              {/* Campos específicos para Gravadora */}
              {showRecordLabelFields && (
                <FormField control={form.control} name="record_label_name" render={({
                  field
                }) => <FormItem className="flex flex-col">
                        <FormLabel>Nome da Gravadora</FormLabel>
                        <Popover open={openRecordLabelPopover} onOpenChange={setOpenRecordLabelPopover}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRecordLabelPopover}
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value || "Selecione uma gravadora do CRM"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar gravadora..." />
                              <CommandList>
                                <CommandEmpty>Nenhuma gravadora encontrada.</CommandEmpty>
                                <CommandGroup>
                                  {uniqueCompanies.map((company: string) => (
                                    <CommandItem
                                      key={company}
                                      value={company}
                                      onSelect={() => handleSelectRecordLabel(company)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === company ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span>{company}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>} />
              )}

              {/* Campos de Contato da Gravadora */}
              {showRecordLabelFields && (
                <>
                  <FormField control={form.control} name="label_contact_name" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Nome do Contato na Gravadora</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do contato responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                  <FormField control={form.control} name="label_contact_phone" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Telefone da Gravadora</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                  <FormField control={form.control} name="label_contact_email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>E-mail da Gravadora</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@gravadora.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                </>
              )}

              {showManagerFields && <>
                  {/* Campo Nome do Responsável com dropdown do CRM para Gravadora */}
                  {showRecordLabelFields ? (
                    <FormField control={form.control} name="manager_name" render={({
                      field
                    }) => <FormItem className="flex flex-col">
                            <FormLabel>{getManagerLabel('name')}</FormLabel>
                            <Popover open={openContactPopover} onOpenChange={setOpenContactPopover}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openContactPopover}
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value || "Selecione um contato do CRM"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Buscar contato..." />
                                  <CommandList>
                                    <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
                                    <CommandGroup>
                                      {filteredCrmContacts.map((contact: any) => (
                                        <CommandItem
                                          key={contact.id}
                                          value={contact.name}
                                          onSelect={() => handleSelectCrmContact(contact.id)}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === contact.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span>{contact.name}</span>
                                            {contact.company && (
                                              <span className="text-xs text-muted-foreground">{contact.company}</span>
                                            )}
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>} />
                  ) : (
                    <FormField control={form.control} name="manager_name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>{getManagerLabel('name')}</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                  )}

                  <FormField control={form.control} name="manager_phone" render={({
                field
              }) => <FormItem>
                        <FormLabel>{getManagerLabel('phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="manager_email" render={({
                field
              }) => <FormItem>
                        <FormLabel>{getManagerLabel('email')}</FormLabel>
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
            <Button 
              type="submit" 
              disabled={isLoading || isUploadingDocument || isUploadingImage} 
              className="min-w-[120px]"
            >
              {(isLoading || isUploadingDocument || isUploadingImage) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploadingDocument ? 'Enviando documento...' : isUploadingImage ? 'Enviando imagem...' : 'Salvando...'}
                </>
              ) : artist ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>;
}