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
      prompt: pitchPrompt,
      // New types
      originalContent,
      contentType,
      targetChannel,
      channels,
      metrics,
      optimizationGoal,
      briefingType,
      freeFormNotes,
      existingBriefingsContext,
    } = requestBody;

    let systemPrompt = `Você é a IA Criativa oficial do sistema de gestão musical Lander 360º.

Seu papel não é apenas criar conteúdo, mas tomar decisões criativas estratégicas, orientadas por dados, mercado atual e objetivos de negócio.

═══════════════════════════════════════════════════════════════
REGRAS FUNDAMENTAIS (INVIOLÁVEIS)
═══════════════════════════════════════════════════════════════

1. Utilize EXCLUSIVAMENTE as informações preenchidas no sistema:
   - Perfil do artista (nome, gênero, bio, redes sociais)
   - Identidade artística e posicionamento
   - Público-alvo definido
   - Objetivos da ação/campanha
   - Histórico de conteúdos e campanhas anteriores
   - Métricas disponíveis (CTR, engajamento, conversão, alcance, retenção)
   - Canal de distribuição selecionado
   - Estágio de carreira do artista

2. NUNCA gere conteúdo genérico.
   Toda saída deve ser:
   - Coerente com a identidade do artista
   - Adequada ao canal específico
   - Compatível com tendências atuais de mercado
   - Focada em resultado (crescimento, engajamento ou conversão)

3. Pense SEMPRE como um profissional do mercado atual:
   - Marketing digital de alta performance
   - Indústria musical brasileira
   - Distribuição em DSPs (Spotify, Deezer, Apple Music, etc.)
   - Conteúdo para redes sociais (Instagram, TikTok, YouTube)
   - Tráfego pago e orgânico
   - Algoritmos e comportamento de consumo

═══════════════════════════════════════════════════════════════
MODO DE RACIOCÍNIO (OBRIGATÓRIO ANTES DE GERAR)
═══════════════════════════════════════════════════════════════

Antes de gerar QUALQUER resposta, siga internamente esta lógica:

1. QUEM é o artista? (perfil, linguagem, posicionamento, estágio de carreira)
2. QUAL é o objetivo principal desta ação? (awareness, engajamento, conversão, streams)
3. EM QUAL CANAL esse conteúdo será publicado? (especificidades da plataforma)
4. EM QUE FASE DO FUNIL o público está? (topo, meio, fundo)
5. QUAIS PADRÕES já funcionaram no histórico deste artista?
6. O QUE O MERCADO ATUAL está favorecendo para esse tipo de conteúdo?

Somente APÓS processar esses 6 pontos, gere a resposta.

═══════════════════════════════════════════════════════════════
FORMATO DAS RESPOSTAS
═══════════════════════════════════════════════════════════════

Sempre que possível, estruture em:
• CONTEXTO / ESTRATÉGIA: Por que esta abordagem
• CONTEÚDO GERADO: O material criativo em si
• VARIAÇÕES (se aplicável): Alternativas para teste
• JUSTIFICATIVA CRIATIVA: Raciocínio por trás das escolhas
• PRÓXIMO PASSO: Sugestão de ação imediata

NUNCA entregue texto solto sem explicação estratégica.

═══════════════════════════════════════════════════════════════
PRINCÍPIOS DE EXECUÇÃO
═══════════════════════════════════════════════════════════════

• Zero enrolação - vá direto ao ponto
• Foco em ROI - cada ação deve ter retorno mensurável
• Sem clichês - nada de frases motivacionais vazias
• Justificativa técnica - explique o porquê de cada escolha
• Impacto vs Esforço - priorize ações de alto impacto com menor esforço
• Honestidade brutal - se algo não funciona, diga claramente
• Dados sempre - use números e métricas quando disponíveis

═══════════════════════════════════════════════════════════════
OBJETIVO FINAL
═══════════════════════════════════════════════════════════════

Transformar dados, identidade artística e contexto de mercado em DECISÕES CRIATIVAS INTELIGENTES, ESCALÁVEIS E MENSURÁVEIS, ajudando o artista a crescer de forma consistente e profissional.

Responda SEMPRE em português brasileiro.`;

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

${historyContext ? `HISTÓRICO DE IDEIAS ANTERIORES (para evitar repetição): ${historyContext}` : ''}

═══════════════════════════════════════════════════════════════
APRENDIZADO DE PERFORMANCE (DADOS HISTÓRICOS)
═══════════════════════════════════════════════════════════════

${requestBody.learningData?.successfulIdeas?.length > 0 ? `
✅ IDEIAS QUE FUNCIONARAM (is_useful = true):
${requestBody.learningData.successfulIdeas.map((idea: any) => `- "${idea.title}" (${idea.suggested_channel}/${idea.content_format}): ${idea.description.substring(0, 100)}...`).join('\n')}

PADRÕES DE SUCESSO IDENTIFICADOS:
- Analise os títulos, canais e formatos acima
- REPLIQUE os padrões que geraram feedback positivo
- Use linguagem e estrutura similar ao que funcionou
` : ''}

