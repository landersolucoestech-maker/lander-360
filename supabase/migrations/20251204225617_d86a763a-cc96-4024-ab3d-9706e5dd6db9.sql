-- Add missing columns to financial_transactions
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add missing columns to marketing_briefings
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS campaign TEXT;
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS deliverables TEXT[];
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.marketing_briefings ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2);

-- Add missing columns to social_media_metrics
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS stories_count INTEGER DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS followers_growth DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.social_media_metrics ADD COLUMN IF NOT EXISTS engagement_growth DECIMAL(5,2) DEFAULT 0;