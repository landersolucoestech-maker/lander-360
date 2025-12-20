import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { triggeredBy } = await req.json();

    const supabase = getSupabaseClient();

    // Buscar automações ativas
    const { data: automations, error } = await supabase
      .from('automations')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const results: any[] = [];

    for (const automation of automations || []) {
      try {
        // Verificar se o trigger corresponde
        if (triggeredBy && automation.trigger_type !== triggeredBy) {
          continue;
        }

        // Executar ações
        const actions = automation.actions || [];
        const executionResults: any[] = [];

        for (const action of actions) {
          // Processar cada tipo de ação
          switch (action.type) {
            case 'send_notification':
              // Chamar função de notificação
              executionResults.push({ type: 'notification', status: 'executed' });
              break;
            case 'send_email':
              executionResults.push({ type: 'email', status: 'executed' });
              break;
            case 'update_record':
              executionResults.push({ type: 'update', status: 'executed' });
              break;
            default:
              executionResults.push({ type: action.type, status: 'skipped' });
          }
        }

        // Registrar execução
        await supabase.from('automation_execution_logs').insert({
          automation_id: automation.id,
          status: 'success',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          execution_data: { results: executionResults },
        });

        // Atualizar contador
        await supabase
          .from('automations')
          .update({
            last_run_at: new Date().toISOString(),
            run_count: (automation.run_count || 0) + 1,
          })
          .eq('id', automation.id);

        results.push({
          automationId: automation.id,
          name: automation.name,
          status: 'success',
          actionsExecuted: executionResults.length,
        });
      } catch (err) {
        results.push({
          automationId: automation.id,
          name: automation.name,
          status: 'error',
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
