import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessResult {
  alerts_generated: number;
  notifications_scheduled: number;
  notifications_sent: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const result: ProcessResult = {
    alerts_generated: 0,
    notifications_scheduled: 0,
    notifications_sent: 0,
    errors: []
  };

  try {
    console.log('Starting automation processing...');

    // 1. Generate contract expiry alerts
    const { error: contractAlertError } = await supabase.rpc('generate_contract_expiry_alerts');
    if (contractAlertError) {
      console.error('Contract alert error:', contractAlertError);
      result.errors.push(`Contract alerts: ${contractAlertError.message}`);
    } else {
      console.log('Contract expiry alerts generated');
    }

    // 2. Generate obra pending alerts
    const { error: obraAlertError } = await supabase.rpc('generate_obra_pending_alerts');
    if (obraAlertError) {
      console.error('Obra alert error:', obraAlertError);
      result.errors.push(`Obra alerts: ${obraAlertError.message}`);
    } else {
      console.log('Obra pending alerts generated');
    }

    // 3. Generate release alerts
    const { error: releaseAlertError } = await supabase.rpc('generate_release_alerts');
    if (releaseAlertError) {
      console.error('Release alert error:', releaseAlertError);
      result.errors.push(`Release alerts: ${releaseAlertError.message}`);
    } else {
      console.log('Release alerts generated');
    }

    // 4. Schedule contract notifications
    const { error: scheduleError } = await supabase.rpc('schedule_contract_notifications');
    if (scheduleError) {
      console.error('Schedule notification error:', scheduleError);
      result.errors.push(`Schedule notifications: ${scheduleError.message}`);
    } else {
      console.log('Contract notifications scheduled');
    }

    // 5. Count generated alerts
    const { count: alertCount } = await supabase
      .from('system_alerts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute
    
    result.alerts_generated = alertCount || 0;

    // 6. Process pending notifications
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      result.errors.push(`Fetch notifications: ${fetchError.message}`);
    } else if (pendingNotifications && pendingNotifications.length > 0) {
      console.log(`Processing ${pendingNotifications.length} pending notifications`);
      
      for (const notification of pendingNotifications) {
        try {
          const messageData = notification.message_data as Record<string, any>;
          let message = '';

          // Build message based on template
          switch (notification.message_template) {
            case 'contract_expiry_reminder':
              message = `⚠️ Lander 360º - Alerta de Contrato\n\n` +
                `O contrato "${messageData.contract_title}" com ${messageData.artist_name} ` +
                `vence em ${messageData.days_remaining} dias.\n\n` +
                `Acesse a plataforma para renovar ou tomar as ações necessárias.`;
              break;
            case 'contract_expiry_manager':
              message = `📋 Lander 360º - Contrato Vencendo\n\n` +
                `O contrato "${messageData.contract_title}" do artista ${messageData.artist_name} ` +
                `expira em ${messageData.days_remaining} dias.\n\n` +
                `Recomendamos iniciar o processo de renovação.`;
              break;
            default:
              message = `Notificação do Lander 360º: ${JSON.stringify(messageData)}`;
          }

          // Send notifications based on channels
          const channels = notification.channels || ['email'];
          let sent = false;

          for (const channel of channels) {
            if (channel === 'email' && notification.recipient_email) {
              const { error: emailError } = await supabase.functions.invoke('send-notification', {
                body: {
                  type: 'email',
                  to: notification.recipient_email,
                  subject: `Lander 360º - ${notification.notification_type === 'contract_expiry' ? 'Alerta de Contrato' : 'Notificação'}`,
                  message: message.replace(/\n/g, '<br>')
                }
              });
              if (!emailError) sent = true;
            }

            if (channel === 'whatsapp' && notification.recipient_phone) {
              const { error: whatsappError } = await supabase.functions.invoke('send-notification', {
                body: {
                  type: 'whatsapp',
                  to: notification.recipient_phone,
                  message
                }
              });
              if (!whatsappError) sent = true;
            }

            if (channel === 'sms' && notification.recipient_phone) {
              const { error: smsError } = await supabase.functions.invoke('send-notification', {
                body: {
                  type: 'sms',
                  to: notification.recipient_phone,
                  message: message.substring(0, 160) // SMS limit
                }
              });
              if (!smsError) sent = true;
            }
          }

          // Update notification status
          await supabase
            .from('scheduled_notifications')
            .update({
              status: sent ? 'sent' : 'failed',
              sent_at: sent ? new Date().toISOString() : null,
              error_message: sent ? null : 'Failed to send via any channel',
              retry_count: notification.retry_count + (sent ? 0 : 1)
            })
            .eq('id', notification.id);

          if (sent) result.notifications_sent++;

        } catch (err: any) {
          console.error('Notification processing error:', err);
          result.errors.push(`Notification ${notification.id}: ${err.message}`);
          
          await supabase
            .from('scheduled_notifications')
            .update({
              status: 'failed',
              error_message: err.message,
              retry_count: notification.retry_count + 1
            })
            .eq('id', notification.id);
        }
      }
    }

    console.log('Automation processing complete:', result);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Automation processing failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, ...result }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
