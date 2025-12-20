-- Add new columns to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS grupo text;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS margin numeric DEFAULT 0;

-- Update column defaults
ALTER TABLE public.services ALTER COLUMN sale_price SET DEFAULT 0;
ALTER TABLE public.services ALTER COLUMN final_price SET DEFAULT 0;