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

    const requestBody = await req.json();
    const { 
      type, 
      artistData, 
      musicData, 
      releaseData, 
      campaignData,
      objective, 
      targetAudience, 
      channel, 
      tone, 
      keywords, 
      additionalNotes,
      metricsData,
      historyContext,
      chatMessages,
      prompt: pitchPrompt  // For pitch type
    } = requestBody;

    let systemPrompt = `Você é um especialista em marketing musical e estratégia de conteúdo para a indústria da música brasileira. 
Você trabalha para a Lander Records e tem acesso completo aos dados dos artistas, obras, lançamentos e campanhas.
Suas respostas devem ser práticas, criativas e adaptadas ao contexto do artista e objetivo.
Sempre considere o público-alvo brasileiro e as tendências atuais de redes sociais.
Responda sempre em português brasileiro.`;

    let userPrompt = "";

    if (type === "generate-ideas") {
      systemPrompt += `\n\nVocê deve gerar ideias criativas para marketing musical. Para cada ideia, retorne um JSON array com objetos contendo:
- title: título curto e impactante
- description: descrição detalhada com instruções de execução
- suggested_channel: plataforma ideal (Instagram, TikTok, YouTube, Spotify, etc.)
- content_format: formato do conteúdo (texto, imagem, vídeo curto, vídeo longo, áudio, stories, reels, etc.)
- execution_notes: notas de execução (cores, estilo visual, duração, tom de voz, hashtags sugeridas)
- priority: prioridade (alta, média, baixa)
- post_frequency: frequência ideal de posts
- recommended_dates: datas recomendadas (array de strings)
- engagement_strategies: estratégias de engajamento (array de strings)

IMPORTANTE: Retorne APENAS o JSON array, sem markdown ou explicações adicionais.`;

      userPrompt = `Gere 5 ideias criativas de marketing para o seguinte contexto:

ARTISTA: ${artistData ? `${artistData.name} (${artistData.stage_name || artistData.name})
- Gênero: ${artistData.genre || 'Não especificado'}
- Bio: ${artistData.bio || 'Não disponível'}
- Redes: Instagram: ${artistData.instagram_url || 'N/A'}, TikTok: ${artistData.tiktok || 'N/A'}, YouTube: ${artistData.youtube_url || 'N/A'}` : 'Não especificado'}

${musicData ? `OBRA/FONOGRAMA: ${musicData.title}
- Gênero: ${musicData.genre || 'Não especificado'}
- ISRC: ${musicData.isrc || 'N/A'}` : ''}

${releaseData ? `LANÇAMENTO: ${releaseData.title}
- Tipo: ${releaseData.type || releaseData.release_type || 'Não especificado'}
- Data: ${releaseData.release_date || 'Não definida'}
- Status: ${releaseData.status || 'N/A'}` : ''}

${campaignData ? `CAMPANHA: ${campaignData.name}
- Budget: R$ ${campaignData.budget || 0}
- Status: ${campaignData.status || 'N/A'}` : ''}

OBJETIVO: ${objective}

${targetAudience ? `PÚBLICO-ALVO: 
- Faixa etária: ${targetAudience.ageRange || 'Geral'}
- Gênero: ${targetAudience.gender || 'Todos'}
- Região: ${targetAudience.region || 'Brasil'}
- Estilo musical preferido: ${targetAudience.musicStyle || 'Variado'}` : ''}

${channel ? `CANAL PREFERIDO: ${channel}` : ''}
${tone ? `TOM/ESTILO: ${tone}` : ''}
${keywords?.length ? `PALAVRAS-CHAVE: ${keywords.join(', ')}` : ''}
${additionalNotes ? `OBSERVAÇÕES ADICIONAIS: ${additionalNotes}` : ''}

${metricsData ? `MÉTRICAS RECENTES:
- Alcance: ${metricsData.reach || 0}
- Engajamento: ${metricsData.engagement || 0}%
- Seguidores: ${metricsData.followers || 0}` : ''}

${historyContext ? `HISTÓRICO DE IDEIAS ANTERIORES (para evitar repetição): ${historyContext}` : ''}`;

    } else if (type === "chat") {
      systemPrompt += `\n\nVocê é um assistente de IA especializado em marketing musical. Responda de forma conversacional e útil.
Você tem acesso aos dados do artista e pode sugerir estratégias, responder dúvidas sobre marketing, criar conteúdo e analisar dados.`;

      const messagesFormatted = chatMessages?.map((m: any) => ({
        role: m.role,
        content: m.content
      })) || [];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messagesFormatted,
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI gateway error");
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });

    } else if (type === "analyze-data") {
      systemPrompt += `\n\nAnalise os dados fornecidos e retorne insights em formato JSON com:
- kpis: array de objetos {name, value, trend, description}
- comparisons: array de objetos {metric, current, previous, change_percent}
- recommendations: array de strings com recomendações
- summary: resumo executivo em texto

IMPORTANTE: Retorne APENAS o JSON, sem markdown.`;

      userPrompt = `Analise os seguintes dados de marketing e métricas:

${JSON.stringify(metricsData, null, 2)}

Forneça insights, KPIs e recomendações para melhorar o desempenho.`;

    } else if (type === "content-suggestions") {
      systemPrompt += `\n\nGere sugestões de conteúdo específicas. Retorne um JSON array com:
- type: tipo do conteúdo (post, reels, stories, video, etc.)
- platform: plataforma
- content: texto/roteiro do conteúdo
- hashtags: array de hashtags sugeridas
- best_time: melhor horário para postar
- estimated_reach: alcance estimado (alto, médio, baixo)

IMPORTANTE: Retorne APENAS o JSON array.`;

      userPrompt = `Gere 5 sugestões de conteúdo para:
Artista: ${artistData?.name || 'N/A'}
Objetivo: ${objective}
Canal: ${channel || 'Todos'}`;

    } else if (type === "pitch") {
      // For Spotify pitching, the prompt is already built on the frontend
      const pitchResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "user", content: pitchPrompt },
          ],
        }),
      });

      if (!pitchResponse.ok) {
        if (pitchResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (pitchResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await pitchResponse.text();
        console.error("AI gateway error:", pitchResponse.status, errorText);
        throw new Error("AI gateway error");
      }

      const pitchData = await pitchResponse.json();
      const pitchContent = pitchData.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ content: pitchContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For non-streaming requests
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse as JSON
    let parsed;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in generate-creative-ideas:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
