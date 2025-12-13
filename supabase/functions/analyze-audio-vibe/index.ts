import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { audioBase64, fileName } = await req.json();

    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    // Usar Gemini para analisar características do áudio
    // Nota: Gemini 2.5 suporta análise de áudio multimodal
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este arquivo de áudio (${fileName}) e extraia as seguintes características musicais. Retorne APENAS um JSON válido sem markdown:

{
  "vibe": "descrição curta da vibe geral (ex: 'Energia alta, batida marcante', 'Chill e relaxante', 'Melancólico e introspectivo')",
  "energy": "nível de energia (Alta, Média, Baixa)",
  "suggestedMood": "mood sugerido para pitching (Energético / Alta Energia, Festa / Baile, Treino / Academia, Relaxante / Chill, Romântico, Melancólico / Sad, Motivacional, Noturno / Madrugada, Viral / Trends)",
  "tempo": "descrição do tempo (Lento ~60-90 BPM, Moderado ~90-120 BPM, Acelerado ~120-150 BPM, Muito rápido >150 BPM)"
}

Se não conseguir analisar o áudio, retorne valores baseados em padrões típicos de música brasileira.`
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: fileName?.endsWith('.wav') ? 'wav' : 'mp3'
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      // Fallback: análise baseada em nome do arquivo
      console.log("Audio analysis fallback - using filename patterns");
      
      const fileNameLower = fileName?.toLowerCase() || '';
      let analysis = {
        vibe: "Energia moderada, ritmo envolvente",
        energy: "Média",
        suggestedMood: "Festa / Baile",
        tempo: "Moderado (~110 BPM)"
      };

      // Heurísticas baseadas em nome do arquivo
      if (fileNameLower.includes('funk') || fileNameLower.includes('mtg')) {
        analysis = {
          vibe: "Energia alta, batida marcante de funk",
          energy: "Alta",
          suggestedMood: "Festa / Baile",
          tempo: "Acelerado (~130 BPM)"
        };
      } else if (fileNameLower.includes('trap') || fileNameLower.includes('hip')) {
        analysis = {
          vibe: "Batida pesada, atmosfera urbana",
          energy: "Alta",
          suggestedMood: "Noturno / Madrugada",
          tempo: "Moderado (~140 BPM)"
        };
      } else if (fileNameLower.includes('chill') || fileNameLower.includes('lofi')) {
        analysis = {
          vibe: "Atmosfera relaxante, som suave",
          energy: "Baixa",
          suggestedMood: "Relaxante / Chill",
          tempo: "Lento (~80 BPM)"
        };
      } else if (fileNameLower.includes('sad') || fileNameLower.includes('triste')) {
        analysis = {
          vibe: "Tom melancólico, emotivo",
          energy: "Baixa",
          suggestedMood: "Melancólico / Sad",
          tempo: "Lento (~70 BPM)"
        };
      } else if (fileNameLower.includes('edm') || fileNameLower.includes('house')) {
        analysis = {
          vibe: "Eletrônica dançante, drops energéticos",
          energy: "Alta",
          suggestedMood: "Treino / Academia",
          tempo: "Acelerado (~128 BPM)"
        };
      }

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON da resposta
    let analysis;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch {
      // Fallback se parsing falhar
      analysis = {
        vibe: "Energia moderada, ritmo brasileiro",
        energy: "Média",
        suggestedMood: "Festa / Baile",
        tempo: "Moderado (~110 BPM)"
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in analyze-audio-vibe:", error);
    
    // Retorna análise padrão em caso de erro
    const fallbackAnalysis = {
      vibe: "Energia moderada, ritmo envolvente",
      energy: "Média",
      suggestedMood: "Festa / Baile",
      tempo: "Moderado (~110 BPM)"
    };

    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      warning: "Análise baseada em padrões genéricos"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
