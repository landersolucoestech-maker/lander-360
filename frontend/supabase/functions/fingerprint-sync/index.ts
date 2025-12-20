import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistId } = await req.json();

    const supabase = getSupabaseClient();

    // Buscar todas as músicas do artista com fingerprint
    const query = supabase
      .from('music_registry')
      .select('id, title, isrc, fingerprint_id, fingerprint_status')
      .not('fingerprint_id', 'is', null);

    if (artistId) {
      query.eq('artist_id', artistId);
    }

    const { data: tracks, error } = await query;

    if (error) throw error;

    // Simulação de sincronização
    const syncResults = tracks?.map(track => ({
      trackId: track.id,
      title: track.title,
      fingerprintId: track.fingerprint_id,
      status: 'synced',
      lastSync: new Date().toISOString(),
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncResults.length,
        results: syncResults
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
