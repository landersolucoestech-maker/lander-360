import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { artistName, genre, releaseTitle, platform, objective, context } = await req.json();

    const systemPrompt = `Você é um especialista em marketing musical e criação de conteúdo para artistas.
Gere ideias criativas, estratégicas e práticas para promover artistas e lançamentos musicais.
Sempre responda em português brasileiro.
Seja específico e actionável nas sugestões.`;

    const userPrompt = `Gere ideias criativas de marketing para:
- Artista: ${artistName || 'Não especificado'}
- Gênero: ${genre || 'Não especificado'}
- Lançamento: ${releaseTitle || 'Não especificado'}
- Plataforma foco: ${platform || 'Todas'}
- Objetivo: ${objective || 'Aumentar engajamento'}
${context ? `- Contexto adicional: ${context}` : ''}

Gere 5 ideias criativas com:
1. Título da ideia
2. Descrição detalhada
3. Plataforma recomendada
4. Formato de conteúdo
5. Melhores horários para postar
6. Hashtags sugeridas

Responda em formato JSON com array de objetos.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate ideas');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let ideas;
    try {
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      ideas = [{ title: 'Ideia gerada', description: content, platform: platform || 'Instagram' }];
    }

    return new Response(
      JSON.stringify({ success: true, ideas }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
