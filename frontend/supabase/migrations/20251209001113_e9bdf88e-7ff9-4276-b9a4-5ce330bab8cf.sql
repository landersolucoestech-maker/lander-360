-- Add interactions column to crm_contacts table as JSONB
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS interactions jsonb DEFAULT '[]'::jsonb;