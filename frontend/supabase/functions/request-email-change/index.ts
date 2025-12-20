import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return new Response(
        JSON.stringify({ error: 'User ID and new email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Salvar solicitação pendente
    const { error: dbError } = await supabase
      .from('pending_email_changes')
      .insert({
        user_id: userId,
        new_email: newEmail,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) throw dbError;

    // Enviar email de confirmação
    if (RESEND_API_KEY) {
      const confirmUrl = `${req.headers.get('origin')}/auth?confirm_email=${token}`;
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Lander 360 <noreply@resend.dev>',
          to: [newEmail],
          subject: 'Confirme sua alteração de email',
          html: `
            <h2>Alteração de Email</h2>
            <p>Clique no link abaixo para confirmar seu novo email:</p>
            <p><a href="${confirmUrl}">Confirmar Email</a></p>
            <p>Este link expira em 24 horas.</p>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
