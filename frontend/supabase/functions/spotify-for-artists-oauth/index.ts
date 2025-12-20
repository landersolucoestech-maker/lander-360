import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID');
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET');

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { action, artistId, code, redirectUri } = await req.json();

    const supabase = getSupabaseClient();

    switch (action) {
      case 'get-auth-url': {
        // Gerar URL de autorização
        const state = crypto.randomUUID();
        const scopes = [
          'user-read-private',
          'user-read-email',
          'playlist-read-private',
          'user-top-read',
          'user-read-recently-played',
        ].join(' ');

        // Salvar state no banco
        if (artistId) {
          await supabase.from('spotify_oauth_states').insert({
            artist_id: artistId,
            state,
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
          });
        }

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

        return new Response(
          JSON.stringify({ success: true, authUrl, state }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'exchange-token': {
        if (!code) throw new Error('Authorization code required');

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        const tokens = await response.json();

        // Salvar tokens se artistId fornecido
        if (artistId) {
          await supabase.from('spotify_artist_tokens').upsert({
            artist_id: artistId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          });
        }

        return new Response(
          JSON.stringify({ success: true, tokens }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'refresh-token': {
        // Buscar refresh token do banco
        const { data: tokenData } = await supabase
          .from('spotify_artist_tokens')
          .select('refresh_token')
          .eq('artist_id', artistId)
          .single();

        if (!tokenData?.refresh_token) {
          throw new Error('No refresh token found');
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const tokens = await response.json();

        // Atualizar token no banco
        await supabase.from('spotify_artist_tokens').update({
          access_token: tokens.access_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        }).eq('artist_id', artistId);

        return new Response(
          JSON.stringify({ success: true, access_token: tokens.access_token }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
