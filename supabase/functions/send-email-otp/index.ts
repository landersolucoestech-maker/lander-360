import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  action: "send" | "verify" | "enable" | "disable";
  code?: string;
}

function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create client with service role to bypass RLS for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create client with user's token
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.log("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { action, code }: SendOTPRequest = await req.json();
    console.log(`Processing ${action} request for user ${user.id}`);

    if (action === "send") {
      // Generate OTP code
      const otpCode = generateOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing codes for this user
      await supabaseAdmin
        .from("email_otp_codes")
        .delete()
        .eq("user_id", user.id);

      // Insert new OTP code
      const { error: insertError } = await supabaseAdmin
        .from("email_otp_codes")
        .insert({
          user_id: user.id,
          email: user.email,
          code: otpCode,
          expires_at: expiresAt.toISOString(),
          verified: false
        });

      if (insertError) {
        console.error("Error inserting OTP code:", insertError);
        throw new Error("Erro ao gerar código OTP");
      }

      // Send email with OTP code
      const emailResponse = await resend.emails.send({
        from: "Lander 360º <onboarding@resend.dev>",
        to: [user.email!],
        subject: "Seu código de verificação - Lander 360º",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="background-color: #dc2626; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Lander 360º</h1>
              </div>
              <div style="padding: 32px;">
                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 20px;">Código de Verificação</h2>
                <p style="color: #52525b; margin: 0 0 24px 0; line-height: 1.6;">
                  Use o código abaixo para verificar sua autenticação de dois fatores:
                </p>
                <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${otpCode}</span>
                </div>
                <p style="color: #71717a; margin: 0; font-size: 14px; line-height: 1.6;">
                  Este código expira em <strong>10 minutos</strong>.
                </p>
                <p style="color: #71717a; margin: 16px 0 0 0; font-size: 14px; line-height: 1.6;">
                  Se você não solicitou este código, ignore este e-mail.
                </p>
              </div>
              <div style="background-color: #f4f4f5; padding: 16px; text-align: center;">
                <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} Lander 360º. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "Código enviado para seu e-mail" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "verify") {
      if (!code || code.length !== 6) {
        return new Response(
          JSON.stringify({ error: "Código inválido" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check OTP code
      const { data: otpData, error: otpError } = await supabaseAdmin
        .from("email_otp_codes")
        .select("*")
        .eq("user_id", user.id)
        .eq("code", code)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (otpError || !otpData) {
        console.log("OTP verification failed:", otpError);
        return new Response(
          JSON.stringify({ error: "Código inválido ou expirado" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark code as verified
      await supabaseAdmin
        .from("email_otp_codes")
        .update({ verified: true })
        .eq("id", otpData.id);

      // Enable email 2FA for user
      const { error: upsertError } = await supabaseAdmin
        .from("user_2fa_settings")
        .upsert({
          user_id: user.id,
          email_2fa_enabled: true,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (upsertError) {
        console.error("Error enabling 2FA:", upsertError);
        throw new Error("Erro ao ativar 2FA");
      }

      console.log("Email 2FA enabled for user:", user.id);

      return new Response(
        JSON.stringify({ success: true, message: "E-mail OTP ativado com sucesso" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "disable") {
      // Disable email 2FA
      const { error: updateError } = await supabaseAdmin
        .from("user_2fa_settings")
        .upsert({
          user_id: user.id,
          email_2fa_enabled: false,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (updateError) {
        console.error("Error disabling 2FA:", updateError);
        throw new Error("Erro ao desativar 2FA");
      }

      // Delete any pending OTP codes
      await supabaseAdmin
        .from("email_otp_codes")
        .delete()
        .eq("user_id", user.id);

      console.log("Email 2FA disabled for user:", user.id);

      return new Response(
        JSON.stringify({ success: true, message: "E-mail OTP desativado com sucesso" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-email-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
