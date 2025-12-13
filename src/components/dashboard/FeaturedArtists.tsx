import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, TrendingUp, Music, Calendar } from "lucide-react";

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
  const { data: artists, isLoading } = useQuery({
    queryKey: ['featured-artists'],
    queryFn: async (): Promise<FeaturedArtist[]> => {
      // Fetch artists with their releases and recent activity
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('id, name, stage_name, image_url, genre')
        .limit(50);

      if (artistsError) throw artistsError;

      if (!artistsData || artistsData.length === 0) return [];

      // Get release counts per artist
      const { data: releases } = await supabase
        .from('releases')
        .select('artist_id')
        .not('artist_id', 'is', null);

      // Get recent agenda events (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: events } = await supabase
        .from('agenda_events')
        .select('artist_id')
        .gte('start_date', thirtyDaysAgo.toISOString())
        .not('artist_id', 'is', null);

      // Calculate relevance score for each artist
      const artistsWithScores = artistsData.map(artist => {
        const releaseCount = releases?.filter(r => r.artist_id === artist.id).length || 0;
        const recentActivity = events?.filter(e => e.artist_id === artist.id).length || 0;
        
        // Relevance score based on releases (40%), recent activity (60%)
        const relevanceScore = (releaseCount * 40) + (recentActivity * 60);

        return {
          ...artist,
          releaseCount,
          recentActivity,
          relevanceScore
        };
      });

      // Sort by relevance score and return top 4
      return artistsWithScores
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              <div key={i} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
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
              className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors relative"
            >
              {index === 0 && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-950">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  #1
                </Badge>
              )}
              <Avatar className="h-16 w-16">
                <AvatarImage src={artist.image_url || undefined} alt={artist.stage_name || artist.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(artist.stage_name || artist.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-medium text-foreground truncate max-w-[120px]">
                  {artist.stage_name || artist.name}
                </p>
                {artist.genre && (
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {artist.genre}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  {artist.releaseCount}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {artist.recentActivity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
