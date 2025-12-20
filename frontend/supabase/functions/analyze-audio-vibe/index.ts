import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { audioUrl, fileName, genre, artistName } = await req.json();

    // Análise baseada em metadados e contexto
    const prompt = `Analise as características de uma música com base nas seguintes informações:
- Nome do arquivo: ${fileName || 'Não especificado'}
- Gênero: ${genre || 'Não especificado'}
- Artista: ${artistName || 'Não especificado'}

Gere uma análise criativa incluindo:
1. Vibe/mood provável (alegre, melancólico, energético, etc.)
2. BPM estimado para o gênero
3. Instrumentação típica
4. Público-alvo
5. Playlists ideais para pitching no Spotify
6. Horários recomendados para lançamento
7. Estratégia de marketing sugerida

Responda em JSON com os campos: vibe, bpm, instruments, targetAudience, playlists, releaseStrategy, marketingTips`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze audio');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      analysis = { raw: content };
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
