import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, TrendingUp, Users, DollarSign, BarChart3, User, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ArtistProfileModal } from "@/components/modals/ArtistProfileModal";

interface FeaturedArtist {
  id: string;
  name: string;
  stage_name: string | null;
  image_url: string | null;
  genre: string | null;
  relevanceScore: number;
  metrics: {
    totalStreams: number;
    streamsVariation: number;
    uniqueListeners: number;
    followersGrowth: number;
    estimatedRevenue: number;
  };
  [key: string]: any;
}

// Helper functions for formatting
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function FeaturedArtists() {
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: artists, isLoading } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async (): Promise<FeaturedArtist[]> => {
      // Fetch all artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .limit(50);

      if (artistsError) throw artistsError;
      if (!artistsData || artistsData.length === 0) return [];

      const artistIds = artistsData.map(a => a.id);

      // Check which artists have active contracts
      const today = new Date().toISOString().split('T')[0];
      const { data: activeContracts } = await supabase
        .from('contracts')
        .select('artist_id')
        .in('artist_id', artistIds)
        .or(`status.eq.ativo,status.eq.active,status.eq.assinado`)
        .gte('effective_to', today);

      const artistsWithActiveContract = new Set((activeContracts || []).map(c => c.artist_id));

      // Fetch spotify metrics for all artists
      const { data: spotifyMetrics } = await supabase
        .from('spotify_metrics')
        .select('*')
        .in('artist_id', artistIds)
        .order('created_at', { ascending: false });

      // Fetch financial transactions for revenue
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('artist_id, amount, type')
        .in('artist_id', artistIds)
        .eq('type', 'receitas')
        .eq('status', 'pago');

      const metricsMap = new Map<string, any[]>();
      (spotifyMetrics || []).forEach(m => {
        if (!metricsMap.has(m.artist_id)) {
          metricsMap.set(m.artist_id, []);
        }
        metricsMap.get(m.artist_id)!.push(m);
      });

      const artistsWithMetrics = artistsData.map(artist => {
        const artistMetrics = metricsMap.get(artist.id) || [];
        const latestMetric = artistMetrics[0];
        const previousMetric = artistMetrics[1];
        const hasActiveContract = artistsWithActiveContract.has(artist.id);

        // Use real data from spotify_metrics
        const currentStreams = latestMetric?.monthly_listeners || 0;
        const currentFollowers = latestMetric?.followers || 0;
        const previousStreams = previousMetric?.monthly_listeners || currentStreams;
        const previousFollowers = previousMetric?.followers || currentFollowers;
        
        // Calculate streams variation percentage
        const streamsVariation = previousStreams > 0 
          ? Math.round(((currentStreams - previousStreams) / previousStreams) * 100) 
          : 0;

        // Calculate followers growth
        const followersGrowth = currentFollowers - previousFollowers;

        // Calculate revenue from transactions
        const artistTransactions = (transactions || []).filter(t => t.artist_id === artist.id);
        const estimatedRevenue = artistTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // Relevance score - prioritize artists with active contracts
        const contractBonus = hasActiveContract ? 1000000 : 0;
        const relevanceScore = contractBonus + (currentStreams * 0.4) + (currentFollowers * 0.3) + (estimatedRevenue * 0.3);

        return {
          ...artist,
          relevanceScore,
          hasActiveContract,
          metrics: {
            totalStreams: currentStreams,
            streamsVariation,
            uniqueListeners: currentFollowers,
            followersGrowth,
            estimatedRevenue
          }
        };
      });

      // Sort by relevance and take top 4
      return artistsWithMetrics
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);
    }
  });

  const handleViewProfile = (artist: FeaturedArtist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Artistas em Destaque
          </CardTitle>
          <CardDescription>Artistas com contrato vigente e maior relevância</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[420px] w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!artists || artists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Artistas em Destaque
          </CardTitle>
          <CardDescription>Artistas com maior relevância (prioriza contratos vigentes)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum artista cadastrado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Artistas em Destaque
          </CardTitle>
          <CardDescription>Artistas com contrato vigente e maior relevância</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {artists.map((artist, index) => (
              <div
                key={artist.id}
                className="relative overflow-hidden rounded-xl bg-card border border-border group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 w-full h-[420px]"
                onClick={() => handleViewProfile(artist)}
              >
                {/* Background Image */}
                <div className="relative w-full h-full">
                  {artist.image_url ? (
                    <img
                      src={artist.image_url}
                      alt={artist.stage_name || artist.name}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
                      <User className="h-20 w-20 text-primary/40" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top Right Badge - Ranking */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {index === 0 && (
                      <Badge className="bg-yellow-500 text-yellow-950 font-bold text-xs px-3 py-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        #1
                      </Badge>
                    )}
                    {index === 1 && (
                      <Badge className="bg-gray-400 text-gray-900 font-bold text-xs px-3 py-1">
                        #2
                      </Badge>
                    )}
                    {index === 2 && (
                      <Badge className="bg-amber-600 text-white font-bold text-xs px-3 py-1">
                        #3
                      </Badge>
                    )}
                    {index === 3 && (
                      <Badge className="bg-white/20 text-white font-bold text-xs px-3 py-1">
                        #4
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                    {/* Name and Genre */}
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide truncate">
                        {artist.stage_name || artist.name}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        {artist.genre && (
                          <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 capitalize">
                            {artist.genre}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid - New Metrics */}
                    <div className="space-y-2">
                      {/* Streams */}
                      <div className="flex items-center justify-between bg-black/50 rounded px-3 py-2">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <BarChart3 className="h-3 w-3" />
                          <span>Streams</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {formatNumber(artist.metrics.totalStreams)}
                          </span>
                          {artist.metrics.streamsVariation !== 0 && (
                            <span className={`text-xs flex items-center ${artist.metrics.streamsVariation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {artist.metrics.streamsVariation > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              {Math.abs(artist.metrics.streamsVariation)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ouvintes Únicos */}
                      <div className="flex items-center justify-between bg-black/50 rounded px-3 py-2">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <Users className="h-3 w-3" />
                          <span>Ouvintes</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {formatNumber(artist.metrics.uniqueListeners)}
                        </span>
                      </div>

                      {/* Crescimento */}
                      <div className="flex items-center justify-between bg-black/50 rounded px-3 py-2">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <TrendingUp className="h-3 w-3" />
                          <span>Crescimento</span>
                        </div>
                        <span className={`text-sm font-bold flex items-center gap-1 ${artist.metrics.followersGrowth > 0 ? 'text-green-400' : artist.metrics.followersGrowth < 0 ? 'text-red-400' : 'text-white'}`}>
                          {artist.metrics.followersGrowth > 0 ? '+' : ''}{formatNumber(artist.metrics.followersGrowth)}
                          {artist.metrics.followersGrowth !== 0 && (
                            artist.metrics.followersGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </span>
                      </div>

                      {/* Receita */}
                      <div className="flex items-center justify-between bg-black/50 rounded px-3 py-2">
                        <div className="flex items-center gap-2 text-white/70 text-xs">
                          <DollarSign className="h-3 w-3" />
                          <span>Receita</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          R$ {formatCurrency(artist.metrics.estimatedRevenue)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      className="w-full bg-white/20 hover:bg-white/30 text-white text-xs h-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(artist);
                      }}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedArtist && (
        <ArtistProfileModal
          artist={selectedArtist}
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedArtist(null);
          }}
        />
      )}
    </>
  );
}
