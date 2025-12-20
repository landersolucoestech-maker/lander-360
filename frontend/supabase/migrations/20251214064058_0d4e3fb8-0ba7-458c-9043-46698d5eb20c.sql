-- Revert royalty_onerpm_details_summary table structure
-- Add back share_in and share_out columns, remove share_type and share_in_out
ALTER TABLE public.royalty_onerpm_details_summary 
DROP COLUMN IF EXISTS share_type,
DROP COLUMN IF EXISTS share_in_out;

ALTER TABLE public.royalty_onerpm_details_summary 
ADD COLUMN IF NOT EXISTS share_in NUMERIC(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_out NUMERIC(10,4) DEFAULT 0;