-- Add address fields to crm_contacts table
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS document text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;