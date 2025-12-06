import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbramusWork {
  codigo_abramus: string;
  codigo_ecad: string;
  titulo: string;
  genero: string;
  idioma: string;
  instrumental: boolean;
  participantes: Array<{
    nome: string;
    cpf: string;
    funcao: string;
    percentual: number;
  }>;
}

// Simulated ABRAMUS database for demonstration
// In production, this would connect to the actual ABRAMUS API
const mockAbramusWorks: AbramusWork[] = [
  {
    codigo_abramus: "ABR001234",
    codigo_ecad: "T-123.456.789-0",
    titulo: "Amor de Verão",
    genero: "pop",
    idioma: "portugues",
    instrumental: false,
    participantes: [
      { nome: "João Silva", cpf: "123.456.789-00", funcao: "compositor", percentual: 50 },
      { nome: "Maria Santos", cpf: "987.654.321-00", funcao: "autor", percentual: 50 }
    ]
  },
  {
    codigo_abramus: "ABR005678",
    codigo_ecad: "T-987.654.321-0",
    titulo: "Noite de Samba",
    genero: "samba",
    idioma: "portugues",
    instrumental: false,
    participantes: [
      { nome: "Carlos Oliveira", cpf: "111.222.333-44", funcao: "compositor", percentual: 100 }
    ]
  },
  {
    codigo_abramus: "ABR009012",
    codigo_ecad: "T-456.789.012-3",
    titulo: "Instrumental Sunset",
    genero: "jazz",
    idioma: "instrumental",
    instrumental: true,
    participantes: [
      { nome: "Pedro Costa", cpf: "555.666.777-88", funcao: "compositor", percentual: 100 }
    ]
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    let results: AbramusWork[] = [];

    switch (searchType) {
      case 'titulo':
        results = mockAbramusWorks.filter(work => 
          work.titulo.toLowerCase().includes(normalizedQuery)
        );
        break;
      case 'codigo':
        results = mockAbramusWorks.filter(work => 
          work.codigo_abramus.toLowerCase().includes(normalizedQuery) ||
          work.codigo_ecad.toLowerCase().includes(normalizedQuery)
        );
        break;
      case 'participante':
        results = mockAbramusWorks.filter(work => 
          work.participantes.some(p => p.nome.toLowerCase().includes(normalizedQuery))
        );
        break;
      default:
        // Search all fields
        results = mockAbramusWorks.filter(work => 
          work.titulo.toLowerCase().includes(normalizedQuery) ||
          work.codigo_abramus.toLowerCase().includes(normalizedQuery) ||
          work.codigo_ecad.toLowerCase().includes(normalizedQuery) ||
          work.genero.toLowerCase().includes(normalizedQuery) ||
          work.participantes.some(p => p.nome.toLowerCase().includes(normalizedQuery))
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        total: results.length,
        message: results.length > 0 
          ? `${results.length} obra(s) encontrada(s)` 
          : 'Nenhuma obra encontrada na base ABRAMUS'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-abramus function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
