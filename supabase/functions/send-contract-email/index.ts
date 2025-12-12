import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractEmailPayload {
  to: string;
  recipientName: string;
  contractTitle: string;
  pdfBase64: string;
  companyName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ContractEmailPayload = await req.json();
    console.log('Contract email request:', { to: payload.to, contractTitle: payload.contractTitle });

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Extract base64 content (remove data:application/pdf;base64, prefix if present)
    let pdfContent = payload.pdfBase64;
    if (pdfContent.includes('base64,')) {
      pdfContent = pdfContent.split('base64,')[1];
    }

    const companyName = payload.companyName || 'Lander 360º';
    const fileName = `${payload.contractTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${companyName} <onboarding@resend.dev>`,
        to: [payload.to],
        subject: `Contrato: ${payload.contractTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${companyName}</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Olá ${payload.recipientName},</p>
              <p style="font-size: 16px; color: #374151;">
                Segue em anexo o contrato <strong>"${payload.contractTitle}"</strong> para sua análise.
              </p>
              <p style="font-size: 16px; color: #374151;">
                Por favor, revise o documento e entre em contato caso tenha alguma dúvida.
              </p>
              <p style="font-size: 16px; color: #374151; margin-top: 30px;">
                Atenciosamente,<br>
                <strong>Equipe ${companyName}</strong>
              </p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfContent,
          },
        ],
      }),
    });

    const result = await emailResponse.json();
    console.log('Contract email result:', result);

    if (!emailResponse.ok) {
      // Check for domain verification error
      if (result.message && result.message.includes('verify a domain')) {
        throw new Error('Domínio não verificado no Resend. Para enviar emails para outros destinatários, verifique seu domínio em resend.com/domains');
      }
      throw new Error(result.message || 'Failed to send email');
    }

    console.log('Contract email sent successfully');

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Contract email error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
