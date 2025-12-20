-- Update royalty_onerpm_details_summary table structure
-- Remove share_in and share_out columns, add share_type and share_in_out
ALTER TABLE public.royalty_onerpm_details_summary 
DROP COLUMN IF EXISTS share_in,
DROP COLUMN IF EXISTS share_out;

ALTER TABLE public.royalty_onerpm_details_summary 
ADD COLUMN IF NOT EXISTS share_type TEXT,
ADD COLUMN IF NOT EXISTS share_in_out NUMERIC(10,4) DEFAULT 0;