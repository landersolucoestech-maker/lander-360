import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { query, role } = await req.json();

    const supabase = getSupabaseClient();

    // Buscar em múltiplas fontes
    const results: any[] = [];

    // Buscar em artistas
    const { data: artists } = await supabase
      .from('artists')
      .select('id, name, stage_name')
      .or(`name.ilike.%${query}%,stage_name.ilike.%${query}%`)
      .limit(10);

    if (artists) {
      results.push(...artists.map(a => ({
        id: a.id,
        name: a.stage_name || a.name,
        type: 'artist',
        role: role || 'performer',
      })));
    }

    // Buscar em contatos CRM
    const { data: contacts } = await supabase
      .from('crm_contacts')
      .select('id, name, company, contact_type')
      .or(`name.ilike.%${query}%,company.ilike.%${query}%`)
      .limit(10);

    if (contacts) {
      results.push(...contacts.map(c => ({
        id: c.id,
        name: c.name,
        company: c.company,
        type: 'contact',
        role: c.contact_type || role || 'collaborator',
      })));
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
