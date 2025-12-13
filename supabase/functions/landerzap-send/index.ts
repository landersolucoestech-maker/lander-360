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

    if (channel === 'whatsapp') {
      sendResult = await sendWhatsApp(contactPhone, content);
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

async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !twilioPhone) {
    return { success: false, error: 'Credenciais Twilio não configuradas' };
  }

  try {
    // Formatar número para WhatsApp
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:+${formattedPhone}`,
          From: `whatsapp:${twilioPhone}`,
          Body: message,
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log('WhatsApp enviado:', result.sid);
      return { success: true, error: '' };
    } else {
      console.error('Erro Twilio:', result);
      return { success: false, error: result.message || 'Erro ao enviar WhatsApp' };
    }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
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
        from: 'Lander 360° <noreply@landerrecords.com>',
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
