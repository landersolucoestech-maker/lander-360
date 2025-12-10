-- Add artist_types column to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS artist_types text[] DEFAULT '{}';