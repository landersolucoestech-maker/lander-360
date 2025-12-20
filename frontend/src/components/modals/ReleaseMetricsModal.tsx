import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReleaseMetrics, useFetchReleaseMetrics, useUpdateManualMetrics } from '@/hooks/useReleaseMetrics';
import { RefreshCw, Music, Eye, Heart, Loader2 } from 'lucide-react';
import { FaSpotify, FaYoutube, FaDeezer, FaApple } from 'react-icons/fa';
import { formatDateTimeBR } from '@/lib/utils';

interface ReleaseMetricsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  release: {
    id: string;
    title: string;
    artistName?: string;
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

export function ReleaseMetricsModal({ open, onOpenChange, release }: ReleaseMetricsModalProps) {
  const { data: metrics, isLoading, refetch } = useReleaseMetrics(release.id);
  const fetchMetrics = useFetchReleaseMetrics();
  const updateManual = useUpdateManualMetrics();
  
  const [manualValues, setManualValues] = useState({
    spotify: { streams: 0 },
    apple_music: { streams: 0 },
    youtube: { views: 0 },
    deezer: { streams: 0 },
  });

  // Refetch metrics when modal opens
  useEffect(() => {
    if (open && release.id) {
      refetch();
    }
  }, [open, release.id, refetch]);

  const handleFetchMetrics = () => {
    fetchMetrics.mutate({
      releaseId: release.id,
      trackName: release.title,
      artistName: release.artistName || '',
    });
  };

  const handleManualUpdate = (platform: string) => {
    const values = manualValues[platform as keyof typeof manualValues];
    updateManual.mutate({
      releaseId: release.id,
      platform,
      streams: 'streams' in values ? values.streams : 0,
      views: 'views' in values ? (values as any).views : 0,
    });
  };

  const platformConfig = [
    {
      key: 'spotify',
      name: 'Spotify',
      icon: FaSpotify,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      metric: metrics?.byPlatform.spotify,
      primaryLabel: 'Streams',
      primaryValue: metrics?.byPlatform.spotify?.streams || 0,
    },
    {
      key: 'apple_music',
      name: 'Apple Music',
      icon: FaApple,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      metric: metrics?.byPlatform.apple_music,
      primaryLabel: 'Streams',
      primaryValue: metrics?.byPlatform.apple_music?.streams || 0,
    },
    {
      key: 'youtube',
      name: 'YouTube',
      icon: FaYoutube,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      metric: metrics?.byPlatform.youtube,
      primaryLabel: 'Views',
      primaryValue: metrics?.byPlatform.youtube?.views || 0,
    },
    {
      key: 'deezer',
      name: 'Deezer',
      icon: FaDeezer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      metric: metrics?.byPlatform.deezer,
      primaryLabel: 'Streams',
      primaryValue: metrics?.byPlatform.deezer?.streams || 0,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Métricas de Streaming - {release.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {isLoading ? '...' : formatNumber(metrics?.totalStreams || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {isLoading ? '...' : formatNumber(metrics?.totalViews || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Saves
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">
                      {isLoading ? '...' : formatNumber(metrics?.totalSaves || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Por Plataforma</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchMetrics}
                  disabled={fetchMetrics.isPending}
                >
                  {fetchMetrics.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar Métricas
                </Button>
              </div>

              <div className="grid gap-3">
                {platformConfig.map((platform) => (
                  <Card key={platform.key} className={platform.bgColor}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <platform.icon className={`h-6 w-6 ${platform.color}`} />
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            {platform.metric?.fetched_at && (
                              <p className="text-xs text-muted-foreground">
                                Atualizado: {formatDateTimeBR(platform.metric.fetched_at)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatNumber(platform.primaryValue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {platform.primaryLabel}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {metrics?.lastUpdated && (
                <p className="text-xs text-muted-foreground text-center">
                  Última atualização: {formatDateTimeBR(metrics.lastUpdated)}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Insira manualmente as métricas de cada plataforma caso a coleta automática não esteja disponível.
            </p>

            <div className="space-y-4">
              {/* Spotify Manual */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaSpotify className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Spotify</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Streams</Label>
                      <Input
                        type="number"
                        value={manualValues.spotify.streams}
                        onChange={(e) => setManualValues(prev => ({
                          ...prev,
                          spotify: { streams: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={() => handleManualUpdate('spotify')}
                        disabled={updateManual.isPending}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Apple Music Manual */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaApple className="h-5 w-5 text-pink-500" />
                    <span className="font-medium">Apple Music</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Streams</Label>
                      <Input
                        type="number"
                        value={manualValues.apple_music.streams}
                        onChange={(e) => setManualValues(prev => ({
                          ...prev,
                          apple_music: { streams: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={() => handleManualUpdate('apple_music')}
                        disabled={updateManual.isPending}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* YouTube Manual */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaYoutube className="h-5 w-5 text-red-500" />
                    <span className="font-medium">YouTube</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Views</Label>
                      <Input
                        type="number"
                        value={manualValues.youtube.views}
                        onChange={(e) => setManualValues(prev => ({
                          ...prev,
                          youtube: { views: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={() => handleManualUpdate('youtube')}
                        disabled={updateManual.isPending}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deezer Manual */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaDeezer className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">Deezer</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label>Streams</Label>
                      <Input
                        type="number"
                        value={manualValues.deezer.streams}
                        onChange={(e) => setManualValues(prev => ({
                          ...prev,
                          deezer: { streams: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        size="sm"
                        onClick={() => handleManualUpdate('deezer')}
                        disabled={updateManual.isPending}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}