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
    const { analysisType, systemData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um analista especializado em sistemas de gestão para a indústria musical. Sua função é analisar o sistema Lander 360º e fornecer insights detalhados.

Você deve analisar os seguintes aspectos do sistema:
1. **Erros e Problemas**: Identifique possíveis bugs, falhas de validação, campos faltantes
2. **Melhorias de UX/UI**: Sugira melhorias na experiência do usuário
3. **Segurança**: Aponte vulnerabilidades e recomendações de segurança
4. **Performance**: Identifique gargalos e otimizações possíveis
5. **Integrações**: Sugira novas integrações úteis
6. **Automações**: Recomende processos que podem ser automatizados
7. **Conformidade**: Verifique compliance com LGPD, direitos autorais, etc.

Forneça respostas estruturadas, objetivas e acionáveis em português brasileiro.
Use bullet points e organize por prioridade (crítico, alto, médio, baixo).
Seja direto e técnico, sem rodeios.`;

    const userPrompt = analysisType === 'full' 
      ? `Faça uma análise completa do sistema de gestão musical Lander 360º com base nos seguintes dados do sistema:

${JSON.stringify(systemData, null, 2)}

Forneça uma análise detalhada cobrindo todos os 7 aspectos mencionados, priorizando os problemas mais críticos primeiro.`
      : `Analise especificamente o aspecto "${analysisType}" do sistema Lander 360º:

${JSON.stringify(systemData, null, 2)}

Forneça recomendações detalhadas e acionáveis.`;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("analyze-system error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
