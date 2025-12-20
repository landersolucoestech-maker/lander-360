-- Add royalty management fields to releases table
ALTER TABLE public.releases 
ADD COLUMN IF NOT EXISTS royalties_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS royalties_expected numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_received numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_share_applied boolean DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_verified_at timestamp with time zone DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_notes text DEFAULT null;