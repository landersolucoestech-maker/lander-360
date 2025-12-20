import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { to, contractTitle, contractType, signerName, signatureLink, message } = await req.json();

    if (!to || !contractTitle) {
      return new Response(
        JSON.stringify({ error: 'Email and contract title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Contrato para Assinatura</h2>
        <p>Olá ${signerName || 'Prezado(a)'},</p>
        <p>Você recebeu um contrato para assinatura digital:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Contrato:</strong> ${contractTitle}</p>
          <p><strong>Tipo:</strong> ${contractType || 'Não especificado'}</p>
        </div>
        ${message ? `<p>${message}</p>` : ''}
        ${signatureLink ? `
          <p style="text-align: center; margin: 30px 0;">
            <a href="${signatureLink}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Assinar Contrato</a>
          </p>
        ` : ''}
        <p style="color: #666; font-size: 14px;">Este é um email automático do sistema Lander 360.</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lander 360 <contratos@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: `Contrato para assinatura: ${contractTitle}`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend error: ${error}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
