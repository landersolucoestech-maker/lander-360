-- Add status and priority columns to crm_contacts table
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS priority text,
ADD COLUMN IF NOT EXISTS next_action text;