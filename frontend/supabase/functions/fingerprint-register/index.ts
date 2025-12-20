import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { action, musicRegistryId, audioUrl, title, isrc, artistName } = await req.json();

    const supabase = getSupabaseClient();

    switch (action) {
      case 'register': {
        // Simulação de registro de fingerprint
        // Em produção, integraria com ACRCloud, Audible Magic, etc.
        const fingerprintId = `FP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Atualizar registro de música com fingerprint
        if (musicRegistryId) {
          await supabase
            .from('music_registry')
            .update({
              fingerprint_id: fingerprintId,
              fingerprint_status: 'registered',
            })
            .eq('id', musicRegistryId);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            fingerprintId,
            status: 'registered',
            message: 'Fingerprint registrado com sucesso'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'search': {
        // Simulação de busca por fingerprint
        return new Response(
          JSON.stringify({ 
            success: true, 
            matches: [],
            message: 'Busca realizada'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: register or search' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
