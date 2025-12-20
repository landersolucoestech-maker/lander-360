-- Add audio_url column to phonograms table for persisting attached audio files
ALTER TABLE public.phonograms 
ADD COLUMN audio_url text;