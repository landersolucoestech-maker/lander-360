-- Add unique constraint for upsert on social_media_metrics
CREATE UNIQUE INDEX IF NOT EXISTS social_media_metrics_artist_platform_date_idx 
ON public.social_media_metrics (artist_id, platform, date);