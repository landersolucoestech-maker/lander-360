import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArtistModal } from "@/components/modals/ArtistModal";
import { ArtistProfileModal } from "@/components/modals/ArtistProfileModal";
import { ArtistHistoryModal } from "@/components/modals/ArtistHistoryModal";
import { ArtistContractModal } from "@/components/modals/ArtistContractModal";
import { Artist360Modal } from "@/components/modals/Artist360Modal";
import { DeleteConfirmationModal } from "@/components/modals/DeleteConfirmationModal";
import { useDeleteArtist } from "@/hooks/useArtists";
import { useArtistSpotifyMetrics, useFetchSpotifyMetrics } from "@/hooks/useSpotifyMetrics";
import { useArtistSocialMetrics, useFetchSocialMetrics } from "@/hooks/useSocialMetrics";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Users, Headphones, BarChart3, RefreshCw, Loader2, Eye, Sparkles } from "lucide-react";
import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaSoundcloud, FaApple, FaDeezer } from "react-icons/fa";
interface ArtistCardProps {
  artist: {
    id: number;
    name: string;
    genre: string;
    status: string;
    email: string;
    avatar?: string;
    socialMedia?: {
      instagram?: string;
      spotify?: string;
      youtube?: string;
      tiktok?: string;
      soundcloud?: string;
      deezer?: string;
      apple?: string;
    };
    stats: {
      projetos?: number;
      obras: number;
      fonogramas?: number;
      lancamentos: number;
    };
    profile: {
      nome: string;
      email: string;
      telefone: string;
    };
    responsible?: {
      nome: string;
      email: string;
      telefone: string;
    } | null;
    gravadora: string;
  };
  hasActiveContract?: boolean;
}
export function ArtistCard({
  artist,
  hasActiveContract = false
}: ArtistCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [modal360Open, setModal360Open] = useState(false);
  const deleteArtist = useDeleteArtist();
  const { toast } = useToast();
  
  // Spotify metrics
  const spotifyUrl = artist.socialMedia?.spotify || '';
  const isValidSpotifyArtistUrl =
    !!spotifyUrl &&
    spotifyUrl !== 'Não temos' &&
    spotifyUrl !== 'Não tem' &&
    spotifyUrl.includes('spotify') &&
    spotifyUrl.includes('/artist/') &&
    !spotifyUrl.includes('/user/');
  
  // Verificar se há qualquer rede social cadastrada para mostrar a seção de métricas
  const hasAnySocialMedia = 
    isValidSpotifyArtistUrl ||
    (artist.socialMedia?.youtube && artist.socialMedia.youtube !== 'Não temos' && artist.socialMedia.youtube !== 'Não tem') ||
    (artist.socialMedia?.instagram && artist.socialMedia.instagram !== 'Não temos' && artist.socialMedia.instagram !== 'Não tem') ||
    (artist.socialMedia?.tiktok && artist.socialMedia.tiktok !== 'Não temos' && artist.socialMedia.tiktok !== 'Não tem') ||
    (artist.socialMedia?.deezer && artist.socialMedia.deezer !== 'Não temos' && artist.socialMedia.deezer !== 'Não tem') ||
    (artist.socialMedia?.apple && artist.socialMedia.apple !== 'Não temos' && artist.socialMedia.apple !== 'Não tem');
  const { data: spotifyMetrics, isLoading: isLoadingMetrics } = useArtistSpotifyMetrics(artist.id.toString());
  const fetchSpotifyMetrics = useFetchSpotifyMetrics();
  const { data: socialMetrics, isLoading: isLoadingSocial } = useArtistSocialMetrics(artist.id.toString());
  const fetchSocialMetrics = useFetchSocialMetrics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshSpotify = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    console.log('[ArtistCard] Iniciando refresh de métricas para:', artist.name);
    console.log('[ArtistCard] spotifyUrl:', spotifyUrl);
    console.log('[ArtistCard] isValidSpotifyArtistUrl:', isValidSpotifyArtistUrl);
    
    let metricsUpdated = false;
    
    try {
      // Refresh Spotify metrics
      if (isValidSpotifyArtistUrl) {
        console.log('[ArtistCard] Chamando fetchSpotifyMetrics...');
        const result = await fetchSpotifyMetrics.mutateAsync({
          artistId: artist.id.toString(),
          spotifyUrl: spotifyUrl
        });
        console.log('[ArtistCard] Resultado Spotify:', result);
        if (result?.success !== false) {
          metricsUpdated = true;
        }
      }
      
      // Refresh other social metrics
      const youtubeUrl = artist.socialMedia?.youtube || '';
      const instagramUrl = artist.socialMedia?.instagram || '';
      const tiktokUrl = artist.socialMedia?.tiktok || '';
      const deezerUrl = artist.socialMedia?.deezer || '';
      const appleMusicUrl = artist.socialMedia?.apple || '';
      
      if (youtubeUrl || instagramUrl || tiktokUrl || deezerUrl || appleMusicUrl) {
        await fetchSocialMetrics.mutateAsync({
          artistId: artist.id.toString(),
          youtubeUrl: youtubeUrl,
          instagramUrl: instagramUrl,
          tiktokUrl: tiktokUrl,
          deezerUrl: deezerUrl,
          appleMusicUrl: appleMusicUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteArtist.mutateAsync(artist.id.toString());
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  // Format large numbers
  const formatNumber = (num: number | null | undefined) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Calculate total streams from top tracks
  const topTracks = (spotifyMetrics?.top_tracks as any[]) || [];
  const totalStreams = topTracks.slice(0, 5).reduce((sum, track) => sum + (track?.streams || 0), 0);
  return <>
      <Card className="py-4 px-5 md:py-5 md:px-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            {/* Top Row - Avatar, Info, Social, Stats, Actions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
              {/* Left Section - Avatar & Artist Info */}
              <div className="md:col-span-3">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 border-2 border-border">
                    <AvatarImage src={artist.avatar} alt={artist.name} className="object-cover" />
                    <AvatarFallback className="text-lg md:text-xl font-bold bg-muted">
                      {artist.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-foreground truncate">{artist.name}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{artist.genre}</p>
                    {hasActiveContract && (
                      <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600 text-xs md:text-sm">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3 flex-wrap">
                  {artist.profile?.telefone && <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{artist.profile.telefone}</span>
                    </div>}
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{artist.email}</span>
                  </div>
                </div>
              </div>

              {/* Middle Section - Social Media & Stats */}
              <div className="md:col-span-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-foreground mb-2">Redes Sociais</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      {artist.socialMedia?.instagram && (
                        <a 
                          href={artist.socialMedia.instagram.startsWith('http') ? artist.socialMedia.instagram : `https://instagram.com/${artist.socialMedia.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-pink-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.instagram.startsWith('http') ? artist.socialMedia.instagram : `https://instagram.com/${artist.socialMedia.instagram.replace('@', '')}`, '_blank');
                          }}
                        >
                          <FaInstagram className="h-5 w-5" />
                        </a>
                      )}
                      {artist.socialMedia?.spotify && (
                        <a 
                          href={artist.socialMedia.spotify.startsWith('http') ? artist.socialMedia.spotify : `https://open.spotify.com/artist/${artist.socialMedia.spotify}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-green-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.spotify.startsWith('http') ? artist.socialMedia.spotify : `https://open.spotify.com/artist/${artist.socialMedia.spotify}`, '_blank');
                          }}
                        >
                          <FaSpotify className="h-5 w-5" />
                        </a>
                      )}
                      {artist.socialMedia?.youtube && (
                        <a 
                          href={artist.socialMedia.youtube.startsWith('http') ? artist.socialMedia.youtube : `https://youtube.com/${artist.socialMedia.youtube}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.youtube.startsWith('http') ? artist.socialMedia.youtube : `https://youtube.com/${artist.socialMedia.youtube}`, '_blank');
                          }}
                        >
                          <FaYoutube className="h-5 w-5" />
                        </a>
                      )}
                      {artist.socialMedia?.tiktok && (
                        <a 
                          href={artist.socialMedia.tiktok.startsWith('http') ? artist.socialMedia.tiktok : `https://tiktok.com/@${artist.socialMedia.tiktok.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.tiktok.startsWith('http') ? artist.socialMedia.tiktok : `https://tiktok.com/@${artist.socialMedia.tiktok.replace('@', '')}`, '_blank');
                          }}
                        >
                          <FaTiktok className="h-5 w-5" />
                        </a>
                      )}
                      {artist.socialMedia?.soundcloud && (
                        <a 
                          href={artist.socialMedia.soundcloud.startsWith('http') ? artist.socialMedia.soundcloud : `https://soundcloud.com/${artist.socialMedia.soundcloud}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-muted-foreground hover:text-orange-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artist.socialMedia.soundcloud.startsWith('http') ? artist.socialMedia.soundcloud : `https://soundcloud.com/${artist.socialMedia.soundcloud}`, '_blank');
                          }}
                        >
                          <FaSoundcloud className="h-5 w-5" />
                        </a>
                      )}
                      {!artist.socialMedia?.instagram && !artist.socialMedia?.spotify && !artist.socialMedia?.youtube && !artist.socialMedia?.tiktok && !artist.socialMedia?.soundcloud && (
                        <span className="text-xs text-muted-foreground">Nenhuma rede cadastrada</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-center gap-3">
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.projetos ?? 0}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Projetos</div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.obras}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Obras</div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.fonogramas ?? 0}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Fonogramas</div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-foreground">{artist.stats.lancamentos}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Lançamentos</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Profile & Actions */}
              <div className="md:col-span-6">
                <div className="space-y-3">
                  <div>
                    <div className="mb-2">
                      <span className="text-sm md:text-base font-medium text-foreground">Perfil:</span>
                      <span className="text-sm md:text-base font-medium text-foreground ml-1">{artist.gravadora}</span>
                    </div>
                    {artist.responsible ? <div className="text-sm text-muted-foreground space-y-1">
                        <div className="text-xs font-medium mb-1 text-primary-foreground">Responsável/Empresário:</div>
                        <div className="truncate"><span className="font-medium text-foreground">Nome:</span> {artist.responsible.nome}</div>
                        <div className="truncate"><span className="font-medium text-foreground">Tel:</span> {artist.responsible.telefone}</div>
                        <div className="truncate"><span className="font-medium text-foreground">Email:</span> {artist.responsible.email}</div>
                      </div> : <div className="text-sm text-muted-foreground space-y-1">
                        <div className="truncate"><span className="font-medium text-foreground">Nome:</span> {artist.profile.nome}</div>
                        <div className="truncate"><span className="font-medium text-foreground">Tel:</span> {artist.profile.telefone}</div>
                        <div className="truncate"><span className="font-medium text-foreground">Email:</span> {artist.profile.email}</div>
                      </div>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="default" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setModal360Open(true)}>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Visão 360º
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setProfileModalOpen(true)}>
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setHistoryModalOpen(true)}>
                      Histórico
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setContractModalOpen(true)}>
                      Contrato
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 px-3" onClick={() => setEditModalOpen(true)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(true)} className="text-xs md:text-sm h-8 px-3">
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Streaming Metrics */}
            {hasAnySocialMedia && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-foreground">Métricas de Plataformas</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshSpotify();
                    }}
                    disabled={isRefreshing || isLoadingMetrics}
                  >
                    {isRefreshing || isLoadingMetrics ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Atualizar
                  </Button>
                </div>
                
                {isLoadingMetrics || isRefreshing ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-2">Carregando métricas...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {/* Instagram */}
                    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-2 border border-pink-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaInstagram className="h-3.5 w-3.5 text-pink-500" />
                        <span className="text-[10px] font-medium text-foreground">Instagram</span>
                      </div>
                      <div className="text-base font-bold text-foreground">
                        {socialMetrics?.instagram?.followers ? formatNumber(socialMetrics.instagram.followers) : 'N/D'}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Seguidores</div>
                    </div>

                    {/* TikTok */}
                    <div className="bg-muted/50 rounded-lg p-2 border border-border">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaTiktok className="h-3.5 w-3.5 text-foreground" />
                        <span className="text-[10px] font-medium text-foreground">TikTok</span>
                      </div>
                      <div className="text-base font-bold text-foreground">
                        {socialMetrics?.tiktok?.followers ? formatNumber(socialMetrics.tiktok.followers) : 'N/D'}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Seguidores</div>
                    </div>

                    {/* Spotify */}
                    <div className="col-span-2 bg-gradient-to-b from-green-500/10 to-green-500/5 rounded-lg p-2 border border-green-500/20">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FaSpotify className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-medium text-foreground">Spotify</span>
                      </div>
                      {spotifyMetrics ? (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="flex items-center gap-1 text-green-500 mb-0.5">
                              <Users className="h-2.5 w-2.5" />
                              <span className="text-[9px]">Seguidores</span>
                            </div>
                            <div className="text-base font-bold text-foreground">{formatNumber(spotifyMetrics.followers)}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-green-500 mb-0.5">
                              <Headphones className="h-2.5 w-2.5" />
                              <span className="text-[9px]">Ouvintes/Mês</span>
                            </div>
                            <div className="text-base font-bold text-foreground">
                              {spotifyMetrics.monthly_listeners !== null &&
                               spotifyMetrics.monthly_listeners !== undefined &&
                               spotifyMetrics.monthly_listeners > 0 &&
                               spotifyMetrics.monthly_listeners !== spotifyMetrics.followers
                                ? formatNumber(spotifyMetrics.monthly_listeners)
                                : 'N/D'}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-green-500 mb-0.5">
                              <BarChart3 className="h-2.5 w-2.5" />
                              <span className="text-[9px]">Streams Top 5</span>
                            </div>
                            <div className="text-base font-bold text-foreground">{formatNumber(totalStreams)}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sem dados</p>
                      )}
                    </div>

                    {/* YouTube */}
                    <div className="bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FaYoutube className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-[10px] font-medium text-foreground">YouTube</span>
                      </div>
                      <div className="text-base font-bold text-foreground">
                        {socialMetrics?.youtube?.subscribers ? formatNumber(socialMetrics.youtube.subscribers) : 'N/D'}
                      </div>
                      <div className="text-[9px] text-muted-foreground">Inscritos</div>
                      {socialMetrics?.youtube?.views ? (
                        <div className="mt-1">
                          <div className="flex items-center gap-1 text-red-500">
                            <Eye className="h-2 w-2" />
                            <span className="text-[8px]">{formatNumber(socialMetrics.youtube.views)} views</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Apple & Deezer */}
                    <div className="space-y-1">
                      <div className="bg-muted/50 rounded-lg p-1.5 border border-border">
                        <div className="flex items-center gap-1 mb-0.5">
                          <FaApple className="h-3 w-3 text-foreground" />
                          <span className="text-[9px] font-medium text-foreground">Apple Music</span>
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {socialMetrics?.apple?.followers ? formatNumber(socialMetrics.apple.followers) : 'N/D'}
                        </div>
                        <div className="text-[8px] text-muted-foreground">Seguidores</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-1.5 border border-border">
                        <div className="flex items-center gap-1 mb-0.5">
                          <FaDeezer className="h-3 w-3 text-foreground" />
                          <span className="text-[9px] font-medium text-foreground">Deezer</span>
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {socialMetrics?.deezer?.followers ? formatNumber(socialMetrics.deezer.followers) : 'N/D'}
                        </div>
                        <div className="text-[8px] text-muted-foreground">Fãs</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <ArtistModal open={editModalOpen} onOpenChange={setEditModalOpen} artist={artist} mode="edit" />
      
      {/* Profile Modal */}
      <ArtistProfileModal open={profileModalOpen} onOpenChange={setProfileModalOpen} artist={artist} />
      
      {/* History Modal */}
      <ArtistHistoryModal open={historyModalOpen} onOpenChange={setHistoryModalOpen} artist={artist} />
      
      {/* Contract Modal */}
      <ArtistContractModal open={contractModalOpen} onOpenChange={setContractModalOpen} artist={artist} />

      {/* 360 Modal */}
      <Artist360Modal open={modal360Open} onOpenChange={setModal360Open} artist={artist} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={handleDelete} title="Excluir Artista" description={`Tem certeza que deseja excluir o artista "${artist.name}"? Esta ação não pode ser desfeita.`} isLoading={deleteArtist.isPending} />
    </>;
}