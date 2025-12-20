import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { userId, title, message, type, priority, actionUrl, sendEmail, email } = await req.json();

    const supabase = getSupabaseClient();

    // Criar notificação no banco
    const { data: notification, error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: type || 'info',
        priority: priority || 'normal',
        action_url: actionUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Enviar email se solicitado
    if (sendEmail && email && RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Lander 360 <notificacoes@resend.dev>',
          to: [email],
          subject: title,
          html: `<h2>${title}</h2><p>${message}</p>${actionUrl ? `<p><a href="${actionUrl}">Ver detalhes</a></p>` : ''}`,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, notification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
