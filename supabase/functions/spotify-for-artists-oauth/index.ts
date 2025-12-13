import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANTE: Quando tiver acesso à API do Spotify for Artists,
// configure estas variáveis no painel de secrets do Lovable Cloud:
// - SPOTIFY_FOR_ARTISTS_CLIENT_ID
// - SPOTIFY_FOR_ARTISTS_CLIENT_SECRET
// 
// A API do Spotify for Artists requer aprovação comercial da Spotify.
// Documentação: https://developer.spotify.com/documentation/web-api/concepts/spotify-for-artists

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Scopes necessários para Spotify for Artists
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'streaming',
  'user-top-read',
  'user-read-recently-played',
  // Scopes específicos do Spotify for Artists (requerem aprovação)
  // 'artist-read-analytics',
  // 'artist-read-private',
].join(' ');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, artistId, code, state, redirectUri } = await req.json();

    // Verificar se as credenciais estão configuradas
    const clientId = Deno.env.get('SPOTIFY_FOR_ARTISTS_CLIENT_ID');
    const clientSecret = Deno.env.get('SPOTIFY_FOR_ARTISTS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ 
        error: 'Spotify for Artists não configurado',
        message: 'Configure SPOTIFY_FOR_ARTISTS_CLIENT_ID e SPOTIFY_FOR_ARTISTS_CLIENT_SECRET nos secrets do Lovable Cloud',
        setupRequired: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'initiate': {
        // Gerar state para segurança
        const stateToken = crypto.randomUUID();
        
        // Salvar state temporariamente para validação
        await supabase.from('spotify_oauth_states').upsert({
          state: stateToken,
          artist_id: artistId,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min
        });

        const authUrl = new URL(SPOTIFY_AUTH_URL);
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', SCOPES);
        authUrl.searchParams.set('state', stateToken);
        authUrl.searchParams.set('show_dialog', 'true');

        return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'callback': {
        // Validar state
        const { data: stateData } = await supabase
          .from('spotify_oauth_states')
          .select('*')
          .eq('state', state)
          .single();

        if (!stateData) {
          throw new Error('State inválido ou expirado');
        }

        // Trocar code por tokens
        const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
          })
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
          throw new Error(tokens.error_description || tokens.error);
        }

        // Salvar tokens criptografados
        await supabase.from('spotify_artist_tokens').upsert({
          artist_id: stateData.artist_id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          connected_at: new Date().toISOString()
        });

        // Limpar state usado
        await supabase.from('spotify_oauth_states').delete().eq('state', state);

        return new Response(JSON.stringify({ 
          success: true,
          artistId: stateData.artist_id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'check': {
        const { data: tokenData } = await supabase
          .from('spotify_artist_tokens')
          .select('expires_at')
          .eq('artist_id', artistId)
          .single();

        const connected = tokenData && new Date(tokenData.expires_at) > new Date();

        return new Response(JSON.stringify({ connected }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'disconnect': {
        await supabase
          .from('spotify_artist_tokens')
          .delete()
          .eq('artist_id', artistId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list': {
        const { data: artists } = await supabase
          .from('spotify_artist_tokens')
          .select('artist_id, connected_at, expires_at')
          .gt('expires_at', new Date().toISOString());

        return new Response(JSON.stringify({ artists: artists || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Ação não reconhecida');
    }
  } catch (error) {
    console.error('Erro no OAuth Spotify for Artists:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
