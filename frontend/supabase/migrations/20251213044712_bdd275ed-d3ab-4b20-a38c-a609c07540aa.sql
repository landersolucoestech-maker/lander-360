-- Add Deezer and Apple Music URL columns to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS deezer_url text,
ADD COLUMN IF NOT EXISTS apple_music_url text;