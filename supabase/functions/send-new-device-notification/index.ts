import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewDeviceNotificationRequest {
  email: string;
  deviceType: string;
  browser: string;
  loginTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, deviceType, browser, loginTime }: NewDeviceNotificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending new device notification to ${email}`);

    const formattedTime = new Date(loginTime).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const deviceIcon = deviceType === "Mobile" ? "📱" : deviceType === "Tablet" ? "📲" : "💻";

    const emailResponse = await resend.emails.send({
      from: "Lander 360º <onboarding@resend.dev>",
      to: [email],
      subject: "🔔 Novo login detectado na sua conta - Lander 360º",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #dc2626; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Lander 360º</h1>
            </div>
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="background-color: #dbeafe; border-radius: 50%; width: 64px; height: 64px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">${deviceIcon}</span>
                </div>
              </div>
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; text-align: center;">Novo Dispositivo Detectado</h2>
              <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                Detectamos um novo login na sua conta a partir de um dispositivo que não reconhecemos.
              </p>
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Dispositivo:</td>
                    <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${deviceType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Navegador:</td>
                    <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${browser}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Data/Hora:</td>
                    <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${formattedTime}</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>⚠️ Não foi você?</strong><br>
                  Se você não reconhece este login, recomendamos alterar sua senha imediatamente e ativar a autenticação de dois fatores (2FA).
                </p>
              </div>
              <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
                <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 16px;">Dicas de segurança:</h3>
                <ul style="color: #71717a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Use senhas fortes e únicas</li>
                  <li>Ative a autenticação de dois fatores (2FA)</li>
                  <li>Nunca compartilhe suas credenciais</li>
                  <li>Saia de dispositivos que não usa mais</li>
                </ul>
              </div>
            </div>
            <div style="background-color: #f4f4f5; padding: 16px; text-align: center;">
              <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                Este é um e-mail automático de segurança. Não responda a este e-mail.
              </p>
              <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 12px;">
                © ${new Date().getFullYear()} Lander 360º. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("New device notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notificação enviada com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-new-device-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
