import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmEmailChangePayload {
  token: string;
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

    const { token }: ConfirmEmailChangePayload = await req.json();

    console.log("Confirming email change with token:", token?.substring(0, 8) + "...");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find pending email change
    const { data: pendingChange, error: findError } = await supabaseAdmin
      .from("pending_email_changes")
      .select("*")
      .eq("token", token)
      .is("confirmed_at", null)
      .single();

    if (findError || !pendingChange) {
      console.error("Token not found or already used:", findError);
      return new Response(
        JSON.stringify({ error: "Token inválido ou já utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(pendingChange.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token expirado. Solicite uma nova alteração de email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update user email in auth.users
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      pendingChange.user_id,
      { email: pendingChange.new_email }
    );

    if (authUpdateError) {
      console.error("Error updating auth user email:", authUpdateError);
      throw new Error("Erro ao atualizar email na autenticação");
    }

    // Update email in profiles table
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ email: pendingChange.new_email })
      .eq("id", pendingChange.user_id);

    if (profileUpdateError) {
      console.error("Error updating profile email:", profileUpdateError);
      throw new Error("Erro ao atualizar email no perfil");
    }

    // Mark pending change as confirmed
    await supabaseAdmin
      .from("pending_email_changes")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", pendingChange.id);

    console.log("Email change confirmed successfully for user:", pendingChange.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email alterado com sucesso!",
        newEmail: pendingChange.new_email 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in confirm-email-change:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
