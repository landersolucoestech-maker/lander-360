import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, TrendingUp, Music, Calendar, User } from "lucide-react";
import { ArtistProfileModal } from "@/components/modals/ArtistProfileModal";

interface FeaturedArtist {
  id: string;
  name: string;
  stage_name: string | null;
  image_url: string | null;
  genre: string | null;
  releaseCount: number;
  recentActivity: number;
  relevanceScore: number;
}

export function FeaturedArtists() {
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: artists, isLoading } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async (): Promise<FeaturedArtist[]> => {
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .limit(50);

      if (artistsError) throw artistsError;
      if (!artistsData || artistsData.length === 0) return [];

      const { data: releases } = await supabase
        .from('releases')
        .select('artist_id')
        .not('artist_id', 'is', null);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: events } = await supabase
        .from('agenda_events')
        .select('artist_id')
        .gte('start_date', thirtyDaysAgo.toISOString())
        .not('artist_id', 'is', null);

      const artistsWithScores = artistsData.map(artist => {
        const releaseCount = releases?.filter(r => r.artist_id === artist.id).length || 0;
        const recentActivity = events?.filter(e => e.artist_id === artist.id).length || 0;
        const relevanceScore = (releaseCount * 40) + (recentActivity * 60);

        return {
          ...artist,
          releaseCount,
          recentActivity,
          relevanceScore
        };
      });

      return artistsWithScores
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);
    }
  });

  const handleViewProfile = (artist: any) => {
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
          <CardDescription>Artistas com maior relevância no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
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
          <CardDescription>Artistas com maior relevância no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum artista cadastrado ainda
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
          <CardDescription>Artistas com maior relevância no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artists.map((artist, index) => (
              <div
                key={artist.id}
                className="relative overflow-hidden rounded-xl bg-card border border-border group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 w-full h-[350px]"
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

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-black/50 rounded px-2 py-3">
                        <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                          <Music className="h-3 w-3" />
                          <span>Lançamentos</span>
                        </div>
                        <div className="text-xl font-bold text-white">{artist.releaseCount}</div>
                      </div>
                      <div className="bg-black/50 rounded px-2 py-3">
                        <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Atividades</span>
                        </div>
                        <div className="text-xl font-bold text-white">{artist.recentActivity}</div>
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
