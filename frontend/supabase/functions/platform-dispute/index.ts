import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { takedownId, disputeReason, evidenceUrls, legalBasis } = await req.json();

    if (!takedownId || !disputeReason) {
      return new Response(
        JSON.stringify({ error: 'Takedown ID and dispute reason are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar takedown
    const { data: takedown, error: fetchError } = await supabase
      .from('takedowns')
      .select('*')
      .eq('id', takedownId)
      .single();

    if (fetchError) throw fetchError;

    // Atualizar com disputa
    const { error: updateError } = await supabase
      .from('takedowns')
      .update({
        status: 'disputed',
        resolution_notes: `Disputa enviada: ${disputeReason}`,
      })
      .eq('id', takedownId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Disputa enviada com sucesso',
        referenceNumber: `DSP_${Date.now()}`,
        status: 'disputed'
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
