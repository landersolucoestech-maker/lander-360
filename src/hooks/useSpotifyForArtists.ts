import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpotifyForArtistsMetrics {
  streams: number;
  listeners: number;
  saves: number;
  playlistAdds: number;
  followers: number;
  topCities: { city: string; country: string; listeners: number }[];
  topCountries: { country: string; listeners: number }[];
  demographics: {
    ageRanges: { range: string; percentage: number }[];
    genderSplit: { male: number; female: number; other: number };
  };
}

interface SpotifyArtistToken {
  artistId: string;
  artistName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  connectedAt: string;
}

export function useSpotifyForArtists() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedArtists, setConnectedArtists] = useState<SpotifyArtistToken[]>([]);
  const { toast } = useToast();

  // Iniciar fluxo OAuth para um artista específico
  const initiateOAuth = useCallback(async (artistId: string) => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('spotify-for-artists-oauth', {
        body: { 
          action: 'initiate',
          artistId,
          redirectUri: `${window.location.origin}/callback/spotify-for-artists`
        }
      });

      if (error) throw error;

      // Redirecionar para URL de autorização do Spotify
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Erro ao iniciar OAuth:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a conexão com Spotify for Artists',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  // Processar callback do OAuth
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-for-artists-oauth', {
        body: { 
          action: 'callback',
          code,
          state,
          redirectUri: `${window.location.origin}/callback/spotify-for-artists`
        }
      });

      if (error) throw error;

      toast({
        title: 'Conectado!',
        description: `Artista conectado ao Spotify for Artists com sucesso`
      });

      return data;
    } catch (error) {
      console.error('Erro no callback OAuth:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar autorização do Spotify',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  // Buscar métricas reais de um artista conectado
  const fetchArtistMetrics = useCallback(async (artistId: string, releaseId?: string): Promise<SpotifyForArtistsMetrics | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-for-artists-metrics', {
        body: { 
          artistId,
          releaseId,
          dateRange: '28days' // últimos 28 dias
        }
      });

      if (error) throw error;

      return data?.metrics || null;
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar métricas do Spotify for Artists',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  // Verificar se um artista está conectado
  const checkArtistConnection = useCallback(async (artistId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-for-artists-oauth', {
        body: { 
          action: 'check',
          artistId
        }
      });

      if (error) throw error;

      return data?.connected || false;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }, []);

  // Desconectar artista
  const disconnectArtist = useCallback(async (artistId: string) => {
    try {
      const { error } = await supabase.functions.invoke('spotify-for-artists-oauth', {
        body: { 
          action: 'disconnect',
          artistId
        }
      });

      if (error) throw error;

      toast({
        title: 'Desconectado',
        description: 'Artista desconectado do Spotify for Artists'
      });

      setConnectedArtists(prev => prev.filter(a => a.artistId !== artistId));
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desconectar o artista',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Listar artistas conectados
  const listConnectedArtists = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('spotify-for-artists-oauth', {
        body: { action: 'list' }
      });

      if (error) throw error;

      setConnectedArtists(data?.artists || []);
      return data?.artists || [];
    } catch (error) {
      console.error('Erro ao listar artistas:', error);
      return [];
    }
  }, []);

  return {
    isConnecting,
    connectedArtists,
    initiateOAuth,
    handleOAuthCallback,
    fetchArtistMetrics,
    checkArtistConnection,
    disconnectArtist,
    listConnectedArtists
  };
}
