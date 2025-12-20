import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

function extractChannelInfo(url: string): { channelId?: string; handle?: string } | null {
  if (!url) return null;

  const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
  if (channelMatch) return { channelId: channelMatch[1] };

  const handleMatch = url.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/);
  if (handleMatch) return { handle: handleMatch[1] };

  const customMatch = url.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/);
  if (customMatch) return { handle: customMatch[1] };

  return null;
}

async function getChannelByHandle(handle: string): Promise<any> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${handle}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.items?.[0] || null;
}

async function getChannelById(channelId: string): Promise<any> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.items?.[0] || null;
}

async function getRecentVideos(channelId: string): Promise<any[]> {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=10&type=video&key=${YOUTUBE_API_KEY}`;
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) return [];
  const searchData = await searchResponse.json();

  const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',');
  if (!videoIds) return [];

  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
  const videosResponse = await fetch(videosUrl);
  if (!videosResponse.ok) return [];
  const videosData = await videosResponse.json();

  return videosData.items || [];
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { youtubeUrl, channelId } = await req.json();
    let channel = null;

    if (channelId) {
      channel = await getChannelById(channelId);
    } else if (youtubeUrl) {
      const info = extractChannelInfo(youtubeUrl);
      if (info?.channelId) {
        channel = await getChannelById(info.channelId);
      } else if (info?.handle) {
        channel = await getChannelByHandle(info.handle);
      }
    }

    if (!channel) {
      return new Response(
        JSON.stringify({ error: 'YouTube channel not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recentVideos = await getRecentVideos(channel.id);

    const result = {
      channel_id: channel.id,
      name: channel.snippet?.title,
      description: channel.snippet?.description,
      thumbnail: channel.snippet?.thumbnails?.high?.url,
      subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
      total_views: parseInt(channel.statistics?.viewCount || '0', 10),
      video_count: parseInt(channel.statistics?.videoCount || '0', 10),
      recent_videos: recentVideos.map((video: any) => ({
        id: video.id,
        title: video.snippet?.title,
        thumbnail: video.snippet?.thumbnails?.medium?.url,
        published_at: video.snippet?.publishedAt,
        views: parseInt(video.statistics?.viewCount || '0', 10),
        likes: parseInt(video.statistics?.likeCount || '0', 10),
        comments: parseInt(video.statistics?.commentCount || '0', 10),
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
