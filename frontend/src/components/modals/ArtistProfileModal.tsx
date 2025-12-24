import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Music, 
  Disc3,
  FolderKanban,
  Rocket,
  BarChart3,
  ExternalLink,
  User,
  Building,
  CreditCard,
  FileText,
  Users,
  Loader2
} from "lucide-react";
import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaSoundcloud } from "react-icons/fa";
import { formatDateBR } from "@/lib/utils";
import { SpotifyMetricsCard } from "@/components/artists/SpotifyMetricsCard";
import { ArtistSensitiveDataService, ArtistSensitiveData } from "@/services/artistSensitiveData";

interface ArtistProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: any;
}

export function ArtistProfileModal({
  open,
  onOpenChange,
  artist,
}: ArtistProfileModalProps) {
  const [sensitiveData, setSensitiveData] = useState<ArtistSensitiveData | null>(null);
  const [loadingSensitive, setLoadingSensitive] = useState(false);

  useEffect(() => {
    const loadSensitiveData = async () => {
      if (open && artist?.id) {
        setLoadingSensitive(true);
        try {
          const data = await ArtistSensitiveDataService.getByArtistId(artist.id);
          setSensitiveData(data);
        } catch (error) {
          console.error('Error loading sensitive data:', error);
        } finally {
          setLoadingSensitive(false);
        }
      }
    };
    loadSensitiveData();
  }, [open, artist?.id]);

  if (!artist) return null;

  const formatArtistDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Não informado';
    return formatDateBR(dateString);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Perfil do Artista</DialogTitle>
          <DialogDescription className="text-sm">
            Informações detalhadas do artista
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e info básica */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4 border-2 border-border">
                <AvatarImage src={artist.avatar || artist.image_url} alt={artist.name} className="object-cover" />
                <AvatarFallback className="text-2xl">
                  {artist.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="mb-2">{artist.status || artist.contract_status || 'Ativo'}</Badge>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{artist.name}</h2>
                {artist.name && artist.name !== artist.name && (
                  <p className="text-sm text-muted-foreground">Nome artístico: {artist.name}</p>
                )}
                <p className="text-lg text-muted-foreground">{artist.genre || 'Gênero não informado'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{artist.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{artist.phone || artist.profile?.telefone || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{sensitiveData?.full_address || artist.full_address || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Nascimento: {formatArtistDate(artist.birth_date)}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Nome Completo:</span>
                <p>{artist.full_name || artist.name || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Nome Artístico:</span>
                <p>{artist.name || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">CPF/CNPJ:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.cpf_cnpj || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">RG:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.rg || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Data de Nascimento:</span>
                <p>{formatArtistDate(artist.birth_date)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Tipo de Perfil:</span>
                <p>{artist.profile_type || artist.gravadora || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contato e Endereço */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contato e Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">E-mail:</span>
                <p>{artist.email || 'Não informado'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Telefone:</span>
                <p>{artist.phone || 'Não informado'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-muted-foreground">Endereço Completo:</span>
                <p>{sensitiveData?.full_address || artist.full_address || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados Bancários */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Banco:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.bank || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Agência:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.agency || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Conta:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.account || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Titular:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.account_holder || 'Não informado')}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Chave PIX:</span>
                <p>{loadingSensitive ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (sensitiveData?.pix_key || 'Não informado')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Responsável/Empresário */}
          {(artist.manager_name || artist.manager_phone || artist.manager_email || artist.responsible) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Responsável / Empresário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Nome:</span>
                    <p>{artist.manager_name || artist.responsible?.nome || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Telefone:</span>
                    <p>{artist.manager_phone || artist.responsible?.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">E-mail:</span>
                    <p>{artist.manager_email || artist.responsible?.email || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Distribuidoras */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Distribuidoras
            </h3>
            <div className="space-y-2 text-sm">
              {artist.distributors && artist.distributors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {artist.distributors.map((dist: string, index: number) => (
                    <Badge key={index} variant="outline">{dist}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma distribuidora cadastrada</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <FolderKanban className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats?.projetos || 0}</div>
                <div className="text-sm text-muted-foreground">Projetos</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Music className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats?.obras || 0}</div>
                <div className="text-sm text-muted-foreground">Obras</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Disc3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats?.fonogramas || 0}</div>
                <div className="text-sm text-muted-foreground">Fonogramas</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Rocket className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats?.lancamentos || 0}</div>
                <div className="text-sm text-muted-foreground">Lançamentos</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{artist.stats?.streams || '0'}</div>
                <div className="text-sm text-muted-foreground">Streams</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Métricas do Spotify */}
          {(artist.spotify_url || artist.spotify_id) && (
            <>
              <SpotifyMetricsCard 
                artistId={artist.id} 
                spotifyUrl={artist.spotify_url || artist.spotify_id}
              />
              <Separator />
            </>
          )}

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-4 flex-wrap">
              {(artist.instagram_url || artist.socialMedia?.instagram) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const url = artist.instagram_url || artist.socialMedia?.instagram;
                    const finalUrl = url?.startsWith('http') ? url : `https://instagram.com/${url?.replace('@', '')}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FaInstagram className="h-4 w-4" />
                  Instagram
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {(artist.spotify_url || artist.socialMedia?.spotify) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const url = artist.spotify_url || artist.socialMedia?.spotify;
                    const finalUrl = url?.startsWith('http') ? url : `https://open.spotify.com/artist/${url}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FaSpotify className="h-4 w-4" />
                  Spotify
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {(artist.youtube_url || artist.socialMedia?.youtube) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const url = artist.youtube_url || artist.socialMedia?.youtube;
                    const finalUrl = url?.startsWith('http') ? url : `https://youtube.com/${url}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FaYoutube className="h-4 w-4" />
                  YouTube
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {(artist.tiktok || artist.socialMedia?.tiktok) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const url = artist.tiktok || artist.socialMedia?.tiktok;
                    const finalUrl = url?.startsWith('http') ? url : `https://tiktok.com/@${url?.replace('@', '')}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FaTiktok className="h-4 w-4" />
                  TikTok
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {(artist.soundcloud || artist.socialMedia?.soundcloud) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const url = artist.soundcloud || artist.socialMedia?.soundcloud;
                    const finalUrl = url?.startsWith('http') ? url : `https://soundcloud.com/${url}`;
                    window.open(finalUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <FaSoundcloud className="h-4 w-4" />
                  SoundCloud
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {!artist.instagram_url && !artist.socialMedia?.instagram &&
               !artist.spotify_url && !artist.socialMedia?.spotify &&
               !artist.youtube_url && !artist.socialMedia?.youtube &&
               !artist.tiktok && !artist.socialMedia?.tiktok &&
               !artist.soundcloud && !artist.socialMedia?.soundcloud && (
                <p className="text-muted-foreground text-sm">Nenhuma rede social cadastrada</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Observações */}
          {artist.observations && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artist.observations}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Biografia */}
          {artist.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Biografia
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artist.bio}</p>
            </div>
          )}

          {/* Data de Cadastro */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Data de Cadastro:</span> {formatArtistDate(artist.created_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
