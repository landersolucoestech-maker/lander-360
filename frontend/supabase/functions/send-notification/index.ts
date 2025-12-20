import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'email' | 'sms' | 'whatsapp';
  to: string;
  subject?: string;
  message: string;
  templateData?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    let result: any;

    switch (payload.type) {
      case 'email':
        if (!RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY not configured');
        }
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Lander 360º <noreply@lander360.com>',
            to: [payload.to],
            subject: payload.subject || 'Notificação Lander 360º',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Lander 360º</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p style="font-size: 16px; color: #374151;">${payload.message}</p>
                </div>
                <div style="background: #1f2937; padding: 20px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    © 2024 Lander 360º. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        result = await emailResponse.json();
        break;

      case 'sms':
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
          throw new Error('Twilio credentials not configured');
        }

        const smsFormData = new URLSearchParams();
        smsFormData.append('To', formatPhoneNumber(payload.to));
        smsFormData.append('From', TWILIO_PHONE_NUMBER);
        smsFormData.append('Body', payload.message);

        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: smsFormData,
          }
        );

        result = await smsResponse.json();
        break;

      case 'whatsapp':
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
          throw new Error('Twilio credentials not configured');
        }

        const waFormData = new URLSearchParams();
        waFormData.append('To', `whatsapp:${formatPhoneNumber(payload.to)}`);
        waFormData.append('From', `whatsapp:${TWILIO_PHONE_NUMBER}`);
        waFormData.append('Body', payload.message);

        const waResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: waFormData,
          }
        );

        result = await waResponse.json();
        break;

      default:
        throw new Error('Invalid notification type');
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) return '';
  
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`;
  }
  
  if (digits.length >= 10 && digits.length <= 11) {
    return `+55${digits}`;
  }
  
  return `+${digits}`;
}
