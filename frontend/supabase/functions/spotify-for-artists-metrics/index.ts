import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistId } = await req.json();

    if (!artistId) {
      return new Response(
        JSON.stringify({ error: 'Artist ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar token do artista
    const { data: tokenData, error: tokenError } = await supabase
      .from('spotify_artist_tokens')
      .select('*')
      .eq('artist_id', artistId)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          error: 'Artista não conectado ao Spotify',
          needsAuth: true 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se token expirou
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: 'Token expirado, reconectar',
          needsAuth: true 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do usuário
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Spotify user data');
    }

    const userData = await userResponse.json();

    // Buscar top tracks do usuário
    const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });

    let topTracks = [];
    if (topTracksResponse.ok) {
      const topTracksData = await topTracksResponse.json();
      topTracks = topTracksData.items || [];
    }

    // Buscar recently played
    const recentResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });

    let recentlyPlayed = [];
    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      recentlyPlayed = recentData.items || [];
    }

    const result = {
      user: {
        id: userData.id,
        name: userData.display_name,
        email: userData.email,
        followers: userData.followers?.total,
        image: userData.images?.[0]?.url,
        country: userData.country,
        product: userData.product,
      },
      topTracks: topTracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists?.[0]?.name,
        album: track.album?.name,
        popularity: track.popularity,
      })),
      recentlyPlayed: recentlyPlayed.map((item: any) => ({
        id: item.track?.id,
        name: item.track?.name,
        artist: item.track?.artists?.[0]?.name,
        played_at: item.played_at,
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
