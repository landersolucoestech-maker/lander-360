/**
 * Webhook para receber execuções detectadas por provedores de fingerprinting
 * (BMAT, Soundmouse, ACRCloud, etc.)
 * 
 * Endpoint: POST /functions/v1/fingerprint-webhook
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface DetectedPlay {
  external_id: string;
  track_external_id: string;
  platform: "radio" | "tv";
  station_channel: string;
  detected_at: string;
  duration_seconds: number;
  confidence_score: number;
  metadata?: Record<string, unknown>;
}

interface WebhookPayload {
  provider: string;
  event_type: string;
  plays: DetectedPlay[];
  timestamp: string;
  signature?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[FingerprintWebhook] Recebendo webhook...");

    // Valida método
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Valida assinatura do webhook (se configurado)
    const webhookSecret = Deno.env.get("FINGERPRINT_WEBHOOK_SECRET");
    const providedSignature = req.headers.get("x-webhook-secret");
    
    if (webhookSecret && providedSignature !== webhookSecret) {
      console.warn("[FingerprintWebhook] Assinatura inválida");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse do payload
    const payload: WebhookPayload = await req.json();
    console.log(`[FingerprintWebhook] Provider: ${payload.provider}, Plays: ${payload.plays?.length || 0}`);

    if (!payload.plays || !Array.isArray(payload.plays) || payload.plays.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No plays to process",
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inicializa Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let processed = 0;
    let errors = 0;
    const results: { id: string; status: string }[] = [];

    // Processa cada execução
    for (const play of payload.plays) {
      try {
        // Verifica duplicidade
        const { data: existing } = await supabase
          .from("radio_tv_detections")
          .select("id")
          .eq("metadata->external_detection_id", play.external_id)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`[FingerprintWebhook] Play já existe: ${play.external_id}`);
          results.push({ id: play.external_id, status: "duplicate" });
          continue;
        }

        // Busca track pelo ID do fingerprint
        const { data: tracks } = await supabase
          .from("music_registry")
          .select("id, title, artist_id")
          .limit(100);

        // Filtra por metadata de fingerprint
        const matchedTrack = (tracks || []).find((t: any) => 
          t.metadata?.fingerprint_id === play.track_external_id
        );

        // Insere detecção
        const { data: detection, error: insertError } = await supabase
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
            fingerprint_provider: payload.provider,
            status: matchedTrack ? "verified" : "pending",
            ecad_matched: false,
            metadata: {
              external_detection_id: play.external_id,
              ...play.metadata
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error(`[FingerprintWebhook] Erro ao inserir: ${insertError.message}`);
          errors++;
          results.push({ id: play.external_id, status: "error" });
        } else {
          processed++;
          results.push({ id: play.external_id, status: "created" });
          console.log(`[FingerprintWebhook] Detecção criada: ${detection.id}`);
        }
      } catch (playError) {
        console.error(`[FingerprintWebhook] Erro no play ${play.external_id}:`, playError);
        errors++;
        results.push({ id: play.external_id, status: "error" });
      }
    }

    console.log(`[FingerprintWebhook] Processamento concluído: ${processed} criados, ${errors} erros`);

    return new Response(JSON.stringify({
      success: true,
      processed,
      errors,
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[FingerprintWebhook] Erro:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
