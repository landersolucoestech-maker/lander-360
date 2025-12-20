import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

// LanderZap - Integração com WhatsApp
// Requer integração com provider como Twilio, MessageBird, ou Z-API

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { to, message, mediaUrl, conversationId } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Recipient (to) and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulação de envio
    // Em produção, integraria com WhatsApp Business API ou provider
    const messageId = `MSG_${Date.now()}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId,
        status: 'queued',
        message: 'Mensagem adicionada à fila de envio',
        disclaimer: 'Integração com WhatsApp requer configuração de provider (Twilio, Z-API, etc.)'
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
