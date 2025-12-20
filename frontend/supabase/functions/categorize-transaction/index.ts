import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const CATEGORIES = {
  receitas: ['cache', 'show', 'streaming', 'royalties', 'sync', 'merchandising', 'patrocinio', 'licenciamento'],
  despesas: ['producao', 'marketing', 'distribuicao', 'juridico', 'administrativo', 'equipamento', 'viagem', 'pessoal'],
};

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { description, amount, type } = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const categories = type === 'receita' ? CATEGORIES.receitas : CATEGORIES.despesas;

    const prompt = `Categorize esta transação financeira de uma gravadora/artista musical:
Descrição: "${description}"
Valor: ${amount || 'Não informado'}
Tipo: ${type || 'Não informado'}

Categorias disponíveis: ${categories.join(', ')}

Responda APENAS com um JSON no formato:
{"category": "categoria_escolhida", "confidence": 0.95, "subcategory": "subcategoria_se_houver"}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to categorize');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { category: 'outros', confidence: 0.5 };
    } catch {
      result = { category: 'outros', confidence: 0.5 };
    }

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
