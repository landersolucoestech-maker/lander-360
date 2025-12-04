-- Add missing columns to social_media_metrics
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS reach_growth DECIMAL(5,2) DEFAULT 0;

-- Add missing columns to marketing_campaigns
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS ctr DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS cpc DECIMAL(10,2) DEFAULT 0;

-- Add missing columns to marketing_tasks
ALTER TABLE public.marketing_tasks ADD COLUMN IF NOT EXISTS campaign TEXT;
ALTER TABLE public.marketing_tasks ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.marketing_tasks ADD COLUMN IF NOT EXISTS assignee_name TEXT;
ALTER TABLE public.marketing_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Add missing columns to tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL;
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS primary_genre TEXT;

-- Add missing columns to artists
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_id TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;

-- Add missing columns to releases
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS release_type TEXT;