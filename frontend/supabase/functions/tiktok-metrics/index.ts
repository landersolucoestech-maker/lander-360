import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY');
const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET');

async function getTikTokUserInfo(accessToken: string) {
  const url = 'https://open.tiktokapis.com/v2/user/info/';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch TikTok user info');
  const data = await response.json();
  return data.data?.user || null;
}

async function getTikTokVideos(accessToken: string) {
  const url = 'https://open.tiktokapis.com/v2/video/list/';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      max_count: 20,
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  return data.data?.videos || [];
}

// Fallback: Scrape public profile
async function scrapeTikTokProfile(username: string) {
  try {
    const cleanUsername = username.replace('@', '').split('?')[0];
    const response = await fetch(`https://www.tiktok.com/@${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Extract follower count
    const followerMatch = html.match(/"followerCount":\s*(\d+)/);
    const followingMatch = html.match(/"followingCount":\s*(\d+)/);
    const likesMatch = html.match(/"heartCount":\s*(\d+)/);
    const videoMatch = html.match(/"videoCount":\s*(\d+)/);

    return {
      username: cleanUsername,
      followers: followerMatch ? parseInt(followerMatch[1], 10) : 0,
      following: followingMatch ? parseInt(followingMatch[1], 10) : 0,
      likes: likesMatch ? parseInt(likesMatch[1], 10) : 0,
      videos: videoMatch ? parseInt(videoMatch[1], 10) : 0,
    };
  } catch {
    return null;
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { accessToken, username, tiktokUrl } = await req.json();

    let result: any = null;

    // If we have an access token, use the official API
    if (accessToken) {
      const [userInfo, videos] = await Promise.all([
        getTikTokUserInfo(accessToken),
        getTikTokVideos(accessToken),
      ]);

      if (userInfo) {
        result = {
          open_id: userInfo.open_id,
          username: userInfo.display_name,
          avatar_url: userInfo.avatar_url,
          followers: userInfo.follower_count || 0,
          following: userInfo.following_count || 0,
          likes: userInfo.likes_count || 0,
          video_count: userInfo.video_count || 0,
          bio: userInfo.bio_description,
          is_verified: userInfo.is_verified,
          videos: videos.map((v: any) => ({
            id: v.id,
            title: v.title,
            cover_url: v.cover_image_url,
            views: v.view_count,
            likes: v.like_count,
            comments: v.comment_count,
            shares: v.share_count,
            created_at: v.create_time,
          })),
          source: 'api',
        };
      }
    }

    // Fallback to scraping if no access token or API failed
    if (!result) {
      const usernameToScrape = username || (tiktokUrl?.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/)?.[1]);
      
      if (!usernameToScrape) {
        return new Response(
          JSON.stringify({ error: 'TikTok username or access token required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const scraped = await scrapeTikTokProfile(usernameToScrape);
      
      if (scraped) {
        result = {
          ...scraped,
          source: 'scraping',
        };
      } else {
        return new Response(
          JSON.stringify({ error: 'Could not fetch TikTok profile' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    result.fetched_at = new Date().toISOString();

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
