-- Create table for Spotify metrics
CREATE TABLE public.spotify_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  spotify_artist_id TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  monthly_listeners INTEGER DEFAULT 0,
  popularity INTEGER DEFAULT 0,
  total_streams BIGINT DEFAULT 0,
  top_tracks JSONB DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_spotify_metrics_artist_id ON public.spotify_metrics(artist_id);
CREATE INDEX idx_spotify_metrics_fetched_at ON public.spotify_metrics(fetched_at DESC);

-- Enable RLS
ALTER TABLE public.spotify_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins and managers can view spotify_metrics"
  ON public.spotify_metrics
  FOR SELECT
  USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admins and managers can insert spotify_metrics"
  ON public.spotify_metrics
  FOR INSERT
  WITH CHECK ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admins and managers can update spotify_metrics"
  ON public.spotify_metrics
  FOR UPDATE
  USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admins can delete spotify_metrics"
  ON public.spotify_metrics
  FOR DELETE
  USING ((auth.role() = 'authenticated') AND has_role(auth.uid(), 'admin'));