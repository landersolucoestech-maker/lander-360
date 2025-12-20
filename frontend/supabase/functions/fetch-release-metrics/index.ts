import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { releaseId, platforms } = await req.json();

    if (!releaseId) {
      return new Response(
        JSON.stringify({ error: 'Release ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar release com dados do artista
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('*, artists(*)')
      .eq('id', releaseId)
      .single();

    if (releaseError) throw releaseError;

    const metrics: Record<string, any> = {};
    const today = new Date().toISOString().split('T')[0];

    // Spotify metrics (se tiver spotify_uri)
    if (release.spotify_uri && (platforms?.includes('spotify') || !platforms)) {
      // Aqui você integraria com a API do Spotify for Artists
      // Por enquanto, retornamos dados simulados
      metrics.spotify = {
        streams: 0,
        saves: 0,
        listeners: 0,
        playlist_adds: 0,
      };
    }

    // Salvar métricas no banco
    for (const [platform, data] of Object.entries(metrics)) {
      await supabase.from('release_metrics').upsert({
        release_id: releaseId,
        platform,
        metric_type: 'streams',
        value: data.streams || 0,
        date: today,
        metadata: data,
      }, {
        onConflict: 'release_id,platform,date,metric_type',
      });
    }

    return new Response(
      JSON.stringify({ success: true, metrics, fetched_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
