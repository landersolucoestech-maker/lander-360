import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const SPOTIFY_REFRESH_TOKEN = Deno.env.get('SPOTIFY_REFRESH_TOKEN');

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  followers: { total: number };
  popularity: number;
  images: { url: string }[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  album: {
    name: string;
    images: { url: string }[];
  };
}

// Get Spotify access token using Refresh Token (user-authenticated)
async function getSpotifyTokenWithRefresh(): Promise<string> {
  if (!SPOTIFY_REFRESH_TOKEN) {
    console.log('No refresh token available, falling back to client credentials');
    return getSpotifyTokenClientCredentials();
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: `grant_type=refresh_token&refresh_token=${SPOTIFY_REFRESH_TOKEN}`,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to refresh token:', error);
      // Fallback to client credentials
      return getSpotifyTokenClientCredentials();
    }

    const data: SpotifyTokenResponse = await response.json();
    console.log('Successfully refreshed Spotify token');
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return getSpotifyTokenClientCredentials();
  }
}

// Fallback: Get Spotify access token using Client Credentials flow
async function getSpotifyTokenClientCredentials(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get Spotify token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

// Get artist data from Spotify
async function getSpotifyArtist(token: string, spotifyArtistId: string): Promise<SpotifyArtist> {
  const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyArtistId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get artist:', error);
    throw new Error(`Failed to get artist: ${response.status}`);
  }

  return response.json();
}

// Get artist's top tracks
async function getTopTracks(token: string, spotifyArtistId: string, market = 'BR'): Promise<SpotifyTrack[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${spotifyArtistId}/top-tracks?market=${market}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Failed to get top tracks');
    return [];
  }

  const data = await response.json();
  return data.tracks || [];
}

// Scrape monthly listeners from Spotify page
async function getMonthlyListeners(spotifyArtistId: string): Promise<number> {
  try {
    const url = `https://open.spotify.com/artist/${spotifyArtistId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.log('Failed to fetch Spotify page for monthly listeners');
      return 0;
    }

    const html = await response.text();
    
    // Try to find monthly listeners in the HTML
    // Pattern 1: Look for "X monthly listeners" text
    const listenersMatch = html.match(/(\d[\d,\.]*)\s*(?:monthly listeners|ouvintes mensais)/i);
    if (listenersMatch) {
      const cleanNumber = listenersMatch[1].replace(/[,\.]/g, '');
      const parsed = parseInt(cleanNumber, 10);
      console.log('Extracted monthly listeners:', parsed);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Pattern 2: Look in meta tags or JSON-LD
    const metaMatch = html.match(/"monthlyListeners"\s*:\s*"?(\d+)"?/i);
    if (metaMatch) {
      const parsed = parseInt(metaMatch[1], 10);
      console.log('Extracted monthly listeners from meta:', parsed);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Pattern 3: Look for listeners count in script data
    const scriptMatch = html.match(/listeners['"]\s*:\s*['"]?(\d+)['"]?/i);
    if (scriptMatch) {
      const parsed = parseInt(scriptMatch[1], 10);
      console.log('Extracted monthly listeners from script:', parsed);
      return isNaN(parsed) ? 0 : parsed;
    }

    console.log('Could not extract monthly listeners from page');
    return 0;
  } catch (error) {
    console.error('Error scraping monthly listeners:', error);
    return 0;
  }
}

// Extract Spotify artist ID from URL
function extractSpotifyId(spotifyUrl: string): string | null {
  if (!spotifyUrl) return null;
  
  // Only accept artist URLs, not user URLs or other types
  if (spotifyUrl.includes('/user/')) {
    console.log('Skipping user URL, not an artist URL:', spotifyUrl);
    return null;
  }
  
  // Handle direct ID
  if (!spotifyUrl.includes('/') && !spotifyUrl.includes('?')) {
    return spotifyUrl;
  }
  
  // Handle URLs like https://open.spotify.com/artist/1234567890
  const match = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { artistId, spotifyArtistId, spotifyUrl, action } = await req.json();

    console.log('Request received:', { artistId, spotifyArtistId, spotifyUrl, action });

    // Extract spotify ID from URL if provided
    let spotifyId = spotifyArtistId || extractSpotifyId(spotifyUrl || '');

    if (!spotifyId) {
      return new Response(
        JSON.stringify({ error: 'Spotify artist ID or URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Spotify access token (prefer refresh token for authenticated access)
    const token = await getSpotifyTokenWithRefresh();
    console.log('Got Spotify token (using refresh token:', !!SPOTIFY_REFRESH_TOKEN, ')');

    // Fetch artist data
    const artist = await getSpotifyArtist(token, spotifyId);
    console.log('Got artist data:', artist.name);

    // Fetch top tracks
    const topTracks = await getTopTracks(token, spotifyId);
    console.log('Got top tracks:', topTracks.length);

    // Fetch monthly listeners via scraping
    let monthlyListeners = await getMonthlyListeners(spotifyId);
    console.log('Got monthly listeners from scraping:', monthlyListeners);

    if (!monthlyListeners || monthlyListeners <= 0) {
      console.log('No valid monthly listeners found, will store as null');
      monthlyListeners = 0;
    }

    // Calculate estimated total streams from top tracks popularity
    // Note: Real stream counts are NOT available via public API
    // This is an estimation based on popularity score
    const estimatedStreams = topTracks.reduce((sum, track) => {
      // Rough estimation: popularity 100 = ~1B streams, scales logarithmically
      const streamEstimate = Math.pow(10, (track.popularity / 20) + 4);
      return sum + streamEstimate;
    }, 0);

    const metricsData = {
      artist_id: artistId,
      spotify_artist_id: spotifyId,
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      monthly_listeners: monthlyListeners && monthlyListeners > 0 ? monthlyListeners : null,
      total_streams: Math.round(estimatedStreams),
      top_tracks: topTracks.slice(0, 10).map(track => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity,
        preview_url: track.preview_url,
        spotify_url: track.external_urls?.spotify,
        album_name: track.album?.name,
        album_image: track.album?.images?.[0]?.url,
        streams: Math.round(Math.pow(10, (track.popularity / 20) + 4)), // Estimated streams
      })),
      fetched_at: new Date().toISOString(),
    };

    // Save metrics to database if artistId provided
    if (artistId) {
      const { error: insertError } = await supabase
        .from('spotify_metrics')
        .insert(metricsData);

      if (insertError) {
        console.error('Error saving metrics:', insertError);
        // Continue anyway, we'll return the data
      } else {
        console.log('Metrics saved successfully');
      }

      // Also update the artist's spotify_id if not set
      const { error: updateError } = await supabase
        .from('artists')
        .update({ spotify_id: spotifyId })
        .eq('id', artistId)
        .is('spotify_id', null);

      if (updateError) {
        console.error('Error updating artist spotify_id:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...metricsData,
          artist_name: artist.name,
          artist_image: artist.images?.[0]?.url,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in spotify-metrics function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
