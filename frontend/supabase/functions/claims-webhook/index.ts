/**
 * Webhook genérico para receber claims de plataformas
 * (YouTube, Meta, TikTok)
 * 
 * Endpoint: POST /functions/v1/claims-webhook?platform=youtube
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

type Platform = "youtube" | "meta" | "tiktok" | "spotify" | "soundcloud";

interface ClaimPayload {
  claim_id: string;
  content_url: string;
  content_title?: string;
  claimer_name?: string;
  claim_type?: string;
  matched_asset_id?: string;
  match_percentage?: number;
  action?: string;
  claimed_at?: string;
  raw_data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[ClaimsWebhook] Recebendo claim...");

    // Valida método
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obtém plataforma da URL
    const url = new URL(req.url);
    const platform = url.searchParams.get("platform") as Platform;
    
    if (!platform || !["youtube", "meta", "tiktok", "spotify", "soundcloud"].includes(platform)) {
      return new Response(JSON.stringify({ error: "Invalid or missing platform parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Valida assinatura específica da plataforma
    const webhookSecrets: Record<Platform, string | undefined> = {
      youtube: Deno.env.get("YOUTUBE_WEBHOOK_SECRET"),
      meta: Deno.env.get("META_WEBHOOK_SECRET"),
      tiktok: Deno.env.get("TIKTOK_WEBHOOK_SECRET"),
      spotify: Deno.env.get("SPOTIFY_WEBHOOK_SECRET"),
      soundcloud: Deno.env.get("SOUNDCLOUD_WEBHOOK_SECRET"),
    };

    const expectedSecret = webhookSecrets[platform];
    const providedSignature = req.headers.get("x-webhook-secret");

    if (expectedSecret && providedSignature !== expectedSecret) {
      console.warn(`[ClaimsWebhook] Assinatura inválida para ${platform}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse do payload
    const payload: ClaimPayload = await req.json();
    console.log(`[ClaimsWebhook] Platform: ${platform}, Claim: ${payload.claim_id}`);

    if (!payload.claim_id || !payload.content_url) {
      return new Response(JSON.stringify({ error: "Missing required fields: claim_id, content_url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inicializa Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verifica duplicidade
    const { data: existing } = await supabase
      .from("takedowns")
      .select("id")
      .eq("content_url", payload.content_url)
      .eq("is_incoming", true)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[ClaimsWebhook] Claim já existe: ${existing[0].id}`);
      return new Response(JSON.stringify({
        success: true,
        message: "Claim already exists",
        claim_id: existing[0].id
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tenta fazer match com asset do catálogo
    let musicRegistryId: string | null = null;
    let artistId: string | null = null;

    if (payload.matched_asset_id) {
      const { data: tracks } = await supabase
        .from("music_registry")
        .select("id, artist_id")
        .eq("isrc", payload.matched_asset_id)
        .limit(1);

      if (tracks && tracks.length > 0) {
        musicRegistryId = tracks[0].id;
        artistId = tracks[0].artist_id;
      }
    }

    // Cria registro do claim
    const { data: claim, error: insertError } = await supabase
      .from("takedowns")
      .insert({
        platform,
        reason: "copyright",
        content_url: payload.content_url,
        title: payload.content_title || `Claim ${payload.claim_id}`,
        infringing_party: payload.claimer_name,
        music_registry_id: musicRegistryId,
        artist_id: artistId,
        description: `Claim automático recebido via ${platform}. Match: ${payload.match_percentage || "N/A"}%`,
        status: "pending",
        is_incoming: true,
        request_date: payload.claimed_at || new Date().toISOString(),
        evidence_urls: payload.raw_data ? [JSON.stringify(payload.raw_data)] : []
      })
      .select()
      .single();

    if (insertError) {
      console.error("[ClaimsWebhook] Erro ao inserir:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[ClaimsWebhook] Claim registrado: ${claim.id}`);

    return new Response(JSON.stringify({
      success: true,
      claim_id: claim.id,
      platform
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[ClaimsWebhook] Erro:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
