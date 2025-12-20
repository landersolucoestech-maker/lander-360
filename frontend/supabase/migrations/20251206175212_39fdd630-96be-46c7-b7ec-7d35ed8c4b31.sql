-- Add participants JSONB column to store complete participant data
ALTER TABLE public.music_registry 
ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb;