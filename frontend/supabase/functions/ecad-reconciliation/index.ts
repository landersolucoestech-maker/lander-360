/**
 * Job de reconciliação automática ECAD
 * Cruza detecções com relatórios ECAD e identifica divergências
 * 
 * Endpoint: POST /functions/v1/ecad-reconciliation
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReconciliationRequest {
  reportId: string;
  period?: {
    start: string;
    end: string;
  };
}

interface DivergenceRecord {
  music_registry_id: string;
  type: "not_reported" | "count_mismatch" | "value_mismatch";
  detected_count: number;
  ecad_count: number;
  detection_id?: string;
  ecad_report_item_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[EcadReconciliation] Iniciando reconciliação...");

    // Valida método
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse do payload
    const { reportId, period }: ReconciliationRequest = await req.json();

    if (!reportId) {
      return new Response(JSON.stringify({ error: "Missing reportId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[EcadReconciliation] Relatório: ${reportId}`);

    // Inicializa Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Busca o relatório
    const { data: report, error: reportError } = await supabase
      .from("ecad_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return new Response(JSON.stringify({ error: "Report not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calcula período baseado no relatório se não fornecido
    let startDate: string;
    let endDate: string;

    if (period) {
      startDate = period.start;
      endDate = period.end;
    } else {
      const [year, month] = report.report_period.split("-");
      startDate = `${year}-${month}-01T00:00:00`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}T23:59:59`;
    }

    console.log(`[EcadReconciliation] Período: ${startDate} a ${endDate}`);

    // Busca itens do relatório ECAD
    const { data: ecadItems } = await supabase
      .from("ecad_report_items")
      .select("*")
      .eq("ecad_report_id", reportId);

    // Busca detecções do período
    const { data: detections } = await supabase
      .from("radio_tv_detections")
      .select("*")
      .gte("detected_at", startDate)
      .lte("detected_at", endDate);

    // Agrupa detecções por track
    const detectionsByTrack = new Map<string, { count: number; ids: string[] }>();
    for (const detection of (detections || []) as any[]) {
      if (detection.music_registry_id) {
        const existing = detectionsByTrack.get(detection.music_registry_id) || { count: 0, ids: [] };
        existing.count++;
        existing.ids.push(detection.id);
        detectionsByTrack.set(detection.music_registry_id, existing);
      }
    }

    // Agrupa itens ECAD por track
    const ecadByTrack = new Map<string, { count: number; value: number; itemId: string }>();
    for (const item of (ecadItems || []) as any[]) {
      if (item.music_registry_id) {
        const existing = ecadByTrack.get(item.music_registry_id) || { count: 0, value: 0, itemId: "" };
        existing.count += item.execution_count || 0;
        existing.value += item.execution_value || 0;
        existing.itemId = item.id;
        ecadByTrack.set(item.music_registry_id, existing);
      }
    }

    // Compara e identifica divergências
    const divergences: DivergenceRecord[] = [];
    let ok = 0;
    let notReported = 0;
    let divergent = 0;

    for (const [trackId, detected] of detectionsByTrack) {
      const ecad = ecadByTrack.get(trackId);

      if (!ecad) {
        // Não reportado ao ECAD
        notReported++;
        divergences.push({
          music_registry_id: trackId,
          type: "not_reported",
          detected_count: detected.count,
          ecad_count: 0,
          detection_id: detected.ids[0]
        });

        // Cria divergência no banco
        await supabase.from("ecad_divergences").insert({
          detection_id: detected.ids[0],
          music_registry_id: trackId,
          divergence_type: "not_reported",
          detected_count: detected.count,
          ecad_count: 0,
          status: "open"
        });
      } else if (detected.count !== ecad.count) {
        // Contagem divergente
        divergent++;
        divergences.push({
          music_registry_id: trackId,
          type: "count_mismatch",
          detected_count: detected.count,
          ecad_count: ecad.count,
          detection_id: detected.ids[0],
          ecad_report_item_id: ecad.itemId
        });

        await supabase.from("ecad_divergences").insert({
          detection_id: detected.ids[0],
          ecad_report_item_id: ecad.itemId,
          music_registry_id: trackId,
          divergence_type: "count_mismatch",
          detected_count: detected.count,
          ecad_count: ecad.count,
          status: "open"
        });
      } else {
        ok++;

        // Marca detecções como reconciliadas
        await supabase
          .from("radio_tv_detections")
          .update({ ecad_matched: true, ecad_report_id: reportId })
          .in("id", detected.ids);
      }
    }

    // Atualiza o relatório com contagem de divergências
    await supabase
      .from("ecad_reports")
      .update({ divergent_records: divergent + notReported })
      .eq("id", reportId);

    console.log(`[EcadReconciliation] Concluído: ${ok} OK, ${notReported} não reportados, ${divergent} divergentes`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total_processed: detectionsByTrack.size,
        ok,
        not_reported: notReported,
        divergent,
        divergences_created: divergences.length
      },
      divergences
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[EcadReconciliation] Erro:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
