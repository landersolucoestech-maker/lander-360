import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

// Spotify
async function getSpotifyMetrics(spotifyUrl: string) {
  try {
    const match = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const artistId = match[1];

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenResponse.json();

    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const artist = await artistResponse.json();

    return {
      platform: 'spotify',
      followers: artist.followers?.total || 0,
      popularity: artist.popularity || 0,
    };
  } catch {
    return null;
  }
}

// YouTube
async function getYouTubeMetrics(youtubeUrl: string) {
  try {
    if (!YOUTUBE_API_KEY) return null;

    let channelId = null;
    const channelMatch = youtubeUrl.match(/channel\/([a-zA-Z0-9_-]+)/);
    const handleMatch = youtubeUrl.match(/\/@([a-zA-Z0-9_-]+)/);

    if (channelMatch) {
      channelId = channelMatch[1];
    } else if (handleMatch) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${handleMatch[1]}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        return {
          platform: 'youtube',
          subscribers: parseInt(data.items[0].statistics?.subscriberCount || '0', 10),
          views: parseInt(data.items[0].statistics?.viewCount || '0', 10),
        };
      }
    }

    if (channelId) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      if (data.items?.[0]) {
        return {
          platform: 'youtube',
          subscribers: parseInt(data.items[0].statistics?.subscriberCount || '0', 10),
          views: parseInt(data.items[0].statistics?.viewCount || '0', 10),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Instagram (via scraping fallback)
async function getInstagramMetrics(instagramUrl: string) {
  try {
    const match = instagramUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (!match) return null;
    const username = match[1];

    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const followersMatch = html.match(/"edge_followed_by":\s*{\s*"count":\s*(\d+)/);
    
    return {
      platform: 'instagram',
      followers: followersMatch ? parseInt(followersMatch[1], 10) : 0,
    };
  } catch {
    return null;
  }
}

// TikTok (via scraping)
async function getTikTokMetrics(tiktokUrl: string) {
  try {
    const match = tiktokUrl.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/);
    if (!match) return null;
    const username = match[1];

    const response = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const followersMatch = html.match(/"followerCount":\s*(\d+)/);
    const likesMatch = html.match(/"heartCount":\s*(\d+)/);
    
    return {
      platform: 'tiktok',
      followers: followersMatch ? parseInt(followersMatch[1], 10) : 0,
      likes: likesMatch ? parseInt(likesMatch[1], 10) : 0,
    };
  } catch {
    return null;
  }
}

// Deezer (API pública)
async function getDeezerMetrics(deezerUrl: string) {
  try {
    const match = deezerUrl.match(/deezer\.com\/(?:br\/|us\/|en\/)?artist\/(\d+)/);
    if (!match) return null;
    const artistId = match[1];

    const response = await fetch(`https://api.deezer.com/artist/${artistId}`);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      platform: 'deezer',
      followers: data.nb_fan || 0,
    };
  } catch {
    return null;
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistId, spotifyUrl, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl } = await req.json();

    const results: Record<string, any> = {};
    const promises: Promise<void>[] = [];

    if (spotifyUrl) {
      promises.push(
        getSpotifyMetrics(spotifyUrl).then(data => {
          if (data) results.spotify = data;
        })
      );
    }

    if (youtubeUrl) {
      promises.push(
        getYouTubeMetrics(youtubeUrl).then(data => {
          if (data) results.youtube = data;
        })
      );
    }

    if (instagramUrl) {
      promises.push(
        getInstagramMetrics(instagramUrl).then(data => {
          if (data) results.instagram = data;
        })
      );
    }

    if (tiktokUrl) {
      promises.push(
        getTikTokMetrics(tiktokUrl).then(data => {
          if (data) results.tiktok = data;
        })
      );
    }

    if (deezerUrl) {
      promises.push(
        getDeezerMetrics(deezerUrl).then(data => {
          if (data) results.deezer = data;
        })
      );
    }

    await Promise.all(promises);

    // Save to database if artistId provided
    if (artistId && Object.keys(results).length > 0) {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];

      for (const [platform, data] of Object.entries(results)) {
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform,
          metric_type: 'followers',
          date: today,
          followers: data.followers || 0,
          value: data.views || data.likes || data.popularity || 0,
        }, {
          onConflict: 'artist_id,platform,date',
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: results, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
