import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, Plus, Trash2, ChevronLeft, ChevronRight, Check, 
  Music, User, Disc, AlertCircle, FileText, Image as ImageIcon, Search, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// COMPONENTE: BUSCA DE ARTISTAS
// ============================================

interface ArtistSearchResult {
  id: string;
  name: string;
  stage_name: string;
}

interface ArtistSearchProps {
  selectedArtists: ArtistSearchResult[];
  onSelect: (artist: ArtistSearchResult) => void;
  onRemove: (artistId: string) => void;
  registeredArtists: RegisteredArtist[];
  placeholder?: string;
}

function ArtistSearch({ selectedArtists, onSelect, onRemove, registeredArtists, placeholder = "Digite o nome do artista..." }: ArtistSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ArtistSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Buscar artistas no banco de dados
  const searchArtists = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Primeiro, adiciona os artistas registrados na sessão atual que correspondem à busca
      const localResults = registeredArtists
        .filter(a => 
          a.artistic_name.toLowerCase().includes(term.toLowerCase()) ||
          a.full_name.toLowerCase().includes(term.toLowerCase())
        )
        .map(a => ({
          id: a.id,
          name: a.full_name,
          stage_name: a.artistic_name,
        }));

      // Depois busca no banco de dados
      const { data, error } = await supabase
        .from('artists')
        .select('id, name, stage_name')
        .or(`name.ilike.%${term}%,stage_name.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;

      // Combina resultados locais com os do banco, removendo duplicatas
      const dbResults = (data || []).map(a => ({
        id: a.id,
        name: a.name || '',
        stage_name: a.stage_name || '',
      }));

      const allResults = [...localResults];
      dbResults.forEach(dbArtist => {
        if (!allResults.some(a => a.id === dbArtist.id)) {
          allResults.push(dbArtist);
        }
      });

      // Remove artistas já selecionados
      const filteredResults = allResults.filter(
        a => !selectedArtists.some(selected => selected.id === a.id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching artists:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [registeredArtists, selectedArtists]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchArtists(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchArtists]);

  return (
    <div className="space-y-3">
      {/* Artistas selecionados */}
      {selectedArtists.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge key={artist.id} variant="secondary" className="flex items-center gap-1 py-1 px-3">
              <User className="h-3 w-3" />
              <span>{artist.stage_name || artist.name}</span>
              <button
                type="button"
                onClick={() => onRemove(artist.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Resultados da busca */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchResults.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => {
                  onSelect(artist);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b last:border-b-0"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{artist.stage_name || 'Sem nome artístico'}</p>
                  <p className="text-sm text-muted-foreground">{artist.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensagem quando não encontra */}
        {showResults && searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
            Nenhum artista encontrado
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// CONSTANTES E OPÇÕES
// ============================================

const genreOptions = ['Afrobeat', 'Afrobeats', 'Alternative Rock', 'Ambient', 'Arrocha', 'Axé', 'Bachata', 'Baião', 'Blues', 'Bossa Nova', 'Brega Funk', 'Choro', 'Country', 'Cumbia', 'Dancehall', 'Deep House', 'Drill', 'Dubstep', 'EDM', 'Eletrônica', 'Emo', 'Experimental', 'Flamenco', 'Folk', 'Forró', 'Funk', 'Funk Carioca', 'Gospel', 'Grunge', 'Hard Rock', 'Heavy Metal', 'Hip-Hop', 'House', 'Indie', 'Instrumental', 'Jazz', 'K-pop', 'Lo-fi', 'Metal', 'MPB', 'Música Religiosa', 'Pagode', 'Piseiro', 'Pop', 'Punk', 'R&B', 'Rap', 'Reggae', 'Reggaeton', 'Rock', 'Samba', 'Sertanejo', 'Soul', 'Techno', 'Trance', 'Trap', 'World Music'];

const artistTypeOptions = ['Banda', 'DJ', 'Duo', 'Produtor', 'Solo'];

const bankOptions = ['Banco do Brasil', 'Bradesco', 'C6 Bank', 'Caixa', 'Inter', 'Itaú', 'Mercado Pago', 'Next', 'Nubank', 'Original', 'PagBank', 'PicPay', 'Safra', 'Santander', 'Sicoob', 'Sicredi', 'Outros'];

const accountTypeOptions = ['Conta Corrente', 'Conta Poupança', 'Conta Pagamento'];

const affiliationOptions = ['Abramus', 'Amar', 'Assim', 'ECAD', 'Sbacem', 'Sicam', 'Socinpro', 'UBC', 'Outra', 'Nenhuma'];

const languageOptions = ['Alemão', 'Coreano', 'Espanhol', 'Francês', 'Inglês', 'Instrumental', 'Italiano', 'Japonês', 'Mandarim', 'Português', 'Outro'];

const authorRoleOptions = ['Autor', 'Compositor', 'Versionista'];

const editorialContractOptions = ['Administração', 'Exclusivo', 'Subedição'];

const phonogramVersionOptions = ['Acústica', 'Ao vivo', 'Instrumental', 'Original', 'Remix'];

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const artistSchema = z.object({
  // Dados Básicos
  photo: z.any().optional(),
  artistic_name: z.string().min(1, 'Nome artístico é obrigatório'),
  genre: z.string().min(1, 'Gênero musical é obrigatório'),
  artist_type: z.string().min(1, 'Tipo de artista é obrigatório'),
  
  // Dados Pessoais
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  birth_date: z.string().optional(),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  
  // Dados Bancários
  bank: z.string().min(1, 'Banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  account_type: z.string().min(1, 'Tipo de conta é obrigatório'),
  pix_key: z.string().optional(),
  
  // Perfis Digitais
  spotify_url: z.string().optional(),
  instagram_url: z.string().optional(),
  youtube_url: z.string().optional(),
  tiktok_url: z.string().optional(),
  other_links: z.string().optional(),
  
  // Representação
  has_manager: z.boolean().default(false),
  manager_name: z.string().optional(),
  manager_phone: z.string().optional(),
  manager_email: z.string().optional(),
  
  has_record_label: z.boolean().default(false),
  label_contact_name: z.string().optional(),
  label_contact_phone: z.string().optional(),
  label_contact_email: z.string().optional(),
  
  has_publisher: z.boolean().default(false),
  publisher_contact_name: z.string().optional(),
  publisher_contact_phone: z.string().optional(),
  publisher_contact_email: z.string().optional(),
  
  // Dados Editoriais
  affiliation: z.string().optional(),
  ipi: z.string().optional(),
  isni: z.string().optional(),
  
  // Consentimentos
  lgpd_consent: z.boolean().refine(val => val === true, 'Você deve aceitar os termos LGPD'),
  ownership_declaration: z.boolean().refine(val => val === true, 'Você deve declarar a titularidade'),
});

const workAuthorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  percentage: z.number().min(0).max(100),
});

const workSchema = z.object({
  artist_ids: z.array(z.string()).min(1, 'Selecione pelo menos um artista'),
  title: z.string().min(1, 'Título é obrigatório'),
  language: z.string().min(1, 'Idioma é obrigatório'),
  genre: z.string().min(1, 'Gênero é obrigatório'),
  iswc: z.string().optional(),
  
  authors: z.array(workAuthorSchema).min(1, 'Adicione pelo menos um autor'),
  
  has_publisher: z.boolean().default(false),
  publisher_name: z.string().optional(),
  contract_type: z.string().optional(),
  
  lyrics_file: z.any().optional(),
  demo_file: z.any().optional(),
  
  is_original: z.boolean().default(true),
  editorial_representation: z.boolean().refine(val => val === true, 'Você deve aceitar a representação editorial'),
});

const phonogramSchema = z.object({
  work_id: z.string().min(1, 'Selecione uma obra'),
  artist_ids: z.array(z.string()).min(1, 'Selecione pelo menos um artista'),
  
  title: z.string().min(1, 'Título é obrigatório'),
  version: z.string().min(1, 'Versão é obrigatória'),
  isrc: z.string().optional(),
  
  main_interpreter: z.string().min(1, 'Intérprete principal é obrigatório'),
  phonographic_producer: z.string().optional(),
  featured_artists: z.string().optional(),
  
  audio_file: z.any().optional(),
  cover_file: z.any().optional(),
  synced_lyrics_file: z.any().optional(),
  
  master_rights_declaration: z.boolean().refine(val => val === true, 'Você deve declarar os direitos do master'),
  exploitation_authorization: z.boolean().refine(val => val === true, 'Você deve autorizar a exploração'),
});

// ============================================
// TIPOS
// ============================================

type ArtistFormData = z.infer<typeof artistSchema>;
type WorkFormData = z.infer<typeof workSchema>;
type PhonogramFormData = z.infer<typeof phonogramSchema>;

interface RegisteredArtist {
  id: string;
  artistic_name: string;
  full_name: string;
}

interface RegisteredWork {
  id: string;
  title: string;
  artist_ids: string[];
}

// Interface para obra pendente (antes de salvar no banco)
interface PendingWork {
  tempId: string;
  title: string;
  language: string;
  genre: string;
  iswc?: string;
  authors: { name: string; role: string; percentage: number }[];
  artists: ArtistSearchResult[];
  has_publisher: boolean;
  publisher_name?: string;
  contract_type?: string;
  is_original: boolean;
}

// Interface para fonograma pendente (antes de salvar no banco)
interface PendingPhonogram {
  tempId: string;
  title: string;
  version: string;
  isrc?: string;
  work_id: string;
  work_title: string;
  artists: ArtistSearchResult[];
  main_interpreter: string;
  phonographic_producer?: string;
  featured_artists?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CadastroPublico() {
  const { toast } = useToast();
  const [submissionId] = useState(() => uuidv4());
  
  // Estados de seleção
  const [selectedForms, setSelectedForms] = useState({
    artist: false,
    work: false,
    phonogram: false,
  });
  
  // Estado da etapa atual
  const [currentStep, setCurrentStep] = useState<'selection' | 'artist' | 'work' | 'phonogram' | 'success'>('selection');
  
  // Dados registrados
  const [registeredArtists, setRegisteredArtists] = useState<RegisteredArtist[]>([]);
  const [registeredWorks, setRegisteredWorks] = useState<RegisteredWork[]>([]);
  const [registeredPhonograms, setRegisteredPhonograms] = useState<string[]>([]);
  
  // Estados de loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Progresso
  const calculateProgress = () => {
    const steps = [];
    if (selectedForms.artist) steps.push('artist');
    if (selectedForms.work) steps.push('work');
    if (selectedForms.phonogram) steps.push('phonogram');
    
    if (currentStep === 'selection') return 0;
    if (currentStep === 'success') return 100;
    
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex === -1) return 0;
    
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  };

  // Validar se pode avançar
  const canProceedToWork = () => {
    if (!selectedForms.work) return true;
    return registeredArtists.length > 0;
  };

  const canProceedToPhonogram = () => {
    if (!selectedForms.phonogram) return true;
    return registeredWorks.length > 0;
  };

  // Navegação
  const handleFormSelection = () => {
    if (!selectedForms.artist && !selectedForms.work && !selectedForms.phonogram) {
      toast({
        title: 'Seleção necessária',
        description: 'Selecione pelo menos um tipo de cadastro.',
        variant: 'destructive',
      });
      return;
    }

    // Validar dependências
    if ((selectedForms.work || selectedForms.phonogram) && !selectedForms.artist && registeredArtists.length === 0) {
      toast({
        title: 'Artista necessário',
        description: 'Para cadastrar Obra ou Fonograma, é necessário ter um Artista cadastrado.',
        variant: 'destructive',
      });
      setSelectedForms(prev => ({ ...prev, artist: true }));
    }

    if (selectedForms.phonogram && !selectedForms.work && registeredWorks.length === 0) {
      toast({
        title: 'Obra necessária',
        description: 'Para cadastrar Fonograma, é necessário ter uma Obra cadastrada.',
        variant: 'destructive',
      });
      setSelectedForms(prev => ({ ...prev, work: true }));
    }

    // Ir para primeira etapa
    if (selectedForms.artist) {
      setCurrentStep('artist');
    } else if (selectedForms.work) {
      setCurrentStep('work');
    } else if (selectedForms.phonogram) {
      setCurrentStep('phonogram');
    }
  };

  const goToNextStep = () => {
    if (currentStep === 'artist') {
      if (selectedForms.work) {
        setCurrentStep('work');
      } else if (selectedForms.phonogram) {
        setCurrentStep('phonogram');
      } else {
        setCurrentStep('success');
      }
    } else if (currentStep === 'work') {
      if (selectedForms.phonogram) {
        setCurrentStep('phonogram');
      } else {
        setCurrentStep('success');
      }
    } else if (currentStep === 'phonogram') {
      setCurrentStep('success');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'work') {
      if (selectedForms.artist) {
        setCurrentStep('artist');
      } else {
        setCurrentStep('selection');
      }
    } else if (currentStep === 'phonogram') {
      if (selectedForms.work) {
        setCurrentStep('work');
      } else if (selectedForms.artist) {
        setCurrentStep('artist');
      } else {
        setCurrentStep('selection');
      }
    } else if (currentStep === 'artist') {
      setCurrentStep('selection');
    }
  };

  // Salvar no localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`public_submission_${submissionId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setRegisteredArtists(data.artists || []);
        setRegisteredWorks(data.works || []);
        setRegisteredPhonograms(data.phonograms || []);
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    }
  }, [submissionId]);

  useEffect(() => {
    localStorage.setItem(`public_submission_${submissionId}`, JSON.stringify({
      artists: registeredArtists,
      works: registeredWorks,
      phonograms: registeredPhonograms,
    }));
  }, [registeredArtists, registeredWorks, registeredPhonograms, submissionId]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cadastro Público</h1>
          <p className="text-muted-foreground">
            Preencha os formulários para cadastrar artistas, obras e fonogramas
          </p>
        </div>

        {/* Barra de Progresso */}
        {currentStep !== 'selection' && currentStep !== 'success' && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}

        {/* Conteúdo */}
        {currentStep === 'selection' && (
          <SelectionStep 
            selectedForms={selectedForms}
            setSelectedForms={setSelectedForms}
            onContinue={handleFormSelection}
          />
        )}

        {currentStep === 'artist' && (
          <ArtistStep
            submissionId={submissionId}
            onArtistRegistered={(artist) => {
              setRegisteredArtists(prev => [...prev, artist]);
              toast({
                title: 'Artista cadastrado!',
                description: `${artist.artistic_name} foi adicionado com sucesso.`,
              });
            }}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            registeredArtists={registeredArtists}
          />
        )}

        {currentStep === 'work' && (
          <WorkStep
            submissionId={submissionId}
            registeredArtists={registeredArtists}
            onWorkRegistered={(work) => {
              setRegisteredWorks(prev => [...prev, work]);
              toast({
                title: 'Obra cadastrada!',
                description: `"${work.title}" foi adicionada com sucesso.`,
              });
            }}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            registeredWorks={registeredWorks}
          />
        )}

        {currentStep === 'phonogram' && (
          <PhonogramStep
            submissionId={submissionId}
            registeredArtists={registeredArtists}
            registeredWorks={registeredWorks}
            onPhonogramRegistered={(title) => {
              setRegisteredPhonograms(prev => [...prev, title]);
              toast({
                title: 'Fonograma cadastrado!',
                description: `"${title}" foi adicionado com sucesso.`,
              });
            }}
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
            registeredPhonograms={registeredPhonograms}
          />
        )}

        {currentStep === 'success' && (
          <SuccessStep
            submissionId={submissionId}
            registeredArtists={registeredArtists}
            registeredWorks={registeredWorks}
            registeredPhonograms={registeredPhonograms}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: SELEÇÃO INICIAL
// ============================================

function SelectionStep({ 
  selectedForms, 
  setSelectedForms, 
  onContinue 
}: {
  selectedForms: { artist: boolean; work: boolean; phonogram: boolean };
  setSelectedForms: React.Dispatch<React.SetStateAction<{ artist: boolean; work: boolean; phonogram: boolean }>>;
  onContinue: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Selecione o tipo de cadastro
        </CardTitle>
        <CardDescription>
          Você pode selecionar um ou mais tipos de cadastro. Os formulários serão apresentados em sequência.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {/* Artista */}
          <label className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
            selectedForms.artist ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
          )}>
            <Checkbox
              checked={selectedForms.artist}
              onCheckedChange={(checked) => setSelectedForms(prev => ({ ...prev, artist: !!checked }))}
            />
            <User className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Cadastro de Artista</h3>
              <p className="text-sm text-muted-foreground">
                Dados pessoais, bancários e perfis digitais do artista
              </p>
            </div>
          </label>

          {/* Obra */}
          <label className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
            selectedForms.work ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
          )}>
            <Checkbox
              checked={selectedForms.work}
              onCheckedChange={(checked) => setSelectedForms(prev => ({ ...prev, work: !!checked }))}
            />
            <Music className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Cadastro de Obra</h3>
              <p className="text-sm text-muted-foreground">
                Informações da composição musical, autores e participantes
              </p>
            </div>
          </label>

          {/* Fonograma */}
          <label className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
            selectedForms.phonogram ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
          )}>
            <Checkbox
              checked={selectedForms.phonogram}
              onCheckedChange={(checked) => setSelectedForms(prev => ({ ...prev, phonogram: !!checked }))}
            />
            <Disc className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Cadastro de Fonograma</h3>
              <p className="text-sm text-muted-foreground">
                Gravação da obra, arquivos de áudio e metadados
              </p>
            </div>
          </label>
        </div>

        {/* Aviso de dependências */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">Importante:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Obra requer um Artista cadastrado</li>
                <li>Fonograma requer uma Obra cadastrada</li>
                <li>Os formulários seguem a ordem: Artista → Obra → Fonograma</li>
              </ul>
            </div>
          </div>
        </div>

        <Button onClick={onContinue} className="w-full" size="lg">
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: FORMULÁRIO DE ARTISTA
// ============================================

function ArtistStep({
  submissionId,
  onArtistRegistered,
  onContinue,
  onBack,
  registeredArtists,
}: {
  submissionId: string;
  onArtistRegistered: (artist: RegisteredArtist) => void;
  onContinue: () => void;
  onBack: () => void;
  registeredArtists: RegisteredArtist[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      has_manager: false,
      has_record_label: false,
      has_publisher: false,
      lgpd_consent: false,
      ownership_declaration: false,
    },
  });

  const hasManager = form.watch('has_manager');
  const hasRecordLabel = form.watch('has_record_label');
  const hasPublisher = form.watch('has_publisher');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photo', file);
    }
  };

  const onSubmit = async (data: ArtistFormData) => {
    setIsSubmitting(true);
    try {
      // Upload da foto se existir
      let photoUrl = null;
      if (data.photo instanceof File) {
        const fileExt = data.photo.name.split('.').pop();
        const fileName = `${submissionId}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`public/${fileName}`, data.photo);
        
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
          photoUrl = urlData.publicUrl;
        }
      }

      // Salvar artista
      const { data: artistData, error } = await supabase
        .from('artists')
        .insert({
          stage_name: data.artistic_name,
          name: data.full_name,
          genre: data.genre,
          email: data.email,
          phone: data.phone,
          image_url: photoUrl,
          spotify_url: data.spotify_url,
          instagram_url: data.instagram_url,
          youtube_url: data.youtube_url,
          tiktok: data.tiktok_url,
          contract_status: 'Pré-cadastro',
          observations: `[CADASTRO PÚBLICO]\nProtocolo: ${submissionId}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nHas Manager: ${data.has_manager ? 'Sim' : 'Não'}\nHas Record Label: ${data.has_record_label ? 'Sim' : 'Não'}\nHas Publisher: ${data.has_publisher ? 'Sim' : 'Não'}\nAfiliação: ${data.affiliation || 'Não informada'}\nIPI: ${data.ipi || 'Não informado'}\nISNI: ${data.isni || 'Não informado'}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Salvar dados sensíveis
      await supabase.from('artist_sensitive_data').insert({
        artist_id: artistData.id,
        cpf_cnpj: data.cpf_cnpj,
        full_address: data.address,
        bank: data.bank,
        agency: data.agency,
        account: data.account,
        pix_key: data.pix_key,
        phone: data.phone,
        email: data.email,
      });

      onArtistRegistered({
        id: artistData.id,
        artistic_name: data.artistic_name,
        full_name: data.full_name,
      });

      form.reset();
      setPhotoPreview(null);

    } catch (error: any) {
      console.error('Error saving artist:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o artista.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Cadastro de Artista
        </CardTitle>
        <CardDescription>
          Preencha os dados do artista. Campos marcados com * são obrigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Artistas já cadastrados */}
          {registeredArtists.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-600 mb-2">Artistas cadastrados nesta sessão:</h4>
              <ul className="space-y-1">
                {registeredArtists.map((artist) => (
                  <li key={artist.id} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {artist.artistic_name} ({artist.full_name})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* A. Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">A. Dados Básicos</h3>
            
            {/* Foto */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <Label htmlFor="photo" className="cursor-pointer">
                <span className="text-primary hover:underline">Carregar foto do artista</span>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artistic_name">Nome Artístico *</Label>
                <Input
                  id="artistic_name"
                  {...form.register('artistic_name')}
                  placeholder="Nome usado profissionalmente"
                />
                {form.formState.errors.artistic_name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.artistic_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="genre">Gênero Musical *</Label>
                <Select onValueChange={(value) => form.setValue('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.genre && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.genre.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="artist_type">Tipo *</Label>
                <Select onValueChange={(value) => form.setValue('artist_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {artistTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.artist_type && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.artist_type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* B. Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">B. Dados Pessoais</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...form.register('full_name')}
                  placeholder="Nome conforme documento"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cpf_cnpj">CPF / CNPJ *</Label>
                <Input
                  id="cpf_cnpj"
                  {...form.register('cpf_cnpj')}
                  placeholder="000.000.000-00"
                />
                {form.formState.errors.cpf_cnpj && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.cpf_cnpj.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  {...form.register('birth_date')}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="email@exemplo.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="(00) 00000-0000"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço Completo *</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* C. Dados Bancários */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">C. Dados Bancários</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank">Banco *</Label>
                <Select onValueChange={(value) => form.setValue('bank', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.bank && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.bank.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="agency">Agência *</Label>
                <Input
                  id="agency"
                  {...form.register('agency')}
                  placeholder="0000"
                />
                {form.formState.errors.agency && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.agency.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="account">Conta *</Label>
                <Input
                  id="account"
                  {...form.register('account')}
                  placeholder="00000-0"
                />
                {form.formState.errors.account && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.account.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="account_type">Tipo de Conta *</Label>
                <Select onValueChange={(value) => form.setValue('account_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.account_type && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.account_type.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  {...form.register('pix_key')}
                  placeholder="CPF, email, telefone ou chave aleatória"
                />
              </div>
            </div>
          </div>

          {/* D. Perfis Digitais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">D. Perfis Digitais</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spotify_url">Spotify (URL)</Label>
                <Input
                  id="spotify_url"
                  {...form.register('spotify_url')}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram (URL)</Label>
                <Input
                  id="instagram_url"
                  {...form.register('instagram_url')}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube (URL)</Label>
                <Input
                  id="youtube_url"
                  {...form.register('youtube_url')}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label htmlFor="tiktok_url">TikTok (URL)</Label>
                <Input
                  id="tiktok_url"
                  {...form.register('tiktok_url')}
                  placeholder="https://tiktok.com/@..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="other_links">Outros links</Label>
                <Textarea
                  id="other_links"
                  {...form.register('other_links')}
                  placeholder="Outros links relevantes (um por linha)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* E. Representação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">E. Representação</h3>
            <p className="text-sm text-muted-foreground">Selecione o tipo de representação do artista (apenas uma opção)</p>
            
            <div className="space-y-3">
              {/* Opção: Nenhuma */}
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                !hasManager && !hasRecordLabel && !hasPublisher
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-muted-foreground/50"
              )}>
                <input
                  type="radio"
                  name="representation"
                  checked={!hasManager && !hasRecordLabel && !hasPublisher}
                  onChange={() => {
                    form.setValue('has_manager', false);
                    form.setValue('has_record_label', false);
                    form.setValue('has_publisher', false);
                  }}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Independente</p>
                  <p className="text-sm text-muted-foreground">Sem empresário, gravadora ou editora</p>
                </div>
              </label>

              {/* Opção: Empresário */}
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                hasManager ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
              )}>
                <input
                  type="radio"
                  name="representation"
                  checked={hasManager}
                  onChange={() => {
                    form.setValue('has_manager', true);
                    form.setValue('has_record_label', false);
                    form.setValue('has_publisher', false);
                  }}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Empresário</p>
                  <p className="text-sm text-muted-foreground">Possui representação por empresário</p>
                </div>
              </label>

              {hasManager && (
                <div className="grid md:grid-cols-3 gap-4 pl-6 border-l-2 border-primary/30 ml-4">
                  <div>
                    <Label>Nome do empresário</Label>
                    <Input {...form.register('manager_name')} placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input {...form.register('manager_phone')} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input {...form.register('manager_email')} type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
              )}

              {/* Opção: Gravadora */}
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                hasRecordLabel ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
              )}>
                <input
                  type="radio"
                  name="representation"
                  checked={hasRecordLabel}
                  onChange={() => {
                    form.setValue('has_manager', false);
                    form.setValue('has_record_label', true);
                    form.setValue('has_publisher', false);
                  }}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Gravadora</p>
                  <p className="text-sm text-muted-foreground">Vinculado a uma gravadora</p>
                </div>
              </label>

              {hasRecordLabel && (
                <div className="grid md:grid-cols-3 gap-4 pl-6 border-l-2 border-primary/30 ml-4">
                  <div>
                    <Label>Nome do responsável</Label>
                    <Input {...form.register('label_contact_name')} placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input {...form.register('label_contact_phone')} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input {...form.register('label_contact_email')} type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
              )}

              {/* Opção: Editora */}
              <label className={cn(
                "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                hasPublisher ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
              )}>
                <input
                  type="radio"
                  name="representation"
                  checked={hasPublisher}
                  onChange={() => {
                    form.setValue('has_manager', false);
                    form.setValue('has_record_label', false);
                    form.setValue('has_publisher', true);
                  }}
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium">Editora</p>
                  <p className="text-sm text-muted-foreground">Vinculado a uma editora musical</p>
                </div>
              </label>

              {hasPublisher && (
                <div className="grid md:grid-cols-3 gap-4 pl-6 border-l-2 border-primary/30 ml-4">
                  <div>
                    <Label>Nome do responsável</Label>
                    <Input {...form.register('publisher_contact_name')} placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input {...form.register('publisher_contact_phone')} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input {...form.register('publisher_contact_email')} type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* F. Dados Editoriais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">F. Dados Editoriais</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="affiliation">Filiação</Label>
                <Select onValueChange={(value) => form.setValue('affiliation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {affiliationOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ipi">IPI</Label>
                <Input
                  id="ipi"
                  {...form.register('ipi')}
                  placeholder="Código IPI"
                />
              </div>

              <div>
                <Label htmlFor="isni">ISNI</Label>
                <Input
                  id="isni"
                  {...form.register('isni')}
                  placeholder="Código ISNI"
                />
              </div>
            </div>
          </div>

          {/* G. Consentimentos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">G. Consentimentos (Obrigatórios)</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="lgpd_consent"
                  checked={form.watch('lgpd_consent')}
                  onCheckedChange={(checked) => form.setValue('lgpd_consent', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="lgpd_consent" className="cursor-pointer">
                    Aceite LGPD *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Autorizo o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados.
                  </p>
                </div>
              </div>
              {form.formState.errors.lgpd_consent && (
                <p className="text-sm text-destructive">{form.formState.errors.lgpd_consent.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="ownership_declaration"
                  checked={form.watch('ownership_declaration')}
                  onCheckedChange={(checked) => form.setValue('ownership_declaration', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="ownership_declaration" className="cursor-pointer">
                    Declaração de titularidade *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Declaro que sou titular ou tenho autorização para fornecer todas as informações aqui prestadas.
                  </p>
                </div>
              </div>
              {form.formState.errors.ownership_declaration && (
                <p className="text-sm text-destructive">{form.formState.errors.ownership_declaration.message}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Artista'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>

              {registeredArtists.length > 0 && (
                <Button type="button" onClick={onContinue}>
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: FORMULÁRIO DE OBRA
// ============================================

function WorkStep({
  submissionId,
  registeredArtists,
  onWorkRegistered,
  onContinue,
  onBack,
  registeredWorks,
}: {
  submissionId: string;
  registeredArtists: RegisteredArtist[];
  onWorkRegistered: (work: RegisteredWork) => void;
  onContinue: () => void;
  onBack: () => void;
  registeredWorks: RegisteredWork[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArtistsList, setSelectedArtistsList] = useState<ArtistSearchResult[]>([]);
  const [authors, setAuthors] = useState<{ name: string; role: string; percentage: number }[]>([
    { name: '', role: '', percentage: 100 }
  ]);

  const form = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      artist_ids: [],
      authors: [{ name: '', role: '', percentage: 100 }],
      has_publisher: false,
      is_original: true,
      editorial_representation: false,
    },
  });

  const hasPublisher = form.watch('has_publisher');

  // Atualizar form quando artistas são selecionados
  useEffect(() => {
    form.setValue('artist_ids', selectedArtistsList.map(a => a.id));
  }, [selectedArtistsList, form]);

  const handleSelectArtist = (artist: ArtistSearchResult) => {
    setSelectedArtistsList(prev => [...prev, artist]);
  };

  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtistsList(prev => prev.filter(a => a.id !== artistId));
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', role: '', percentage: 0 }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: string, value: any) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
    form.setValue('authors', newAuthors);
  };

  const totalPercentage = authors.reduce((sum, a) => sum + (a.percentage || 0), 0);

  const onSubmit = async (data: WorkFormData) => {
    if (selectedArtistsList.length === 0) {
      toast({
        title: 'Artista obrigatório',
        description: 'Selecione pelo menos um artista vinculado.',
        variant: 'destructive',
      });
      return;
    }

    if (totalPercentage !== 100) {
      toast({
        title: 'Percentual inválido',
        description: 'A soma dos percentuais dos autores deve ser igual a 100%.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: workData, error } = await supabase
        .from('music_registry')
        .insert({
          title: data.title,
          genre: data.genre,
          iswc: data.iswc,
          language: data.language,
          status: 'Pendente Validação',
          participants: authors,
          artist_id: selectedArtistsList[0]?.id,
          observations: `[CADASTRO PÚBLICO]\nProtocolo: ${submissionId}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nEditora: ${data.has_publisher ? data.publisher_name : 'Sem editora'}\nTipo Contrato: ${data.contract_type || 'N/A'}\nObra Original: ${data.is_original ? 'Sim' : 'Não'}\nArtistas: ${selectedArtistsList.map(a => a.stage_name || a.name).join(', ')}`,
        })
        .select()
        .single();

      if (error) throw error;

      onWorkRegistered({
        id: workData.id,
        title: data.title,
        artist_ids: selectedArtistsList.map(a => a.id),
      });

      // Reset form
      form.reset();
      setSelectedArtistsList([]);
      setAuthors([{ name: '', role: '', percentage: 100 }]);

    } catch (error: any) {
      console.error('Error saving work:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar a obra.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Cadastro de Obra
        </CardTitle>
        <CardDescription>
          Cadastre as informações da composição musical. Você pode adicionar várias obras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Obras já cadastradas */}
          {registeredWorks.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-600 mb-2">Obras cadastradas nesta sessão ({registeredWorks.length}):</h4>
              <ul className="space-y-1">
                {registeredWorks.map((work) => (
                  <li key={work.id} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {work.title}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Preencha o formulário abaixo para adicionar mais obras
              </p>
            </div>
          )}

          {/* Seleção de Artistas com Busca */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Artista(s) Vinculado(s) *</h3>
            <p className="text-sm text-muted-foreground">
              Digite o nome do artista para buscar. Você pode adicionar mais de um artista.
            </p>
            
            <ArtistSearch
              selectedArtists={selectedArtistsList}
              onSelect={handleSelectArtist}
              onRemove={handleRemoveArtist}
              registeredArtists={registeredArtists}
              placeholder="Buscar por nome artístico ou nome civil..."
            />

            {selectedArtistsList.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Selecione pelo menos um artista
              </p>
            )}
          </div>

          {/* Dados da Obra */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados da Obra</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Título da Obra *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Nome da composição"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="language">Idioma *</Label>
                <Select onValueChange={(value) => form.setValue('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="genre">Gênero *</Label>
                <Select onValueChange={(value) => form.setValue('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="iswc">ISWC (opcional)</Label>
                <Input
                  id="iswc"
                  {...form.register('iswc')}
                  placeholder="T-000.000.000-0"
                />
              </div>
            </div>
          </div>

          {/* Autores e Participantes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold">Autores e Participantes</h3>
              <div className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                totalPercentage === 100 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                Total: {totalPercentage}%
              </div>
            </div>

            {totalPercentage !== 100 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <p className="text-sm text-amber-600">
                  A soma dos percentuais deve ser igual a 100%
                </p>
              </div>
            )}

            <div className="space-y-3">
              {authors.map((author, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border rounded-lg bg-muted/30">
                  <div className="flex-1 grid md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nome do Autor *</Label>
                      <Input
                        value={author.name}
                        onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label>Função *</Label>
                      <Select value={author.role} onValueChange={(value) => updateAuthor(index, 'role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {authorRoleOptions.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Percentual (%) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={author.percentage}
                        onChange={(e) => updateAuthor(index, 'percentage', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  {authors.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAuthor(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={addAuthor}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Autor
            </Button>
          </div>

          {/* Administração Editorial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Administração Editorial</h3>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="has_publisher"
                checked={hasPublisher}
                onCheckedChange={(checked) => form.setValue('has_publisher', !!checked)}
              />
              <Label htmlFor="has_publisher">Possui editora?</Label>
            </div>

            {hasPublisher && (
              <div className="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/30">
                <div>
                  <Label>Nome da Editora</Label>
                  <Input {...form.register('publisher_name')} />
                </div>
                <div>
                  <Label>Tipo de Contrato</Label>
                  <Select onValueChange={(value) => form.setValue('contract_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {editorialContractOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Materiais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Materiais</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Upload da Letra (PDF/DOC)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => form.setValue('lyrics_file', e.target.files?.[0])}
                  />
                </div>
              </div>

              <div>
                <Label>Upload de Demo (MP3/WAV)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                  <input
                    type="file"
                    accept=".mp3,.wav"
                    className="hidden"
                    onChange={(e) => form.setValue('demo_file', e.target.files?.[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Declarações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Declarações (Obrigatórias)</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_original"
                  checked={form.watch('is_original')}
                  onCheckedChange={(checked) => form.setValue('is_original', !!checked)}
                />
                <Label htmlFor="is_original">Esta é uma obra inédita</Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="editorial_representation"
                  checked={form.watch('editorial_representation')}
                  onCheckedChange={(checked) => form.setValue('editorial_representation', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="editorial_representation">Aceite de Representação Editorial *</Label>
                  <p className="text-sm text-muted-foreground">
                    Autorizo a representação editorial conforme os termos estabelecidos.
                  </p>
                </div>
              </div>
              {form.formState.errors.editorial_representation && (
                <p className="text-sm text-destructive">{form.formState.errors.editorial_representation.message}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || totalPercentage !== 100}>
                {isSubmitting ? 'Salvando...' : 'Salvar Obra'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>

              {registeredWorks.length > 0 && (
                <Button type="button" onClick={onContinue}>
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: FORMULÁRIO DE FONOGRAMA
// ============================================

function PhonogramStep({
  submissionId,
  registeredArtists,
  registeredWorks,
  onPhonogramRegistered,
  onContinue,
  onBack,
  registeredPhonograms,
}: {
  submissionId: string;
  registeredArtists: RegisteredArtist[];
  registeredWorks: RegisteredWork[];
  onPhonogramRegistered: (title: string) => void;
  onContinue: () => void;
  onBack: () => void;
  registeredPhonograms: string[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArtistsList, setSelectedArtistsList] = useState<ArtistSearchResult[]>([]);

  const form = useForm<PhonogramFormData>({
    resolver: zodResolver(phonogramSchema),
    defaultValues: {
      artist_ids: [],
      master_rights_declaration: false,
      exploitation_authorization: false,
    },
  });

  // Atualizar form quando artistas são selecionados
  useEffect(() => {
    form.setValue('artist_ids', selectedArtistsList.map(a => a.id));
  }, [selectedArtistsList, form]);

  const handleSelectArtist = (artist: ArtistSearchResult) => {
    setSelectedArtistsList(prev => [...prev, artist]);
  };

  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtistsList(prev => prev.filter(a => a.id !== artistId));
  };

  const onSubmit = async (data: PhonogramFormData) => {
    if (selectedArtistsList.length === 0) {
      toast({
        title: 'Artista obrigatório',
        description: 'Selecione pelo menos um artista intérprete.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: phonogramData, error } = await supabase
        .from('phonograms')
        .insert({
          title: data.title,
          isrc: data.isrc,
          version_type: data.version,
          status: 'Aguardando Aprovação',
          work_id: data.work_id,
          artist_id: selectedArtistsList[0]?.id,
          master_owner: data.phonographic_producer || null,
        })
        .select()
        .single();

      if (error) throw error;

      onPhonogramRegistered(data.title);

      // Reset form
      form.reset();
      setSelectedArtistsList([]);

    } catch (error: any) {
      console.error('Error saving phonogram:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar o fonograma.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Disc className="h-5 w-5" />
          Cadastro de Fonograma
        </CardTitle>
        <CardDescription>
          Cadastre as informações da gravação. Você pode adicionar vários fonogramas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Fonogramas já cadastrados */}
          {registeredPhonograms.length > 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-600 mb-2">Fonogramas cadastrados nesta sessão ({registeredPhonograms.length}):</h4>
              <ul className="space-y-1">
                {registeredPhonograms.map((title, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {title}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Preencha o formulário abaixo para adicionar mais fonogramas
              </p>
            </div>
          )}

          {/* Seleção Inicial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Seleção Inicial</h3>
            
            <div>
              <Label>Obra *</Label>
              <Select onValueChange={(value) => form.setValue('work_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {registeredWorks.map((work) => (
                    <SelectItem key={work.id} value={work.id}>{work.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.work_id && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.work_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Artista(s) Intérprete(s) *</Label>
              <p className="text-sm text-muted-foreground">
                Digite o nome do artista para buscar. Você pode adicionar mais de um artista.
              </p>
              
              <ArtistSearch
                selectedArtists={selectedArtistsList}
                onSelect={handleSelectArtist}
                onRemove={handleRemoveArtist}
                registeredArtists={registeredArtists}
                placeholder="Buscar artista intérprete..."
              />

              {selectedArtistsList.length === 0 && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Selecione pelo menos um artista
                </p>
              )}
            </div>
          </div>

          {/* Dados do Fonograma */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Fonograma</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phonogram_title">Título do Fonograma *</Label>
                <Input
                  id="phonogram_title"
                  {...form.register('title')}
                  placeholder="Título da gravação"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="version">Versão *</Label>
                <Select onValueChange={(value) => form.setValue('version', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {phonogramVersionOptions.map((version) => (
                      <SelectItem key={version} value={version}>{version}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="isrc">ISRC (opcional)</Label>
                <Input
                  id="isrc"
                  {...form.register('isrc')}
                  placeholder="BR-XXX-00-00000"
                />
              </div>
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Participantes</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="main_interpreter">Intérprete Principal *</Label>
                <Input
                  id="main_interpreter"
                  {...form.register('main_interpreter')}
                  placeholder="Nome do intérprete principal"
                />
                {form.formState.errors.main_interpreter && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.main_interpreter.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phonographic_producer">Produtor Fonográfico</Label>
                <Input
                  id="phonographic_producer"
                  {...form.register('phonographic_producer')}
                  placeholder="Nome do produtor"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="featured_artists">Participações Especiais (Feats)</Label>
                <Input
                  id="featured_artists"
                  {...form.register('featured_artists')}
                  placeholder="Nomes separados por vírgula"
                />
              </div>
            </div>
          </div>

          {/* Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Uploads</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Arquivo de Áudio (WAV) *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">WAV obrigatório</p>
                  <input
                    type="file"
                    accept=".wav"
                    className="hidden"
                    onChange={(e) => form.setValue('audio_file', e.target.files?.[0])}
                  />
                </div>
              </div>

              <div>
                <Label>Capa (JPEG/PNG)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Imagem de capa</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => form.setValue('cover_file', e.target.files?.[0])}
                  />
                </div>
              </div>

              <div>
                <Label>Letra Sincronizada (opcional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">LRC ou SRT</p>
                  <input
                    type="file"
                    accept=".lrc,.srt"
                    className="hidden"
                    onChange={(e) => form.setValue('synced_lyrics_file', e.target.files?.[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Declarações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Declarações (Obrigatórias)</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="master_rights_declaration"
                  checked={form.watch('master_rights_declaration')}
                  onCheckedChange={(checked) => form.setValue('master_rights_declaration', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="master_rights_declaration">Declaração de Direitos do Master *</Label>
                  <p className="text-sm text-muted-foreground">
                    Declaro que possuo os direitos sobre a gravação (master) deste fonograma.
                  </p>
                </div>
              </div>
              {form.formState.errors.master_rights_declaration && (
                <p className="text-sm text-destructive">{form.formState.errors.master_rights_declaration.message}</p>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="exploitation_authorization"
                  checked={form.watch('exploitation_authorization')}
                  onCheckedChange={(checked) => form.setValue('exploitation_authorization', !!checked)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="exploitation_authorization">Autorização para Exploração *</Label>
                  <p className="text-sm text-muted-foreground">
                    Autorizo a exploração comercial deste fonograma conforme os termos estabelecidos.
                  </p>
                </div>
              </div>
              {form.formState.errors.exploitation_authorization && (
                <p className="text-sm text-destructive">{form.formState.errors.exploitation_authorization.message}</p>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Fonograma'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>

              {registeredPhonograms.length > 0 && (
                <Button type="button" onClick={onContinue}>
                  Finalizar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: TELA DE SUCESSO
// ============================================

function SuccessStep({
  submissionId,
  registeredArtists,
  registeredWorks,
  registeredPhonograms,
}: {
  submissionId: string;
  registeredArtists: RegisteredArtist[];
  registeredWorks: RegisteredWork[];
  registeredPhonograms: string[];
}) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Cadastro enviado com sucesso!</CardTitle>
        <CardDescription>
          Seus dados foram recebidos e serão analisados pela nossa equipe.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Protocolo */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Número do Protocolo</p>
          <p className="font-mono text-lg font-bold">{submissionId.toUpperCase()}</p>
        </div>

        {/* Prazo */}
        <div className="text-sm text-muted-foreground">
          <p>Prazo médio de validação: <strong>até 5 dias úteis</strong></p>
          <p>Você receberá um email quando seu cadastro for analisado.</p>
        </div>

        {/* Resumo */}
        <div className="border rounded-lg p-4 text-left">
          <h4 className="font-semibold mb-3">Resumo do cadastro</h4>
          
          {registeredArtists.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground">Artistas ({registeredArtists.length})</p>
              <ul className="text-sm space-y-1">
                {registeredArtists.map((artist) => (
                  <li key={artist.id} className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {artist.artistic_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {registeredWorks.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground">Obras ({registeredWorks.length})</p>
              <ul className="text-sm space-y-1">
                {registeredWorks.map((work) => (
                  <li key={work.id} className="flex items-center gap-2">
                    <Music className="h-3 w-3" />
                    {work.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {registeredPhonograms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fonogramas ({registeredPhonograms.length})</p>
              <ul className="text-sm space-y-1">
                {registeredPhonograms.map((title, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Disc className="h-3 w-3" />
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button asChild className="w-full">
          <a href="/">Voltar ao Início</a>
        </Button>
      </CardContent>
    </Card>
  );
}
