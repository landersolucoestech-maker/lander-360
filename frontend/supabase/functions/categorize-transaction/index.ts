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
    const { descriptions } = await req.json();
    
    if (!descriptions || !Array.isArray(descriptions) || descriptions.length === 0) {
      return new Response(
        JSON.stringify({ error: "descriptions array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um assistente especializado em categorização de transações financeiras para uma empresa do ramo musical (gravadora/editora).

Categorize cada descrição de transação em UMA das seguintes categorias e tipos:

RECEITAS (type: "receitas"):
- streaming: Pagamentos de plataformas de streaming
- onerpm, distrokid, 30por1, believe, tunecore, cd_baby: Pagamentos de distribuidoras
- shows: Receita de shows e apresentações
- licenciamento: Licenciamento de músicas
- merchandising: Venda de produtos
- publicidade: Receita de publicidade
- producao: Serviços de produção
- distribuicao: Serviços de distribuição
- gestao: Serviços de gestão

DESPESAS (type: "despesas"):
- caches: Pagamento de artistas
- marketing: Marketing e publicidade
- salarios: Salários e folha
- aluguel: Aluguel
- manutencao: Manutenção
- viagens: Viagens e transporte
- juridicos: Serviços jurídicos
- contabilidade: Contabilidade
- estudio: Estúdio e gravação
- equipamentos: Equipamentos
- registros: Registros (ECAD, ABRAMUS)
- licencas: Licenças de software
- infraestrutura: Contas de luz, água, internet
- servicos: Serviços gerais
- equipe: Equipe e funcionários
- produtores: Pagamento de produtores

INVESTIMENTOS (type: "investimentos"):
- clipes: Produção de clipes
- turne: Turnê
- capacitacao: Cursos e treinamentos
- producao_musical: Investimento em produção
- marketing_digital: Investimento em marketing

Se não conseguir categorizar, use category: "outros" e type baseado no contexto (receitas se parece entrada, despesas se parece saída).

Responda APENAS com um JSON array, sem explicações.`;

    const userPrompt = `Categorize estas transações:\n${descriptions.map((d: string, i: number) => `${i + 1}. "${d}"`).join('\n')}

Responda com um array JSON no formato:
[{"index": 0, "category": "categoria", "type": "receitas|despesas|investimentos"}, ...]`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    let categorizations;
    try {
      categorizations = JSON.parse(jsonStr);
    } catch {
      categorizations = descriptions.map((_: string, i: number) => ({
        index: i,
        category: "outros",
        type: "despesas"
      }));
    }

    return new Response(
      JSON.stringify({ categorizations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
