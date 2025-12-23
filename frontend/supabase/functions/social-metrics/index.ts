import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

// Spotify
async function getSpotifyMetrics(spotifyUrl: string) {
  try {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.log('[social-metrics] Spotify credentials not configured');
      return null;
    }
    
    const match = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/);
    if (!match) {
      console.log('[social-metrics] Invalid Spotify URL:', spotifyUrl);
      return null;
    }
    const artistId = match[1];

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!tokenResponse.ok) {
      console.log('[social-metrics] Failed to get Spotify token');
      return null;
    }
    
    const tokenData = await tokenResponse.json();

    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    
    if (!artistResponse.ok) {
      console.log('[social-metrics] Failed to get Spotify artist data');
      return null;
    }
    
    const artist = await artistResponse.json();
    
    console.log('[social-metrics] Spotify metrics fetched:', artist.name, artist.followers?.total);

    return {
      platform: 'spotify',
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
    };
  } catch (error) {
    console.error('[social-metrics] Spotify error:', error);
    return null;
  }
}

// YouTube
async function getYouTubeMetrics(youtubeUrl: string) {
  try {
    if (!YOUTUBE_API_KEY) {
      console.log('[social-metrics] YouTube API key not configured');
      return null;
    }

    let channelId = null;
    const channelMatch = youtubeUrl.match(/channel\/([a-zA-Z0-9_-]+)/);
    const handleMatch = youtubeUrl.match(/\/@([a-zA-Z0-9_-]+)/);
    const userMatch = youtubeUrl.match(/user\/([a-zA-Z0-9_-]+)/);

    if (channelMatch) {
      channelId = channelMatch[1];
    } else if (handleMatch) {
      // Buscar por handle
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${handleMatch[1]}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        console.log('[social-metrics] YouTube metrics fetched via handle:', data.items[0].snippet?.title);
        return {
          platform: 'youtube',
          subscribers: parseInt(data.items[0].statistics?.subscriberCount || '0', 10),
          views: parseInt(data.items[0].statistics?.viewCount || '0', 10),
          videoCount: parseInt(data.items[0].statistics?.videoCount || '0', 10),
        };
      }
    } else if (userMatch) {
      // Buscar por username legado
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forUsername=${userMatch[1]}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        console.log('[social-metrics] YouTube metrics fetched via user:', data.items[0].snippet?.title);
        return {
          platform: 'youtube',
          subscribers: parseInt(data.items[0].statistics?.subscriberCount || '0', 10),
          views: parseInt(data.items[0].statistics?.viewCount || '0', 10),
          videoCount: parseInt(data.items[0].statistics?.videoCount || '0', 10),
        };
      }
    }

    if (channelId) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        console.log('[social-metrics] YouTube metrics fetched via channelId:', data.items[0].snippet?.title);
        return {
          platform: 'youtube',
          subscribers: parseInt(data.items[0].statistics?.subscriberCount || '0', 10),
          views: parseInt(data.items[0].statistics?.viewCount || '0', 10),
          videoCount: parseInt(data.items[0].statistics?.videoCount || '0', 10),
        };
      }
    }

    console.log('[social-metrics] Could not extract YouTube channel from URL:', youtubeUrl);
    return null;
  } catch (error) {
    console.error('[social-metrics] YouTube error:', error);
    return null;
  }
}

// Deezer (API pública - não requer autenticação)
async function getDeezerMetrics(deezerUrl: string) {
  try {
    const match = deezerUrl.match(/deezer\.com\/(?:br\/|us\/|en\/|fr\/)?artist\/(\d+)/);
    if (!match) {
      console.log('[social-metrics] Invalid Deezer URL:', deezerUrl);
      return null;
    }
    const artistId = match[1];

    const response = await fetch(`https://api.deezer.com/artist/${artistId}`);
    if (!response.ok) {
      console.log('[social-metrics] Deezer API error');
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.log('[social-metrics] Deezer API returned error:', data.error);
      return null;
    }
    
    console.log('[social-metrics] Deezer metrics fetched:', data.name, data.nb_fan);
    
    return {
      platform: 'deezer',
      followers: data.nb_fan || 0,
    };
  } catch (error) {
    console.error('[social-metrics] Deezer error:', error);
    return null;
  }
}

// Instagram - Retorna null pois requer autenticação Meta/Instagram Graph API
async function getInstagramMetrics(instagramUrl: string) {
  // Instagram requer autenticação via Meta Graph API
  // Por enquanto, retornamos null e o usuário pode cadastrar manualmente
  console.log('[social-metrics] Instagram requires Meta Graph API authentication');
  return null;
}

