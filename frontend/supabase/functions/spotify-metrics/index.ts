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

async function getArtistAlbums(token: string, artistId: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=BR&limit=10`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return data.items || [];
}

async function getRelatedArtists(token: string, artistId: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!response.ok) return [];
  const data = await response.json();
  return (data.artists || []).slice(0, 5);
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
    
    // Busca dados em paralelo usando apenas API oficial
    const [artist, topTracks, albums, relatedArtists] = await Promise.all([
      getArtistData(token, spotifyId),
      getTopTracks(token, spotifyId),
      getArtistAlbums(token, spotifyId),
      getRelatedArtists(token, spotifyId),
    ]);

    const result = {
      spotify_artist_id: spotifyId,
      name: artist.name,
      image_url: artist.images?.[0]?.url,
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
      // Nota: monthly_listeners não está disponível na API pública do Spotify
      // O valor de 'followers' é a métrica mais próxima disponível oficialmente
      monthly_listeners: null, // Removido scraping - usar followers como alternativa
      genres: artist.genres || [],
      external_urls: artist.external_urls,
      top_tracks: topTracks.slice(0, 10).map((track: any) => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity,
        preview_url: track.preview_url,
        album_name: track.album?.name,
        album_image: track.album?.images?.[0]?.url,
        duration_ms: track.duration_ms,
        explicit: track.explicit,
      })),
      recent_albums: albums.map((album: any) => ({
        id: album.id,
        name: album.name,
        release_date: album.release_date,
        total_tracks: album.total_tracks,
        album_type: album.album_type,
        image_url: album.images?.[0]?.url,
      })),
      related_artists: relatedArtists.map((ra: any) => ({
        id: ra.id,
        name: ra.name,
        popularity: ra.popularity,
        image_url: ra.images?.[0]?.url,
      })),
      fetched_at: new Date().toISOString(),
    };

    // Salvar métricas no banco de dados
    const supabase = getSupabaseClient();
    
    console.log('Saving metrics for artist_id:', artistId);
    
    // Calcular total de streams das top tracks
    const totalStreams = topTracks.slice(0, 5).reduce((sum: number, track: any) => {
      // Não temos playcount direto, mas podemos usar popularity como métrica
      return sum + (track.popularity || 0);
    }, 0) * 10000; // Estimativa baseada na popularidade
    
    const metricsData = {
      artist_id: artistId,
      spotify_artist_id: spotifyId,
      followers: result.followers,
      popularity: result.popularity,
      monthly_listeners: result.monthly_listeners,
      total_streams: totalStreams,
      top_tracks: result.top_tracks,
      fetched_at: result.fetched_at,
    };
    
    console.log('Metrics data:', JSON.stringify(metricsData));
    
    // Verificar se já existe um registro recente (últimas 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingMetrics, error: selectError } = await supabase
      .from('spotify_metrics')
      .select('id, fetched_at')
      .eq('artist_id', artistId)
      .gte('fetched_at', oneDayAgo)
      .order('fetched_at', { ascending: false })
      .limit(1);
    
    if (selectError) {
      console.error('Error selecting existing metrics:', selectError);
    }
    
    let dbOperation = 'none';
    let dbError = null;
    
    if (existingMetrics && existingMetrics.length > 0) {
      // Atualizar registro existente
      dbOperation = 'update';
      const { error: updateError } = await supabase
        .from('spotify_metrics')
        .update(metricsData)
        .eq('id', existingMetrics[0].id);
      
      if (updateError) {
        console.error('Error updating spotify metrics:', updateError);
        dbError = updateError;
      }
    } else {
      // Criar novo registro
      dbOperation = 'insert';
      const { error: insertError } = await supabase
        .from('spotify_metrics')
        .insert(metricsData);
      
      if (insertError) {
        console.error('Error inserting spotify metrics:', insertError);
        dbError = insertError;
      }
    }
    
    console.log('DB operation:', dbOperation, 'Error:', dbError);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result, 
        db: { operation: dbOperation, error: dbError?.message || null }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