${requestBody.learningData?.failedPatterns?.length > 0 ? `
❌ EVITAR (ideias que NÃO funcionaram):
${requestBody.learningData.failedPatterns.map((idea: any) => `- "${idea.title}": ${idea.description.substring(0, 80)}...`).join('\n')}

PADRÕES A EVITAR:
- NÃO repita abordagens similares às acima
- NÃO use o mesmo tom ou estrutura
` : ''}

${!requestBody.learningData?.successfulIdeas?.length && !requestBody.learningData?.failedPatterns?.length ? `
NOTA: Sem histórico de feedback ainda. Gere ideias diversificadas para começar a construir base de aprendizado.
` : ''}

IMPORTANTE: Use o aprendizado acima para gerar ideias MELHORES baseadas no que já funcionou.`;

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

    } else if (type === "content-suggestions-enhanced") {
      const { performanceContext } = requestBody;
      
      systemPrompt += `\n\nGere sugestões de conteúdo INTELIGENTES baseadas em dados de performance histórica. Retorne um JSON array com:
- type: tipo do conteúdo (post, reels, stories, video, etc.)
- platform: plataforma
- content: texto/roteiro do conteúdo
- hashtags: array de hashtags sugeridas
- best_time: melhor horário para postar
- estimated_reach: alcance estimado (alto, médio, baixo)
- performance_reasoning: por que este conteúdo deve performar bem baseado nos dados históricos

IMPORTANTE: Retorne APENAS o JSON array. Use os dados de performance histórica para priorizar formatos e canais que já funcionaram.`;

      userPrompt = `Gere 5 sugestões de conteúdo BASEADAS EM DADOS para:

ARTISTA: ${artistData?.name || 'N/A'}
- Gênero: ${artistData?.genre || 'N/A'}
- Bio: ${artistData?.bio?.substring(0, 200) || 'N/A'}

OBJETIVO: ${objective}
CANAL PREFERIDO: ${channel || 'Qualquer'}

═══════════════════════════════════════════════════════════════
DADOS DE PERFORMANCE HISTÓRICA (use para gerar sugestões mais inteligentes)
═══════════════════════════════════════════════════════════════

${performanceContext ? `
✅ CANAIS QUE MAIS FUNCIONARAM: ${performanceContext.bestChannels?.join(', ') || 'Sem dados'}
✅ FORMATOS QUE MAIS FUNCIONARAM: ${performanceContext.bestFormats?.join(', ') || 'Sem dados'}
✅ TOTAL DE IDEIAS BEM-SUCEDIDAS: ${performanceContext.totalUsefulIdeas || 0}
${performanceContext.successfulCampaigns?.length > 0 ? `✅ CAMPANHAS DE SUCESSO: ${performanceContext.successfulCampaigns.map((c: any) => `${c.name} (CTR: ${c.ctr?.toFixed(2)}%)`).join(', ')}` : ''}

INSTRUÇÃO: Priorize os canais e formatos que já funcionaram. Se "Instagram" funcionou bem, sugira mais conteúdo para Instagram. Se "Reels" funcionou, sugira Reels.
` : 'Sem dados históricos - gere sugestões diversificadas.'}

Gere sugestões que REPLIQUEM os padrões de sucesso identificados.`;

    } else if (type === "pitch") {
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
        throw new Error("AI gateway error");
      }

      const pitchData = await pitchResponse.json();
      const pitchContent = pitchData.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ content: pitchContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "ab-variations") {
      systemPrompt += `\n\nGere variações A/B do conteúdo fornecido. Retorne um JSON array com 4 variações:
- version: nome da versão (ex: "Versão A - Emocional", "Versão B - Racional")
- content: texto da variação
- tone: tom da mensagem
- cta: call-to-action sugerido
- targetAudience: público-alvo ideal para esta versão

IMPORTANTE: Retorne APENAS o JSON array, sem markdown.`;

      userPrompt = `Crie 4 variações A/B para o seguinte conteúdo:

CONTEÚDO ORIGINAL:
${originalContent}

${contentType ? `TIPO DE CONTEÚDO: ${contentType}` : ''}
${targetChannel ? `CANAL: ${targetChannel}` : ''}

As variações devem ter abordagens diferentes:
1. Emocional/Storytelling
2. Racional/Benefícios
3. Urgência/Escassez  
4. Social Proof/Autoridade

Mantenha a mensagem central mas varie tom, estrutura e CTA.`;

    } else if (type === "channel-adaptation") {
      systemPrompt += `\n\nAdapte o conteúdo para diferentes canais de mídia social. Retorne um JSON array com adaptações para cada canal:
- channel: nome do canal
- content: conteúdo adaptado (respeitando limite de caracteres)
- hashtags: array de hashtags relevantes para o canal
- tips: dica específica para o canal

IMPORTANTE: Retorne APENAS o JSON array. Respeite os limites de caracteres de cada plataforma.`;

      userPrompt = `Adapte o seguinte conteúdo para cada canal de mídia social:

CONTEÚDO ORIGINAL:
${originalContent}

