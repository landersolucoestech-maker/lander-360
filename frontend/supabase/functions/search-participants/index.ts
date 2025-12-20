import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AbramusParticipant {
  nome: string;
  cpf: string;
  codigo_abramus: string;
  funcoes: string[];
  obras_registradas: number;
}

// Simulated ABRAMUS participants database
// In production, this would connect to the actual ABRAMUS API
const mockAbramusParticipants: AbramusParticipant[] = [
  {
    nome: "João Silva",
    cpf: "123.456.789-00",
    codigo_abramus: "PART001",
    funcoes: ["compositor", "autor"],
    obras_registradas: 15
  },
  {
    nome: "Maria Santos",
    cpf: "987.654.321-00",
    codigo_abramus: "PART002",
    funcoes: ["autor", "versionista"],
    obras_registradas: 8
  },
  {
    nome: "Carlos Oliveira",
    cpf: "111.222.333-44",
    codigo_abramus: "PART003",
    funcoes: ["compositor"],
    obras_registradas: 23
  },
  {
    nome: "Pedro Costa",
    cpf: "555.666.777-88",
    codigo_abramus: "PART004",
    funcoes: ["compositor", "produtor"],
    obras_registradas: 12
  },
  {
    nome: "Ana Ferreira",
    cpf: "999.888.777-66",
    codigo_abramus: "PART005",
    funcoes: ["autor", "tradutor"],
    obras_registradas: 5
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // Search by name or CPF
    const results = mockAbramusParticipants.filter(participant => 
      participant.nome.toLowerCase().includes(normalizedQuery) ||
      participant.cpf.includes(normalizedQuery)
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        total: results.length,
        message: results.length > 0 
          ? `${results.length} participante(s) encontrado(s)` 
          : 'Nenhum participante encontrado na base ABRAMUS'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-participants function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
