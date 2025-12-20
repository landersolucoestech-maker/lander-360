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

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: pendingChange, error: findError } = await supabaseAdmin
      .from("pending_email_changes")
      .select("*")
      .eq("token", token)
      .is("confirmed_at", null)
      .single();

    if (findError || !pendingChange) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou já utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(pendingChange.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token expirado. Solicite uma nova alteração de email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      pendingChange.user_id,
      { email: pendingChange.new_email }
    );

    if (authUpdateError) {
      throw new Error("Erro ao atualizar email na autenticação");
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ email: pendingChange.new_email })
      .eq("id", pendingChange.user_id);

    if (profileUpdateError) {
      throw new Error("Erro ao atualizar email no perfil");
    }

    await supabaseAdmin
      .from("pending_email_changes")
      .update({ confirmed_at: new Date().toISOString() })
      .eq("id", pendingChange.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email alterado com sucesso!",
        newEmail: pendingChange.new_email 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
