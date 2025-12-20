-- Add artist_name column to crm_contacts table
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS artist_name text;