-- Add royalty management fields to music_registry (obras)
ALTER TABLE public.music_registry 
ADD COLUMN IF NOT EXISTS royalties_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS royalties_expected numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_received numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_share_applied boolean DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_verified_at timestamp with time zone DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_notes text DEFAULT null;

-- Add royalty management fields to phonograms
ALTER TABLE public.phonograms 
ADD COLUMN IF NOT EXISTS royalties_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS royalties_expected numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_received numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS royalties_share_applied boolean DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_verified_at timestamp with time zone DEFAULT null,
ADD COLUMN IF NOT EXISTS royalties_notes text DEFAULT null;

-- Add abramus_code and ecad_code to phonograms if not exists
ALTER TABLE public.phonograms 
ADD COLUMN IF NOT EXISTS abramus_code text DEFAULT null,
ADD COLUMN IF NOT EXISTS ecad_code text DEFAULT null;