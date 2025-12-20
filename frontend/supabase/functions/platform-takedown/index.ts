import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { takedownId, platform, contentUrl, infringingParty, evidenceUrls, contactEmail } = await req.json();

    const supabase = getSupabaseClient();

    // Atualizar status do takedown
    if (takedownId) {
      await supabase
        .from('takedowns')
        .update({
          status: 'reported',
          reported_at: new Date().toISOString(),
        })
        .eq('id', takedownId);
    }

    // Simulação de envio para plataforma
    // Em produção, integraria com APIs de cada plataforma
    const platformApis: Record<string, string> = {
      youtube: 'https://www.youtube.com/copyright_complaint_form',
      spotify: 'https://support.spotify.com/report-content/',
      instagram: 'https://help.instagram.com/contact/552695131608132',
      tiktok: 'https://www.tiktok.com/legal/report/Copyright',
      facebook: 'https://www.facebook.com/help/contact/634636770043106',
    };

    const reportUrl = platformApis[platform?.toLowerCase()] || null;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Takedown reportado para ${platform}`,
        reportUrl,
        referenceNumber: `TKD_${Date.now()}`,
        status: 'reported'
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
