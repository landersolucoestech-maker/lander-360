import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestEmailChangePayload {
  userId: string;
  currentEmail: string;
  newEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { userId, currentEmail, newEmail }: RequestEmailChangePayload = await req.json();

    console.log("Request email change:", { userId, currentEmail, newEmail });

    // Check if new email is already in use
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", newEmail)
      .neq("id", userId)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Este email já está em uso por outro usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();

    // Delete any existing pending changes for this user
    await supabaseAdmin
      .from("pending_email_changes")
      .delete()
      .eq("user_id", userId);

    // Insert pending email change
    const { error: insertError } = await supabaseAdmin
      .from("pending_email_changes")
      .insert({
        user_id: userId,
        current_email: currentEmail,
        new_email: newEmail,
        token: token,
      });

    if (insertError) {
      console.error("Error inserting pending email change:", insertError);
      throw new Error("Erro ao registrar solicitação de alteração");
    }

    // Get the app URL
    const appUrl = "https://dkrrfnpvqrpakngigxsb.lovableproject.com";
    const confirmUrl = `${appUrl}/confirm-email-change?token=${token}`;

    // Send confirmation email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lander 360º <noreply@painel.landerrecords.com>",
        to: [newEmail],
        subject: "Confirme a alteração do seu email - Lander 360º",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Confirme a alteração do seu email</title>
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; margin: 0;">Lander 360º</h1>
              </div>
              
              <h2 style="color: #1a1a1a; margin-bottom: 20px;">Confirme a alteração do seu email</h2>
              
              <p style="color: #4a4a4a; line-height: 1.6;">
                Você solicitou a alteração do email da sua conta de <strong>${currentEmail}</strong> para <strong>${newEmail}</strong>.
              </p>
              
              <p style="color: #4a4a4a; line-height: 1.6;">
                Clique no botão abaixo para confirmar esta alteração:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" 
                   style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Confirmar Alteração de Email
                </a>
              </div>
              
              <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6;">
                Se você não solicitou esta alteração, ignore este email. O link expira em 24 horas.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              
              <p style="color: #9a9a9a; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Lander 360º - Sistema de Gestão Musical
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Error sending email:", errorData);
      throw new Error("Erro ao enviar email de confirmação");
    }

    console.log("Email change request created successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email de confirmação enviado para " + newEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in request-email-change:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
