import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LockoutNotificationRequest {
  email: string;
  lockoutDurationMinutes: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, lockoutDurationMinutes }: LockoutNotificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending lockout notification to ${email}`);

    const unlockTime = new Date();
    unlockTime.setMinutes(unlockTime.getMinutes() + lockoutDurationMinutes);
    const formattedTime = unlockTime.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const emailResponse = await resend.emails.send({
      from: "Lander 360º <onboarding@resend.dev>",
      to: [email],
      subject: "⚠️ Alerta de Segurança - Conta Bloqueada Temporariamente",
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
                <div style="background-color: #fef2f2; border-radius: 50%; width: 64px; height: 64px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px;">🔒</span>
                </div>
              </div>
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px; text-align: center;">Conta Bloqueada Temporariamente</h2>
              <p style="color: #52525b; margin: 0 0 20px 0; line-height: 1.6; text-align: center;">
                Detectamos múltiplas tentativas de login malsucedidas na sua conta.
              </p>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 600;">
                  Por motivos de segurança, sua conta foi bloqueada por ${lockoutDurationMinutes} minutos.
                </p>
              </div>
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #52525b; margin: 0 0 8px 0; font-size: 14px;">
                  <strong>Desbloqueio previsto:</strong>
                </p>
                <p style="color: #18181b; margin: 0; font-size: 16px; font-weight: 600;">
                  ${formattedTime}
                </p>
              </div>
              <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
                <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 16px;">Se foi você:</h3>
                <p style="color: #71717a; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                  Aguarde o tempo de bloqueio expirar e tente novamente com as credenciais corretas.
                </p>
                <h3 style="color: #18181b; margin: 0 0 12px 0; font-size: 16px;">Se não foi você:</h3>
                <ul style="color: #71717a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Considere alterar sua senha após recuperar o acesso</li>
                  <li>Ative a autenticação de dois fatores (2FA)</li>
                  <li>Verifique seus dispositivos conectados</li>
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

    console.log("Lockout notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notificação enviada com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-lockout-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
