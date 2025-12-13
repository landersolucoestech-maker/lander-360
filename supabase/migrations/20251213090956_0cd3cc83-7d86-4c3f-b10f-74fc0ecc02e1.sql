-- Tabela para armazenar states temporários do OAuth
CREATE TABLE IF NOT EXISTS public.spotify_oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Tabela para armazenar tokens do Spotify for Artists
CREATE TABLE IF NOT EXISTS public.spotify_artist_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_spotify_oauth_states_state ON public.spotify_oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_spotify_oauth_states_expires ON public.spotify_oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_spotify_artist_tokens_artist ON public.spotify_artist_tokens(artist_id);
CREATE INDEX IF NOT EXISTS idx_spotify_artist_tokens_expires ON public.spotify_artist_tokens(expires_at);

-- RLS
ALTER TABLE public.spotify_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_artist_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para service role (edge functions)
CREATE POLICY "Service role can manage oauth states"
ON public.spotify_oauth_states
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage artist tokens"
ON public.spotify_artist_tokens
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_spotify_artist_tokens_updated_at
  BEFORE UPDATE ON public.spotify_artist_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();