import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getSupabaseClient();

    // Buscar solicitação pendente
    const { data: pending, error: fetchError } = await supabase
      .from('pending_email_changes')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !pending) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar email do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      pending.user_id,
      { email: pending.new_email }
    );

    if (updateError) throw updateError;

    // Atualizar profile
    await supabase
      .from('profiles')
      .update({ email: pending.new_email })
      .eq('id', pending.user_id);

    // Deletar solicitação pendente
    await supabase
      .from('pending_email_changes')
      .delete()
      .eq('id', pending.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Email updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
