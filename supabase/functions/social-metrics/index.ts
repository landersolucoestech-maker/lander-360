import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

interface YouTubeChannelData {
  subscribers: number;
  views: number;
  videoCount: number;
}

// Extract YouTube channel ID from URL
function extractYouTubeChannelId(url: string): { channelId?: string; handle?: string } | null {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  // https://www.youtube.com/channel/UC...
  const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) {
    return { channelId: channelMatch[1] };
  }
  
  // https://www.youtube.com/@handle
  const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) {
    return { handle: handleMatch[1] };
  }
  
  // https://www.youtube.com/c/channelname or /user/username
  const customMatch = url.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/);
  if (customMatch) {
    return { handle: customMatch[1] };
  }
  
  return null;
}

// Fetch YouTube channel data using Data API v3
async function getYouTubeMetrics(youtubeUrl: string): Promise<YouTubeChannelData | null> {
  if (!YOUTUBE_API_KEY) {
    console.log('YouTube API key not configured');
    return null;
  }

  const extracted = extractYouTubeChannelId(youtubeUrl);
  if (!extracted) {
    console.log('Could not extract YouTube channel info from URL:', youtubeUrl);
    return null;
  }

  try {
    let channelId = extracted.channelId;
    
    // If we have a handle, we need to resolve it to a channel ID first
    if (extracted.handle && !channelId) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(extracted.handle)}&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].snippet.channelId;
        }
      }
      
      // Also try forHandle endpoint
      if (!channelId) {
        const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${extracted.handle}&key=${YOUTUBE_API_KEY}`;
        const handleResponse = await fetch(handleUrl);
        
        if (handleResponse.ok) {
          const handleData = await handleResponse.json();
          if (handleData.items && handleData.items.length > 0) {
            const stats = handleData.items[0].statistics;
            return {
              subscribers: parseInt(stats.subscriberCount || '0', 10),
              views: parseInt(stats.viewCount || '0', 10),
              videoCount: parseInt(stats.videoCount || '0', 10),
            };
          }
        }
      }
    }

    if (!channelId) {
      console.log('Could not resolve YouTube channel ID');
      return null;
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No YouTube channel found');
      return null;
    }

    const stats = data.items[0].statistics;
    return {
      subscribers: parseInt(stats.subscriberCount || '0', 10),
      views: parseInt(stats.viewCount || '0', 10),
      videoCount: parseInt(stats.videoCount || '0', 10),
    };
  } catch (error) {
    console.error('Error fetching YouTube metrics:', error);
    return null;
  }
}

// Scrape Instagram followers using multiple methods
async function getInstagramFollowers(instagramUrl: string): Promise<number | null> {
  if (!instagramUrl) return null;
  
  try {
    // Extract username from URL
    let username = instagramUrl;
    if (instagramUrl.includes('instagram.com')) {
      const match = instagramUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
      if (match) username = match[1];
    }
    username = username.replace('@', '').replace('/', '').split('?')[0];
    
    console.log('Fetching Instagram for username:', username);
    
    // Method 1: Try i.instagram.com API (mobile API)
    try {
      const apiResponse = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent': 'Instagram 219.0.0.12.117 Android',
          'X-IG-App-ID': '936619743392459',
        },
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const followers = apiData?.data?.user?.edge_followed_by?.count;
        if (followers) {
          console.log('Instagram followers from API:', followers);
          return followers;
        }
      }
    } catch (e) {
      console.log('Instagram API method failed, trying scraping');
    }
    
    // Method 2: Scrape the profile page
    const response = await fetch(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-fetch-mode': 'navigate',
      },
    });

    if (!response.ok) {
      console.log('Instagram fetch failed with status:', response.status);
      return null;
    }

    const html = await response.text();
    
    // Pattern 1: JSON in script tag
    const jsonMatch = html.match(/"edge_followed_by":\s*{\s*"count":\s*(\d+)/);
    if (jsonMatch) {
      const count = parseInt(jsonMatch[1], 10);
      console.log('Instagram followers from JSON:', count);
      return count;
    }
    
    // Pattern 2: Meta content
    const metaMatch = html.match(/content="([\d,]+)\s*Followers/i);
    if (metaMatch) {
      const count = parseInt(metaMatch[1].replace(/,/g, ''), 10);
      console.log('Instagram followers from meta:', count);
      return count;
    }
    
    // Pattern 3: Various text patterns
    const patterns = [
      /(\d+(?:[.,]\d+)?[MK]?)\s*(?:followers|seguidores)/i,
      /"follower_count":\s*(\d+)/i,
      /followers['"]\s*:\s*(\d+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let value = match[1].replace(',', '.');
        if (value.endsWith('M')) {
          return Math.round(parseFloat(value) * 1000000);
        } else if (value.endsWith('K')) {
          return Math.round(parseFloat(value) * 1000);
        }
        const count = parseInt(value.replace(/\./g, ''), 10);
        console.log('Instagram followers from pattern:', count);
        return count;
      }
    }
    
    console.log('Could not extract Instagram followers');
    return null;
  } catch (error) {
    console.error('Error fetching Instagram metrics:', error);
    return null;
  }
}

// Scrape TikTok followers using multiple methods
async function getTikTokFollowers(tiktokUrl: string): Promise<number | null> {
  if (!tiktokUrl) return null;
  
  try {
    // Extract username
    let username = tiktokUrl;
    if (tiktokUrl.includes('tiktok.com')) {
      const match = tiktokUrl.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/);
      if (match) username = match[1];
    }
    username = username.replace('@', '').split('?')[0];
    
    console.log('Fetching TikTok for username:', username);
    
    // Method 1: Try the API
    try {
      const apiResponse = await fetch(`https://www.tiktok.com/api/user/detail/?uniqueId=${username}&msToken=`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const followers = apiData?.userInfo?.stats?.followerCount;
        if (followers) {
          console.log('TikTok followers from API:', followers);
          return followers;
        }
      }
    } catch (e) {
      console.log('TikTok API method failed, trying scraping');
    }
    
    // Method 2: Scrape the profile page
    const response = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.log('TikTok fetch failed with status:', response.status);
      return null;
    }

    const html = await response.text();
    
    // Pattern 1: JSON in SIGI_STATE
    const sigiMatch = html.match(/"followerCount":\s*(\d+)/);
    if (sigiMatch) {
      const count = parseInt(sigiMatch[1], 10);
      console.log('TikTok followers from SIGI:', count);
      return count;
    }
    
    // Pattern 2: Stats data
    const statsMatch = html.match(/"stats":\s*{[^}]*"followerCount":\s*(\d+)/);
    if (statsMatch) {
      const count = parseInt(statsMatch[1], 10);
      console.log('TikTok followers from stats:', count);
      return count;
    }
    
    // Pattern 3: Text pattern
    const patterns = [
      /(\d+(?:[.,]\d+)?[MK]?)\s*Followers/i,
      /(\d+(?:[.,]\d+)?[MK]?)\s*Seguidores/i,
      /"fans":\s*(\d+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let value = match[1].replace(',', '.');
        if (value.endsWith('M')) {
          return Math.round(parseFloat(value) * 1000000);
        } else if (value.endsWith('K')) {
          return Math.round(parseFloat(value) * 1000);
        }
        const count = parseInt(value.replace(/\./g, ''), 10);
        console.log('TikTok followers from pattern:', count);
        return count;
      }
    }
    
    console.log('Could not extract TikTok followers');
    return null;
  } catch (error) {
    console.error('Error fetching TikTok metrics:', error);
    return null;
  }
}

