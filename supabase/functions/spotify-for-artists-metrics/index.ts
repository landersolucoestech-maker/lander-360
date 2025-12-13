import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMPORTANTE: Esta função usa a API privada do Spotify for Artists
// que requer aprovação comercial da Spotify.
// 
// Quando aprovado, a API fornece:
// - Streams reais (não estimados)
// - Listeners únicos
// - Saves e playlist adds
// - Demografia (idade, gênero, localização)
// - Dados de fontes (playlists, algoritmo, etc.)

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
// Endpoint privado do Spotify for Artists (requer aprovação)
const SPOTIFY_ANALYTICS_BASE = 'https://generic.wg.spotify.com/s4x-insights-api/v1';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { artistId, releaseId, dateRange } = await req.json();

    // Buscar token do artista
    const { data: tokenData } = await supabase
      .from('spotify_artist_tokens')
      .select('*')
      .eq('artist_id', artistId)
      .single();

    if (!tokenData) {
      return new Response(JSON.stringify({ 
        error: 'Artista não conectado ao Spotify for Artists',
        requiresAuth: true
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se token expirou e renovar se necessário
    let accessToken = tokenData.access_token;
    if (new Date(tokenData.expires_at) <= new Date()) {
      accessToken = await refreshToken(tokenData.refresh_token, supabase, artistId);
    }

    // Buscar métricas do artista
    // NOTA: Estes endpoints são ilustrativos - a API real do Spotify for Artists
    // pode ter endpoints diferentes dependendo do nível de acesso aprovado

    const metrics = await fetchArtistMetrics(accessToken, releaseId, dateRange);

    // Salvar métricas no banco para histórico
    if (releaseId && metrics) {
      await supabase.from('release_streaming_metrics').upsert({
        release_id: releaseId,
        platform: 'spotify',
        streams: metrics.streams,
        saves: metrics.saves,
        playlist_adds: metrics.playlistAdds,
        fetched_at: new Date().toISOString()
      }, {
        onConflict: 'release_id,platform'
      });
    }

    return new Response(JSON.stringify({ metrics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro interno' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function refreshToken(refreshToken: string, supabase: any, artistId: string): Promise<string> {
  const clientId = Deno.env.get('SPOTIFY_FOR_ARTISTS_CLIENT_ID')!;
  const clientSecret = Deno.env.get('SPOTIFY_FOR_ARTISTS_CLIENT_SECRET')!;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const tokens = await response.json();

  if (tokens.error) {
    throw new Error('Falha ao renovar token - artista precisa reconectar');
  }

  // Atualizar token no banco
  await supabase.from('spotify_artist_tokens').update({
    access_token: tokens.access_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  }).eq('artist_id', artistId);

  return tokens.access_token;
}

async function fetchArtistMetrics(accessToken: string, releaseId?: string, dateRange?: string) {
  // NOTA: Esta é uma estrutura preparada para quando você tiver acesso à API real
  // Os endpoints abaixo são ilustrativos e precisarão ser ajustados conforme
  // a documentação oficial do Spotify for Artists API

  try {
    // Primeiro, buscar o Spotify Artist ID se não tiver
    const meResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!meResponse.ok) {
      throw new Error('Token inválido ou expirado');
    }

    const userData = await meResponse.json();
    
    // Estrutura de dados que a API real deve retornar
    // Quando tiver acesso, substituir pelos endpoints reais:
    // 
    // GET /v1/artists/{id}/insights/streams
    // GET /v1/artists/{id}/insights/listeners  
    // GET /v1/artists/{id}/insights/followers
    // GET /v1/artists/{id}/insights/demographics
    // GET /v1/releases/{id}/insights (para release específico)

    return {
      streams: null, // Será preenchido com dados reais
      listeners: null,
      saves: null,
      playlistAdds: null,
      followers: null,
      topCities: [],
      topCountries: [],
      demographics: {
        ageRanges: [],
        genderSplit: { male: 0, female: 0, other: 0 }
      },
      _note: 'Aguardando configuração de credenciais Spotify for Artists'
    };
  } catch (error) {
    console.error('Erro ao buscar métricas Spotify:', error);
    throw error;
  }
}
