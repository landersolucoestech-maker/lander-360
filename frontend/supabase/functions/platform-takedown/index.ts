/**
 * Serviço de envio de takedowns para plataformas
 * Integra com APIs do YouTube, Meta, TikTok quando disponíveis
 * 
 * Endpoint: POST /functions/v1/platform-takedown
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Platform = "youtube" | "meta" | "tiktok" | "spotify" | "soundcloud" | "other";

interface TakedownRequest {
  takedownId: string;
  platform: Platform;
  contentUrl: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

interface TakedownResult {
  success: boolean;
  externalId?: string;
  message?: string;
  error?: string;
}

// Configuração de APIs por plataforma
const PLATFORM_APIS: Record<Platform, string | undefined> = {
  youtube: Deno.env.get("YOUTUBE_API_KEY"),
  meta: Deno.env.get("META_API_KEY"),
  tiktok: Deno.env.get("TIKTOK_API_KEY"),
  spotify: Deno.env.get("SPOTIFY_API_KEY"),
  soundcloud: Deno.env.get("SOUNDCLOUD_API_KEY"),
  other: undefined
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[PlatformTakedown] Processando solicitação de takedown...");

    // Valida método
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse do payload
    const request: TakedownRequest = await req.json();

    if (!request.takedownId || !request.platform || !request.contentUrl) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: takedownId, platform, contentUrl" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[PlatformTakedown] Platform: ${request.platform}, URL: ${request.contentUrl}`);

    // Inicializa Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result: TakedownResult;

    // Tenta enviar via API da plataforma (se configurada)
    const apiKey = PLATFORM_APIS[request.platform];

    if (!apiKey) {
      console.log(`[PlatformTakedown] API não configurada para ${request.platform}, registrando para envio manual`);
      result = {
        success: false,
        message: `API não configurada para ${request.platform}. Takedown registrado para envio manual.`
      };
    } else {
      // Aqui seria a integração real com cada plataforma
      // Cada uma tem seu próprio formato de API
      
      try {
        switch (request.platform) {
          case "youtube":
            result = await sendYouTubeTakedown(request, apiKey);
            break;
          case "meta":
            result = await sendMetaTakedown(request, apiKey);
            break;
          case "tiktok":
            result = await sendTikTokTakedown(request, apiKey);
            break;
          default:
            result = {
              success: false,
              message: `Integração com ${request.platform} não implementada`
            };
        }
      } catch (apiError) {
        console.error(`[PlatformTakedown] Erro na API ${request.platform}:`, apiError);
        result = {
          success: false,
          error: apiError instanceof Error ? apiError.message : "Erro na API"
        };
      }
    }

    // Atualiza status do takedown no banco
    if (result.success && result.externalId) {
      await supabase
        .from("takedowns")
        .update({
          status: "submitted",
          submitted_date: new Date().toISOString(),
          response_notes: `Enviado via API. ID externo: ${result.externalId}`
        })
        .eq("id", request.takedownId);
    }

    // Log do resultado
    await supabase.from("audit_logs").insert({
      action: "takedown_api_request",
      table_name: "takedowns",
      record_id: request.takedownId,
      metadata: {
        platform: request.platform,
        success: result.success,
        external_id: result.externalId,
        error: result.error
      }
    });

    console.log(`[PlatformTakedown] Resultado: ${result.success ? "sucesso" : "falha"}`);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[PlatformTakedown] Erro:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Envia takedown para YouTube via Content ID API
 * Nota: Requer acesso ao YouTube Content ID Partner Program
 */
async function sendYouTubeTakedown(request: TakedownRequest, apiKey: string): Promise<TakedownResult> {
  // Simulação - em produção, usar a API real do YouTube
  // https://developers.google.com/youtube/partner/docs/v1/claimSearch
  
  console.log("[YouTube] Simulando envio de takedown...");
  
  // Em produção:
  // const response = await fetch("https://www.googleapis.com/youtube/partner/v1/claims", {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${apiKey}`,
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     videoId: extractVideoId(request.contentUrl),
  //     policy: { id: "takedown" },
  //     contentType: "audio"
  //   })
  // });
  
  return {
    success: false,
    message: "YouTube Content ID API não implementada. Registrado para envio manual via studio.youtube.com"
  };
}

/**
 * Envia takedown para Meta (Facebook/Instagram)
 * Nota: Requer acesso ao Meta Rights Manager
 */
async function sendMetaTakedown(request: TakedownRequest, apiKey: string): Promise<TakedownResult> {
  console.log("[Meta] Simulando envio de takedown...");
  
  // Em produção, usar Meta Rights Manager API
  // https://developers.facebook.com/docs/graph-api/reference/rights-manager-upload/
  
  return {
    success: false,
    message: "Meta Rights Manager API não implementada. Registrado para envio manual."
  };
}

/**
 * Envia takedown para TikTok
 * Nota: Requer parceria com TikTok Sound Partner Program
 */
async function sendTikTokTakedown(request: TakedownRequest, apiKey: string): Promise<TakedownResult> {
  console.log("[TikTok] Simulando envio de takedown...");
  
  return {
    success: false,
    message: "TikTok API não implementada. Registrado para envio manual."
  };
}
