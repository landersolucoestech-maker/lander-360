import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

// API Keys from Supabase Secrets
const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY');
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET');

// Spotify - API Oficial
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

// YouTube - Data API v3
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

// Instagram - Meta Graph API
async function getInstagramMetrics(instagramUrl: string) {
  try {
    if (!META_ACCESS_TOKEN) {
      console.log('[social-metrics] Meta access token not configured');
      return null;
    }

    // Extrair username do Instagram
    const match = instagramUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (!match) {
      console.log('[social-metrics] Invalid Instagram URL:', instagramUrl);
      return null;
    }
    const username = match[1];

    // Primeiro, buscar o Business Account ID associado
    // A Meta Graph API requer um Instagram Business Account conectado a uma Facebook Page
    const searchResponse = await fetch(
      `https://graph.facebook.com/v18.0/ig_hashtag_search?user_id=me&q=${username}&access_token=${META_ACCESS_TOKEN}`
    );
    
    // Tentar buscar métricas diretas se tivermos o Instagram Business Account ID
    // Por padrão, tentar buscar via /me/accounts
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username,followers_count,media_count}&access_token=${META_ACCESS_TOKEN}`
    );
    
    if (!accountsResponse.ok) {
      console.log('[social-metrics] Failed to get Instagram accounts');
      return null;
    }
    
    const accountsData = await accountsResponse.json();
    console.log('[social-metrics] Instagram accounts data:', JSON.stringify(accountsData));
    
    // Procurar pelo username nas contas conectadas
    for (const page of accountsData.data || []) {
      const igAccount = page.instagram_business_account;
      if (igAccount && igAccount.username?.toLowerCase() === username.toLowerCase()) {
        console.log('[social-metrics] Instagram metrics fetched:', igAccount.username, igAccount.followers_count);
        return {
          platform: 'instagram',
          followers: igAccount.followers_count || 0,
          mediaCount: igAccount.media_count || 0,
        };
      }
    }

    // Se não encontrou nas contas, tentar busca direta por ID (requer permissões específicas)
    console.log('[social-metrics] Instagram account not found in connected accounts');
    return null;
  } catch (error) {
    console.error('[social-metrics] Instagram error:', error);
    return null;
  }
}

// TikTok - Research API ou Display API
async function getTikTokMetrics(tiktokUrl: string) {
  try {
    if (!TIKTOK_CLIENT_KEY) {
      console.log('[social-metrics] TikTok API key not configured');
      return null;
    }

    // Extrair username do TikTok
    const match = tiktokUrl.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/);
    if (!match) {
      console.log('[social-metrics] Invalid TikTok URL:', tiktokUrl);
      return null;
    }
    const username = match[1];

    // TikTok Display API - requer OAuth do usuário
    // TikTok Research API - requer aprovação especial
    // Por enquanto, tentamos scraping como fallback
    
    const response = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.log('[social-metrics] TikTok request failed:', response.status);
      return null;
    }

    const html = await response.text();
    
    // Tentar extrair dados do JSON embutido na página
    const jsonMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        const userInfo = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo;
        if (userInfo) {
          console.log('[social-metrics] TikTok metrics fetched:', userInfo.user?.uniqueId, userInfo.stats?.followerCount);
          return {
            platform: 'tiktok',
            followers: userInfo.stats?.followerCount || 0,
            likes: userInfo.stats?.heartCount || 0,
            videoCount: userInfo.stats?.videoCount || 0,
          };
        }
      } catch (parseError) {
        console.log('[social-metrics] Failed to parse TikTok JSON');
      }
    }

    // Fallback: tentar regex simples
    const followersMatch = html.match(/"followerCount":\s*(\d+)/);
    const likesMatch = html.match(/"heartCount":\s*(\d+)/);
    
    if (followersMatch) {
      console.log('[social-metrics] TikTok metrics fetched via regex');
      return {
        platform: 'tiktok',
        followers: parseInt(followersMatch[1], 10),
        likes: likesMatch ? parseInt(likesMatch[1], 10) : 0,
      };
    }

    console.log('[social-metrics] Could not extract TikTok metrics');
    return null;
  } catch (error) {
    console.error('[social-metrics] TikTok error:', error);
    return null;
  }
}

// Deezer - API Pública
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

// Apple Music - Não tem API pública
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
    console.log('[social-metrics] API Keys configured:', {
      spotify: !!SPOTIFY_CLIENT_ID,
      youtube: !!YOUTUBE_API_KEY,
      meta: !!META_ACCESS_TOKEN,
      tiktok: !!TIKTOK_CLIENT_KEY,
    });

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

    // Instagram
    if (instagramUrl && instagramUrl.includes('instagram.com') && !instagramUrl.includes('/perfil')) {
      promises.push(
        getInstagramMetrics(instagramUrl).then(data => {
          if (data) {
            results.instagram = data;
          } else {
            errors.push('Instagram: Requer conta Business conectada à Meta');
          }
        }).catch(e => errors.push(`Instagram: ${e.message}`))
      );
    }

    // TikTok
    if (tiktokUrl && tiktokUrl.includes('tiktok.com') && !tiktokUrl.includes('@perfil')) {
      promises.push(
        getTikTokMetrics(tiktokUrl).then(data => {
          if (data) {
            results.tiktok = data;
          } else {
            errors.push('TikTok: Não foi possível obter métricas');
          }
        }).catch(e => errors.push(`TikTok: ${e.message}`))
      );
    }

    // Deezer
    if (deezerUrl && deezerUrl.includes('deezer.com') && !deezerUrl.includes('/...')) {
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

    // Apple Music
    if (appleMusicUrl && appleMusicUrl.includes('music.apple.com')) {
      errors.push('Apple Music: API não disponível');
    }

    await Promise.all(promises);
    
    console.log('[social-metrics] Results:', results);
    console.log('[social-metrics] Errors:', errors);

    // Save to database
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

          // Delete existing record for today
          await supabase
            .from('social_media_metrics')
            .delete()
            .eq('artist_id', artistId)
            .eq('platform', platform)
            .eq('date', today);

          // Insert new record
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
