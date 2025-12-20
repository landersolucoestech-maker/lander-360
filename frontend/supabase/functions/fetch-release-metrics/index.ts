import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricsData {
  platform: string;
  streams: number;
  views: number;
  saves: number;
  playlist_adds: number;
}

// Get Spotify access token
async function getSpotifyToken(): Promise<string | null> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.log('Spotify credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('Failed to get Spotify token:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return null;
  }
}

// Search for track on Spotify and get metrics
// NOTE: Spotify public API doesn't provide real stream counts
// This returns popularity score (0-100) which we store as-is
async function getSpotifyMetrics(token: string, trackName: string, artistName: string): Promise<MetricsData | null> {
  try {
    const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    if (!searchResponse.ok) {
      console.error('Spotify search failed:', await searchResponse.text());
      return null;
    }

    const searchData = await searchResponse.json();
    const track = searchData.tracks?.items?.[0];

    if (!track) {
      console.log('Track not found on Spotify:', trackName, artistName);
      return null;
    }

    console.log('Spotify track found:', track.name, 'by', track.artists?.[0]?.name, 'popularity:', track.popularity);

    // Return 0 streams since we don't have real data
    // Spotify for Artists API would be needed for real stream counts
    return {
      platform: 'spotify',
      streams: 0, // No real stream data available from public API
      views: 0,
      saves: 0,
      playlist_adds: 0,
    };
  } catch (error) {
    console.error('Error fetching Spotify metrics:', error);
    return null;
  }
}

// Get YouTube video metrics
async function getYouTubeMetrics(apiKey: string, trackName: string, artistName: string): Promise<MetricsData | null> {
  try {
    const query = encodeURIComponent(`${trackName} ${artistName} official`);
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`
    );

    if (!searchResponse.ok) {
      console.error('YouTube search failed:', await searchResponse.text());
      return null;
    }

    const searchData = await searchResponse.json();
    const videoId = searchData.items?.[0]?.id?.videoId;

    if (!videoId) {
      console.log('Video not found on YouTube:', trackName, artistName);
      return null;
    }

    // Get video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
    );

    if (!statsResponse.ok) {
      console.error('YouTube stats failed:', await statsResponse.text());
      return null;
    }

    const statsData = await statsResponse.json();
    const stats = statsData.items?.[0]?.statistics;

    if (!stats) {
      return null;
    }

    return {
      platform: 'youtube',
      streams: 0,
      views: parseInt(stats.viewCount || '0'),
      saves: parseInt(stats.likeCount || '0'),
      playlist_adds: 0,
    };
  } catch (error) {
    console.error('Error fetching YouTube metrics:', error);
    return null;
  }
}

// Get Deezer metrics (public API, no auth required)
// NOTE: Deezer public API doesn't provide stream counts
async function getDeezerMetrics(trackName: string, artistName: string): Promise<MetricsData | null> {
  try {
    const query = encodeURIComponent(`track:"${trackName}" artist:"${artistName}"`);
    const searchResponse = await fetch(
      `https://api.deezer.com/search?q=${query}&limit=1`
    );

    if (!searchResponse.ok) {
      console.error('Deezer search failed:', await searchResponse.text());
      return null;
    }

    const searchData = await searchResponse.json();
    const track = searchData.data?.[0];

    if (!track) {
      console.log('Track not found on Deezer:', trackName, artistName);
      return null;
    }

    console.log('Deezer track found:', track.title, 'by', track.artist?.name);

    // Return 0 streams since Deezer doesn't provide real stream counts
    return {
      platform: 'deezer',
      streams: 0, // No real stream data available from public API
      views: 0,
      saves: 0,
      playlist_adds: 0,
    };
  } catch (error) {
    console.error('Error fetching Deezer metrics:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { releaseId, trackName, artistName } = await req.json();

    if (!releaseId || !trackName || !artistName) {
      return new Response(
        JSON.stringify({ error: 'releaseId, trackName, and artistName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching metrics for:', { releaseId, trackName, artistName });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const metrics: MetricsData[] = [];

    // Fetch Spotify metrics
    const spotifyToken = await getSpotifyToken();
    if (spotifyToken) {
      const spotifyMetrics = await getSpotifyMetrics(spotifyToken, trackName, artistName);
      if (spotifyMetrics) {
        metrics.push(spotifyMetrics);
      }
    }

    // Fetch YouTube metrics
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (youtubeApiKey) {
      const youtubeMetrics = await getYouTubeMetrics(youtubeApiKey, trackName, artistName);
      if (youtubeMetrics) {
        metrics.push(youtubeMetrics);
      }
    }

    // Fetch Deezer metrics (no API key needed)
    const deezerMetrics = await getDeezerMetrics(trackName, artistName);
    if (deezerMetrics) {
      metrics.push(deezerMetrics);
    }

    // Save metrics to database
    const now = new Date().toISOString();
    for (const metric of metrics) {
      const { error } = await supabase
        .from('release_streaming_metrics')
        .upsert({
          release_id: releaseId,
          platform: metric.platform,
          streams: metric.streams,
          views: metric.views,
          saves: metric.saves,
          playlist_adds: metric.playlist_adds,
          fetched_at: now,
        }, {
          onConflict: 'release_id,platform,fetched_at',
        });

      if (error) {
        console.error(`Error saving ${metric.platform} metrics:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics,
        message: `Fetched metrics from ${metrics.length} platforms`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-release-metrics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});