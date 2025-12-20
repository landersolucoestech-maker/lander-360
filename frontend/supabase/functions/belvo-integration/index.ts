import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const BELVO_SECRET_ID = Deno.env.get('BELVO_SECRET_ID');
const BELVO_SECRET = Deno.env.get('BELVO_SECRET');
const BELVO_API_URL = Deno.env.get('BELVO_API_URL') || 'https://sandbox.belvo.com';

async function getBelvoAuth(): Promise<string> {
  return btoa(`${BELVO_SECRET_ID}:${BELVO_SECRET}`);
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { action, linkId, dateFrom, dateTo, accountId } = await req.json();

    if (!BELVO_SECRET_ID || !BELVO_SECRET) {
      return new Response(
        JSON.stringify({ 
          error: 'Belvo credentials not configured',
          disclaimer: 'Integração com Belvo requer credenciais válidas'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const auth = await getBelvoAuth();
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'list-institutions': {
        const response = await fetch(`${BELVO_API_URL}/api/institutions/`, { headers });
        result = await response.json();
        break;
      }

      case 'get-accounts': {
        if (!linkId) throw new Error('Link ID required');
        const response = await fetch(`${BELVO_API_URL}/api/accounts/?link=${linkId}`, { headers });
        result = await response.json();
        break;
      }

      case 'get-transactions': {
        if (!linkId) throw new Error('Link ID required');
        const url = `${BELVO_API_URL}/api/transactions/?link=${linkId}${dateFrom ? `&date_from=${dateFrom}` : ''}${dateTo ? `&date_to=${dateTo}` : ''}`;
        const response = await fetch(url, { headers });
        result = await response.json();
        break;
      }

      case 'get-balances': {
        if (!linkId) throw new Error('Link ID required');
        const response = await fetch(`${BELVO_API_URL}/api/balances/?link=${linkId}`, { headers });
        result = await response.json();
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: list-institutions, get-accounts, get-transactions, get-balances' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
