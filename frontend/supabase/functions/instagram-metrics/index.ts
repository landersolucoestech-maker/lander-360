import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');
const META_APP_ID = Deno.env.get('META_APP_ID');

async function getInstagramBusinessAccount(pageId: string): Promise<string | null> {
  const url = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${META_ACCESS_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.instagram_business_account?.id || null;
}

async function getInstagramProfile(igUserId: string) {
  const url = `https://graph.facebook.com/v18.0/${igUserId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${META_ACCESS_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Instagram profile');
  return response.json();
}

async function getInstagramMedia(igUserId: string) {
  const url = `https://graph.facebook.com/v18.0/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=12&access_token=${META_ACCESS_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.data || [];
}

async function getInstagramInsights(igUserId: string) {
  const url = `https://graph.facebook.com/v18.0/${igUserId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${META_ACCESS_TOKEN}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.data || null;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (!META_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Meta access token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { instagramUserId, pageId } = await req.json();
    let igUserId = instagramUserId;

    if (!igUserId && pageId) {
      igUserId = await getInstagramBusinessAccount(pageId);
    }

    if (!igUserId) {
      return new Response(
        JSON.stringify({ error: 'Instagram user ID or Page ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [profile, media, insights] = await Promise.all([
      getInstagramProfile(igUserId),
      getInstagramMedia(igUserId),
      getInstagramInsights(igUserId),
    ]);

    const totalLikes = media.reduce((sum: number, m: any) => sum + (m.like_count || 0), 0);
    const totalComments = media.reduce((sum: number, m: any) => sum + (m.comments_count || 0), 0);
    const engagementRate = media.length > 0 && profile.followers_count > 0
      ? ((totalLikes + totalComments) / media.length / profile.followers_count * 100).toFixed(2)
      : 0;

    const result = {
      instagram_user_id: igUserId,
      username: profile.username,
      name: profile.name,
      biography: profile.biography,
      profile_picture_url: profile.profile_picture_url,
      website: profile.website,
      followers_count: profile.followers_count,
      follows_count: profile.follows_count,
      media_count: profile.media_count,
      engagement_rate: parseFloat(engagementRate as string),
      insights: insights,
      recent_media: media.map((m: any) => ({
        id: m.id,
        type: m.media_type,
        caption: m.caption?.substring(0, 100),
        media_url: m.media_url || m.thumbnail_url,
        permalink: m.permalink,
        timestamp: m.timestamp,
        likes: m.like_count,
        comments: m.comments_count,
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
