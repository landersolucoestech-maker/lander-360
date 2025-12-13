-- Create table for release streaming metrics
CREATE TABLE public.release_streaming_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID NOT NULL REFERENCES public.releases(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  streams BIGINT DEFAULT 0,
  views BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  playlist_adds BIGINT DEFAULT 0,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(release_id, platform, fetched_at)
);

-- Enable RLS
ALTER TABLE public.release_streaming_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view release_streaming_metrics"
ON public.release_streaming_metrics
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert release_streaming_metrics"
ON public.release_streaming_metrics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update release_streaming_metrics"
ON public.release_streaming_metrics
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete release_streaming_metrics"
ON public.release_streaming_metrics
FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_release_streaming_metrics_release_id ON public.release_streaming_metrics(release_id);
CREATE INDEX idx_release_streaming_metrics_platform ON public.release_streaming_metrics(platform);
CREATE INDEX idx_release_streaming_metrics_fetched_at ON public.release_streaming_metrics(fetched_at DESC);