${contentType ? `TIPO: ${contentType}` : ''}

Adapte para: ${channels?.join(', ') || 'Instagram, TikTok, YouTube, Twitter, Facebook, LinkedIn'}

LIMITES DE CARACTERES:
- Twitter: 280
- TikTok: 300
- Instagram: 2200
- LinkedIn: 3000
- YouTube: 5000
- Facebook: 63206

Adapte o tom, tamanho e hashtags para cada plataforma.`;

    } else if (type === "optimize-content") {
      systemPrompt += `\n\nOtimize o conteúdo com base nas métricas de performance. Retorne um JSON com:
- optimizedContent: texto otimizado
- changes: array de mudanças aplicadas (ex: "Headline mais forte", "CTA mais claro")
- expectedImprovement: melhoria esperada (ex: "+15-25% CTR")
- reasoning: explicação das mudanças

IMPORTANTE: Retorne APENAS o JSON, sem markdown.`;

      userPrompt = `Otimize o seguinte conteúdo com base nas métricas:

CONTEÚDO ATUAL:
${originalContent}

MÉTRICAS DE PERFORMANCE:
${metrics ? `- Cliques: ${metrics.clicks || 0}
- Impressões: ${metrics.impressions || 0}
- CTR: ${metrics.ctr?.toFixed(2) || 0}%
- Engajamento: ${metrics.engagement || 0}
- Conversões: ${metrics.conversions || 0}` : 'Não disponíveis'}

OBJETIVO DA OTIMIZAÇÃO: ${optimizationGoal || 'Aumentar engajamento geral'}

${campaignData ? `CONTEXTO DA CAMPANHA: ${campaignData.name}` : ''}

Analise o conteúdo e as métricas. Identifique pontos fracos e proponha otimizações concretas para melhorar o resultado.`;

    } else if (type === "briefing-assistant") {
      systemPrompt += `\n\nCrie um briefing completo e estruturado. Retorne um JSON com:
- title: título do briefing
- objective: objetivo claro e mensurável
- targetAudience: descrição detalhada do público
- deliverables: array de entregáveis esperados
- keyMessages: array de mensagens-chave
- tone: tom de comunicação
- references: array de referências sugeridas
- timeline: cronograma sugerido
- budget: faixa de orçamento sugerida
- kpis: array de KPIs para acompanhar

IMPORTANTE: Retorne APENAS o JSON, sem markdown.`;

      userPrompt = `Crie um briefing completo para:

TIPO DE BRIEFING: ${briefingType}

${artistData ? `ARTISTA: ${artistData.name} (${artistData.stage_name || artistData.name})
- Gênero: ${artistData.genre || 'N/A'}
- Bio: ${artistData.bio?.substring(0, 200) || 'N/A'}` : ''}

${releaseData ? `LANÇAMENTO: ${releaseData.title}
- Tipo: ${releaseData.type || releaseData.release_type || 'N/A'}
- Data: ${releaseData.release_date || 'A definir'}` : ''}

${campaignData ? `CAMPANHA VINCULADA: ${campaignData.name}` : ''}

${freeFormNotes ? `NOTAS ADICIONAIS: ${freeFormNotes}` : ''}

${existingBriefingsContext?.length ? `BRIEFINGS ANTERIORES (para referência de padrão):
${existingBriefingsContext.map((b: any) => `- ${b.title}: ${b.objective}`).join('\n')}` : ''}

Crie um briefing profissional, completo e acionável.`;

    } else if (type === "market-trends") {
      systemPrompt += `\n\nVocê é um analista de tendências de mercado musical. Analise as tendências atuais e retorne um JSON com:
- musicTrends: array de tendências musicais [{title, description, relevance (alta/média/baixa), category}]
- socialTrends: array de tendências de redes sociais [{title, description, relevance, category}]
- marketingTrends: array de tendências de marketing digital [{title, description, relevance, category}]
- recommendations: array de recomendações estratégicas baseadas nas tendências
- summary: resumo executivo das tendências identificadas

IMPORTANTE: Retorne APENAS o JSON, sem markdown. Base suas análises em tendências REAIS do mercado brasileiro atual (2024-2025).`;

      const { searchQuery: trendQuery, genre: trendGenre, context: trendContext } = requestBody;
      
      userPrompt = `Analise as tendências de mercado para o seguinte contexto:

GÊNERO/NICHO: ${trendGenre || 'Música brasileira geral'}
CONTEXTO/BUSCA: ${trendContext || trendQuery || 'Tendências gerais'}

Forneça:
1. 5 tendências musicais relevantes (novos sons, formatos de conteúdo, colaborações em alta)
2. 5 tendências de redes sociais (formatos virais, recursos novos, comportamento de audiência)
3. 5 tendências de marketing digital (estratégias que estão funcionando, novas plataformas, táticas de crescimento)
4. 5 recomendações estratégicas para aproveitar essas tendências
5. Um resumo executivo de 2-3 frases

Foque no mercado BRASILEIRO e em dados ATUAIS (2024-2025). Seja específico e prático.`;
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
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse as JSON
    let parsed;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
