import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      contactId, 
      contactName, 
      contactPhone, 
      contactEmail, 
      contactType,
      content, 
      channel 
    } = await req.json();

    console.log(`Enviando mensagem via ${channel} para ${contactName}`);

    // Buscar ou criar conversa
    let { data: conversation } = await supabase
      .from('landerzap_conversations')
      .select('*')
      .eq('contact_id', contactId)
      .eq('channel', channel)
      .single();

    if (!conversation) {
      // Criar nova conversa
      const initials = contactName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
      
      const { data: newConv, error: convError } = await supabase
        .from('landerzap_conversations')
        .insert({
          contact_id: contactId,
          contact_name: contactName,
          contact_initials: initials,
          contact_type: contactType,
          channel,
          last_message: content.substring(0, 100),
          last_message_at: new Date().toISOString(),
          starred: false,
          unread: false,
          archived: false
        })
        .select()
        .single();

      if (convError) throw convError;
      conversation = newConv;
    } else {
      // Atualizar última mensagem
      await supabase
        .from('landerzap_conversations')
        .update({
          last_message: content.substring(0, 100),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    }

    // Criar mensagem
    const { data: message, error: msgError } = await supabase
      .from('landerzap_messages')
      .insert({
        conversation_id: conversation.id,
        content,
        sent_at: new Date().toISOString(),
        from_me: true,
        channel,
        status: 'sent'
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Enviar via canal apropriado
    let sendResult = { success: false, error: '' };

    if (channel === 'whatsapp' || channel === 'sms') {
      sendResult = await sendSMS(contactPhone, content);
    } else if (channel === 'email') {
      sendResult = await sendEmail(contactEmail, contactName, content);
    }

    // Atualizar status da mensagem
    const newStatus = sendResult.success ? 'delivered' : 'failed';
    await supabase
      .from('landerzap_messages')
      .update({ status: newStatus })
      .eq('id', message.id);

    if (!sendResult.success) {
      console.error(`Falha ao enviar: ${sendResult.error}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: message.id,
      deliveryStatus: newStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro no LanderZap:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error: string }> {
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
  const region = Deno.env.get('AWS_REGION') || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    return { success: false, error: 'Credenciais AWS não configuradas' };
  }

  try {
    // Formatar número para E.164
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    formattedPhone = '+' + formattedPhone;

    // AWS SNS API request
    const host = `sns.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;
    
    const params = new URLSearchParams({
      Action: 'Publish',
      Message: message,
      PhoneNumber: formattedPhone,
      Version: '2010-03-31',
    });

    // Create AWS Signature v4
    const method = 'POST';
    const service = 'sns';
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const canonicalUri = '/';
    const canonicalQuerystring = '';
    const payloadHash = await sha256(params.toString());
    const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-date';
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`;

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = await hmacHex(signingKey, stringToSign);

    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Amz-Date': amzDate,
        'Authorization': authorizationHeader,
      },
      body: params.toString(),
    });

    const resultText = await response.text();
    
    if (response.ok && resultText.includes('<MessageId>')) {
      console.log('SMS enviado via AWS SNS');
      return { success: true, error: '' };
    } else {
      console.error('Erro AWS SNS:', resultText);
      return { success: false, error: 'Erro ao enviar SMS via AWS SNS' };
    }
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// AWS Signature v4 helper functions
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmac(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

async function hmacHex(key: ArrayBuffer, message: string): Promise<string> {
  const result = await hmac(key, message);
  return Array.from(new Uint8Array(result)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode('AWS4' + key).buffer as ArrayBuffer, dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  return await hmac(kService, 'aws4_request');
}

async function sendEmail(email: string, name: string, message: string): Promise<{ success: boolean; error: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    return { success: false, error: 'API Key do Resend não configurada' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lander 360° <noreply@painel.landerrecords.com>',
        to: [email],
        subject: `Mensagem de Lander 360°`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Lander 360°</h2>
            <p>Olá ${name},</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Esta mensagem foi enviada através do sistema Lander 360°
            </p>
          </div>
        `,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Email enviado:', result.id);
      return { success: true, error: '' };
    } else {
      console.error('Erro Resend:', result);
      return { success: false, error: result.message || 'Erro ao enviar email' };
    }
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
