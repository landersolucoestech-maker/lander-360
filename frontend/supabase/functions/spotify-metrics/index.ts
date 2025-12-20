import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

async function getSpotifyToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  return data.access_token;
}

async function getArtistData(token: string, artistId: string) {
  const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get artist data');
  }

  return response.json();
}

async function getTopTracks(token: string, artistId: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=BR`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return data.tracks || [];
}

async function getMonthlyListeners(artistId: string): Promise<number> {
  try {
    const response = await fetch(`https://open.spotify.com/artist/${artistId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return 0;

    const html = await response.text();
    const match = html.match(/(\d[\d,.]*)\s*(?:monthly listeners|ouvintes mensais)/i);
    if (match) {
      return parseInt(match[1].replace(/[,.]/g, ''), 10) || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

function extractSpotifyId(url: string): string | null {
  if (!url) return null;
  if (url.includes('/user/')) return null;
  const match = url.match(/artist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : url.includes('/') ? null : url;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistId, spotifyUrl } = await req.json();
    const spotifyId = extractSpotifyId(spotifyUrl) || artistId;

    if (!spotifyId) {
      return new Response(
        JSON.stringify({ error: 'Spotify artist ID or URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = await getSpotifyToken();
    const [artist, topTracks, monthlyListeners] = await Promise.all([
      getArtistData(token, spotifyId),
      getTopTracks(token, spotifyId),
      getMonthlyListeners(spotifyId),
    ]);

    const result = {
      spotify_artist_id: spotifyId,
      name: artist.name,
      image_url: artist.images?.[0]?.url,
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      monthly_listeners: monthlyListeners,
      genres: artist.genres || [],
      top_tracks: topTracks.slice(0, 10).map((track: any) => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity,
        preview_url: track.preview_url,
        album_name: track.album?.name,
        album_image: track.album?.images?.[0]?.url,
      })),
      fetched_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