// TikTok - Retorna null pois requer autenticação
async function getTikTokMetrics(tiktokUrl: string) {
  // TikTok requer autenticação via TikTok for Developers API
  // Por enquanto, retornamos null e o usuário pode cadastrar manualmente
  console.log('[social-metrics] TikTok requires API authentication');
  return null;
}

// Apple Music - Não tem API pública para métricas de artistas
async function getAppleMusicMetrics(appleMusicUrl: string) {
  console.log('[social-metrics] Apple Music does not have public artist metrics API');
  return null;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.json();
    const { artistId, spotifyUrl, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl, appleMusicUrl } = body;
    
    console.log('[social-metrics] Request received for artistId:', artistId);
    console.log('[social-metrics] URLs:', { spotifyUrl, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl, appleMusicUrl });

    const results: Record<string, any> = {};
    const errors: string[] = [];
    const promises: Promise<void>[] = [];

    // Spotify
    if (spotifyUrl && spotifyUrl.includes('spotify.com') && spotifyUrl.includes('/artist/')) {
      promises.push(
        getSpotifyMetrics(spotifyUrl).then(data => {
          if (data) {
            results.spotify = data;
          } else {
            errors.push('Spotify: Não foi possível obter métricas');
          }
        }).catch(e => errors.push(`Spotify: ${e.message}`))
      );
    }

    // YouTube
    if (youtubeUrl && youtubeUrl.includes('youtube.com')) {
      promises.push(
        getYouTubeMetrics(youtubeUrl).then(data => {
          if (data) {
            results.youtube = data;
          } else {
            errors.push('YouTube: Não foi possível obter métricas');
          }
        }).catch(e => errors.push(`YouTube: ${e.message}`))
      );
    }

    // Deezer
    if (deezerUrl && deezerUrl.includes('deezer.com')) {
      promises.push(
        getDeezerMetrics(deezerUrl).then(data => {
          if (data) {
            results.deezer = data;
          } else {
            errors.push('Deezer: Não foi possível obter métricas');
          }
        }).catch(e => errors.push(`Deezer: ${e.message}`))
      );
    }

    // Instagram (não funciona sem autenticação)
    if (instagramUrl && instagramUrl.includes('instagram.com')) {
      errors.push('Instagram: Requer configuração da API Meta Graph');
    }

    // TikTok (não funciona sem autenticação)
    if (tiktokUrl && tiktokUrl.includes('tiktok.com')) {
      errors.push('TikTok: Requer configuração da API TikTok for Developers');
    }

    // Apple Music (não tem API pública)
    if (appleMusicUrl && appleMusicUrl.includes('music.apple.com')) {
      errors.push('Apple Music: Não possui API pública para métricas');
    }

    await Promise.all(promises);
    
    console.log('[social-metrics] Results:', results);
    console.log('[social-metrics] Errors:', errors);

    // Save to database if artistId provided and we have results
    const dbResults: Record<string, any> = {};
    
    if (artistId && Object.keys(results).length > 0) {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      for (const [platform, data] of Object.entries(results)) {
        try {
          const metricsData: any = {
            artist_id: artistId,
            platform,
            metric_type: 'followers',
            date: today,
            followers: data.followers || data.subscribers || 0,
          };

          // Primeiro deletar registro existente para o mesmo artista/plataforma/data
          await supabase
            .from('social_media_metrics')
            .delete()
            .eq('artist_id', artistId)
            .eq('platform', platform)
            .eq('date', today);

          // Depois inserir novo registro
          const { error } = await supabase
            .from('social_media_metrics')
            .insert(metricsData);

          if (error) {
            console.error(`[social-metrics] DB error for ${platform}:`, error);
            dbResults[platform] = { saved: false, error: error.message };
          } else {
            console.log(`[social-metrics] Saved ${platform} metrics to DB`);
            dbResults[platform] = { saved: true };
          }
        } catch (dbError) {
          console.error(`[social-metrics] DB exception for ${platform}:`, dbError);
          dbResults[platform] = { saved: false, error: String(dbError) };
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: Object.keys(results).length > 0,
        data: results, 
        db: dbResults,
        errors: errors.length > 0 ? errors : undefined,
        fetched_at: new Date().toISOString() 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[social-metrics] Fatal error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