// Scrape Deezer followers
async function getDeezerFollowers(deezerUrl: string): Promise<number | null> {
  if (!deezerUrl) return null;
  
  try {
    // Extract artist ID from URL
    const match = deezerUrl.match(/deezer\.com\/(?:br\/|us\/|en\/)?artist\/(\d+)/);
    if (!match) {
      console.log('Could not extract Deezer artist ID from:', deezerUrl);
      return null;
    }
    
    const artistId = match[1];
    console.log('Fetching Deezer for artist ID:', artistId);
    
    // Use Deezer public API
    const response = await fetch(`https://api.deezer.com/artist/${artistId}`);
    
    if (!response.ok) {
      console.log('Deezer API failed with status:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.log('Deezer API error:', data.error);
      return null;
    }
    
    const fans = data.nb_fan;
    if (fans !== undefined) {
      console.log('Deezer fans:', fans);
      return fans;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Deezer metrics:', error);
    return null;
  }
}

// Fetch Apple Music data using iTunes Search API
async function getAppleMusicFollowers(appleMusicUrl: string): Promise<number | null> {
  if (!appleMusicUrl) return null;
  
  try {
    console.log('Fetching Apple Music for:', appleMusicUrl);
    
    // Extract artist ID from Apple Music URL
    // Format: https://music.apple.com/br/artist/artist-name/1234567890
    const artistIdMatch = appleMusicUrl.match(/\/artist\/[^/]+\/(\d+)/);
    if (!artistIdMatch) {
      console.log('Could not extract Apple Music artist ID from URL');
      return null;
    }
    
    const artistId = artistIdMatch[1];
    console.log('Apple Music artist ID:', artistId);
    
    // Use iTunes Search API to get artist info
    const response = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=musicArtist`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.log('Apple Music API failed with status:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      console.log('No Apple Music artist found');
      return null;
    }
    
    // iTunes API doesn't return follower counts directly
    // But we can try scraping the web page as fallback
    const scrapeResponse = await fetch(appleMusicUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    if (!scrapeResponse.ok) {
      console.log('Apple Music scrape failed');
      return null;
    }
    
    const html = await scrapeResponse.text();
    
    // Try to find listener/follower data
    const patterns = [
      /(\d+(?:[.,]\d+)?[MK]?)\s*(?:listeners|monthly listeners|ouvintes)/i,
      /"listenerCount":\s*"?(\d+)"?/i,
      /data-testid="listeners"[^>]*>(\d+(?:[.,]\d+)?[MK]?)/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        let value = match[1].replace(',', '.');
        if (value.toUpperCase().endsWith('M')) {
          return Math.round(parseFloat(value) * 1000000);
        } else if (value.toUpperCase().endsWith('K')) {
          return Math.round(parseFloat(value) * 1000);
        }
        const count = parseInt(value.replace(/\./g, ''), 10);
        console.log('Apple Music listeners found:', count);
        return count;
      }
    }
    
    console.log('Could not extract Apple Music data');
    return null;
  } catch (error) {
    console.error('Error fetching Apple Music metrics:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { artistId, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl, appleMusicUrl } = await req.json();

    console.log('Social metrics request:', { artistId, youtubeUrl, instagramUrl, tiktokUrl, deezerUrl, appleMusicUrl });

    if (!artistId) {
      return new Response(
        JSON.stringify({ error: 'Artist ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: Record<string, any> = {};
    const today = new Date().toISOString().split('T')[0];

    // Fetch YouTube metrics
    if (youtubeUrl && youtubeUrl !== 'Não temos' && youtubeUrl !== 'Não tem') {
      console.log('Fetching YouTube metrics for:', youtubeUrl);
      const ytData = await getYouTubeMetrics(youtubeUrl);
      if (ytData) {
        results.youtube = ytData;
        
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform: 'youtube',
          metric_type: 'channel_stats',
          date: today,
          followers: ytData.subscribers,
          value: ytData.views,
          reach: ytData.videoCount,
        }, {
          onConflict: 'artist_id,platform,date',
          ignoreDuplicates: false,
        });
        
        console.log('YouTube metrics saved:', ytData);
      }
    }

    // Fetch Instagram metrics
    if (instagramUrl && instagramUrl !== 'Não temos' && instagramUrl !== 'Não tem') {
      console.log('Fetching Instagram metrics for:', instagramUrl);
      const igFollowers = await getInstagramFollowers(instagramUrl);
      if (igFollowers !== null) {
        results.instagram = { followers: igFollowers };
        
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform: 'instagram',
          metric_type: 'followers',
          date: today,
          followers: igFollowers,
        }, {
          onConflict: 'artist_id,platform,date',
          ignoreDuplicates: false,
        });
        
        console.log('Instagram metrics saved:', igFollowers);
      }
    }

    // Fetch TikTok metrics
    if (tiktokUrl && tiktokUrl !== 'Não temos' && tiktokUrl !== 'Não tem') {
      console.log('Fetching TikTok metrics for:', tiktokUrl);
      const ttFollowers = await getTikTokFollowers(tiktokUrl);
      if (ttFollowers !== null) {
        results.tiktok = { followers: ttFollowers };
        
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform: 'tiktok',
          metric_type: 'followers',
          date: today,
          followers: ttFollowers,
        }, {
          onConflict: 'artist_id,platform,date',
          ignoreDuplicates: false,
        });
        
        console.log('TikTok metrics saved:', ttFollowers);
      }
    }

    // Fetch Deezer metrics
    if (deezerUrl && deezerUrl !== 'Não temos' && deezerUrl !== 'Não tem') {
      console.log('Fetching Deezer metrics for:', deezerUrl);
      const dzFollowers = await getDeezerFollowers(deezerUrl);
      if (dzFollowers !== null) {
        results.deezer = { followers: dzFollowers };
        
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform: 'deezer',
          metric_type: 'followers',
          date: today,
          followers: dzFollowers,
        }, {
          onConflict: 'artist_id,platform,date',
          ignoreDuplicates: false,
        });
        
        console.log('Deezer metrics saved:', dzFollowers);
      }
    }

    // Fetch Apple Music metrics
    if (appleMusicUrl && appleMusicUrl !== 'Não temos' && appleMusicUrl !== 'Não tem') {
      console.log('Fetching Apple Music metrics for:', appleMusicUrl);
      const amFollowers = await getAppleMusicFollowers(appleMusicUrl);
      if (amFollowers !== null) {
        results.apple = { followers: amFollowers };
        
        await supabase.from('social_media_metrics').upsert({
          artist_id: artistId,
          platform: 'apple',
          metric_type: 'followers',
          date: today,
          followers: amFollowers,
        }, {
          onConflict: 'artist_id,platform,date',
          ignoreDuplicates: false,
        });
        
        console.log('Apple Music metrics saved:', amFollowers);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        message: 'Social metrics fetched successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Social metrics error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
