import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { query, searchType } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ABRAMUS não tem API pública oficial
    // Esta é uma simulação que retorna dados de exemplo
    // Em produção, seria necessário integrar via scraping ou parceria

    const mockResults = [
      {
        id: `ABR_${Date.now()}`,
        title: query,
        artist: 'Artista Exemplo',
        iswc: 'T-000.000.000-0',
        share: '100%',
        publisher: 'Editora Exemplo',
        source: 'ABRAMUS (simulado)',
      },
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: mockResults,
        disclaimer: 'Resultados simulados - integração real requer parceria com ABRAMUS'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
