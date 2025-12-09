-- Add record_label_name column to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS record_label_name text;