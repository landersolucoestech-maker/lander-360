/**
 * Job de sincronização de execuções de fingerprinting
 * Fallback para buscar execuções não recebidas via webhook
 * 
 * Endpoint: POST /functions/v1/fingerprint-sync
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  startDate: string;
  endDate: string;
  provider?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[FingerprintSync] Iniciando sincronização...");

    // Valida método
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse do payload
    const { startDate, endDate, provider }: SyncRequest = await req.json();

    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "Missing startDate or endDate" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[FingerprintSync] Período: ${startDate} a ${endDate}`);

    // Inicializa Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Aqui seria a chamada real para a API do provedor de fingerprinting
    // Por exemplo: BMAT API, Soundmouse API, etc.
    // 
    // const providerApiKey = Deno.env.get("FINGERPRINT_PROVIDER_API_KEY");
    // const response = await fetch(`${providerUrl}/plays`, {
    //   method: "POST",
    //   headers: { "Authorization": `Bearer ${providerApiKey}` },
    //   body: JSON.stringify({ startDate, endDate })
    // });
    // const plays = await response.json();

    // Simulação: retorna dados vazios pois não há provedor configurado
    // Em produção, substituir pela chamada real à API do provedor
    const plays: any[] = [];

    console.log(`[FingerprintSync] ${plays.length} execuções encontradas no provedor`);

    let synced = 0;
    let errors = 0;

    // Processa cada execução
    for (const play of plays) {
      try {
        // Verifica se já existe
        const { data: existing } = await supabase
          .from("radio_tv_detections")
          .select("id")
          .eq("metadata->external_detection_id", play.external_id)
          .limit(1);

        if (existing && existing.length > 0) {
          continue; // Já existe, pula
        }

        // Busca track
        const { data: tracks } = await supabase
          .from("music_registry")
          .select("id, title, artist_id")
          .limit(100);

        const matchedTrack = (tracks || []).find((t: any) => 
          t.metadata?.fingerprint_id === play.track_external_id
        );

        // Insere
        const { error: insertError } = await supabase
          .from("radio_tv_detections")
          .insert({
            music_registry_id: matchedTrack?.id || null,
            artist_id: matchedTrack?.artist_id || null,
            title: matchedTrack?.title || "Desconhecido",
            platform: play.platform,
            station_channel: play.station_channel,
            detected_at: play.detected_at,
            duration_seconds: play.duration_seconds,
            confidence_score: play.confidence_score,
            fingerprint_provider: provider || "sync",
            status: matchedTrack ? "verified" : "pending",
            ecad_matched: false,
            metadata: {
              external_detection_id: play.external_id,
              synced_at: new Date().toISOString()
            }
          });

        if (insertError) {
          errors++;
        } else {
          synced++;
        }
      } catch {
        errors++;
      }
    }

    console.log(`[FingerprintSync] Sincronização concluída: ${synced} sincronizados, ${errors} erros`);

    return new Response(JSON.stringify({
      success: true,
      synced,
      errors,
      total: plays.length,
      message: plays.length === 0 
        ? "Nenhuma execução nova encontrada no período" 
        : `${synced} execuções sincronizadas`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[FingerprintSync] Erro:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
