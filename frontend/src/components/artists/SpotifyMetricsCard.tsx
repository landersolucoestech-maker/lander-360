import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { RefreshCw, Music2, Users, TrendingUp, Play, ExternalLink, Pencil, Check, X } from 'lucide-react';
import { useArtistSpotifyMetrics, useFetchSpotifyMetrics, useUpdateMonthlyListeners, useSpotifyTopTracks, TopTrack } from '@/hooks/useSpotifyMetrics';
import { formatDateTimeBR } from '@/lib/utils';

interface SpotifyMetricsCardProps {
  artistId: string;
  spotifyUrl?: string;
}

export function SpotifyMetricsCard({ artistId, spotifyUrl }: SpotifyMetricsCardProps) {
  const { data: metrics, isLoading } = useArtistSpotifyMetrics(artistId);
  const fetchMetrics = useFetchSpotifyMetrics();
  const updateMonthlyListeners = useUpdateMonthlyListeners();
  const cachedTopTracks = useSpotifyTopTracks(artistId);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [isEditingListeners, setIsEditingListeners] = useState(false);
  const [listenersValue, setListenersValue] = useState('');

  const isValidSpotifyArtistUrl =
    !!spotifyUrl &&
    spotifyUrl !== 'Não temos' &&
    spotifyUrl !== 'Não tem' &&
    spotifyUrl.includes('spotify') &&
    spotifyUrl.includes('/artist/') &&
    !spotifyUrl.includes('/user/');

  const handleRefresh = () => {
    if (!isValidSpotifyArtistUrl) {
      console.warn('Invalid Spotify URL, skipping Spotify metrics refresh', spotifyUrl);
      return;
    }
    fetchMetrics.mutate({ artistId, spotifyUrl });
  };
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics && !spotifyUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music2 className="h-5 w-5 text-green-500" />
            Métricas do Spotify
          </CardTitle>
          <CardDescription>
            Adicione a URL do Spotify do artista para ver as métricas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const topTracks = (metrics?.top_tracks || []) as TopTrack[];
  const displayedTracks = showAllTracks ? topTracks : topTracks.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music2 className="h-5 w-5 text-green-500" />
            Métricas do Spotify
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={fetchMetrics.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fetchMetrics.isPending ? 'animate-spin' : ''}`} />
            {fetchMetrics.isPending ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
        {metrics?.fetched_at && (
          <CardDescription>
            Última atualização: {formatDateTimeBR(metrics.fetched_at)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{formatNumber(metrics?.followers || 0)}</p>
            <p className="text-sm text-muted-foreground">Seguidores</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center relative group">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            {isEditingListeners ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  value={listenersValue}
                  onChange={(e) => setListenersValue(e.target.value)}
                  className="h-8 w-28 text-center text-sm"
                  placeholder="0"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const value = parseInt(listenersValue) || 0;
                    updateMonthlyListeners.mutate({ artistId, monthlyListeners: value });
                    setIsEditingListeners(false);
                  }}
                  disabled={updateMonthlyListeners.isPending}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditingListeners(false)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold">{formatNumber(metrics?.monthly_listeners ?? 0)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setListenersValue(String(metrics?.monthly_listeners ?? 0));
                    setIsEditingListeners(true);
                  }}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Ouvintes mensais</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Music2 className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{topTracks.length}</p>
            <p className="text-sm text-muted-foreground">Top Tracks</p>
          </div>
        </div>

        {/* Top Tracks List */}
        {topTracks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Top Músicas</h4>
            <div className="space-y-2">
              {displayedTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-5 text-center">
                    {index + 1}
                  </span>
                  {track.album_image && (
                    <img
                      src={track.album_image}
                      alt={track.album_name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.album_name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {track.popularity}%
                  </Badge>
                  <div className="flex gap-1">
                    {track.preview_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(track.preview_url!, '_blank')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {track.spotify_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(track.spotify_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {topTracks.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAllTracks(!showAllTracks)}
              >
                {showAllTracks ? 'Ver menos' : `Ver todas (${topTracks.length})`}
              </Button>
            )}
          </div>
        )}

        {!metrics && spotifyUrl && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Clique em "Atualizar" para buscar as métricas do Spotify.
            </p>
            <Button onClick={handleRefresh} disabled={fetchMetrics.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${fetchMetrics.isPending ? 'animate-spin' : ''}`} />
              Buscar Métricas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
