-- Add record label contact fields to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS label_contact_name text,
ADD COLUMN IF NOT EXISTS label_contact_phone text,
ADD COLUMN IF NOT EXISTS label_contact_email text;