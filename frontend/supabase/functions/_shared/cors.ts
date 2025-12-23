// Lista de origens permitidas - adicione seus domínios de produção aqui
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://rlinswqockcnijhojnth.supabase.co',
  'https://sonartista.preview.emergentagent.com',
];

// Em produção, defina ALLOWED_ORIGIN como variável de ambiente
const PRODUCTION_ORIGIN = Deno.env.get('ALLOWED_ORIGIN');
if (PRODUCTION_ORIGIN) {
  ALLOWED_ORIGINS.push(PRODUCTION_ORIGIN);
}

// Também permite qualquer subdomínio do emergentagent.com para preview
const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.preview.emergentagent.com')) return true;
  if (origin.endsWith('.emergentagent.com')) return true;
  return false;
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

export function handleCors(req: Request): Response | null {
  const origin = req.headers.get('origin');
  
  // Para requests OPTIONS (preflight), sempre responde
  if (req.method === 'OPTIONS') {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    };
    
    // Se a origem é permitida, reflete ela; senão usa '*' para não quebrar em dev
    if (origin && isAllowedOrigin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else {
      headers['Access-Control-Allow-Origin'] = '*';
    }
    
    return new Response(null, { headers });
  }
  
  return null;
}

// Helper para criar response com CORS correto baseado na origem
export function createCorsResponse(body: string, origin: string | null, status = 200): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
  
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  return new Response(body, { status, headers });
}
