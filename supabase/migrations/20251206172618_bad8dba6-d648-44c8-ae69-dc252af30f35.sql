-- Add ABRAMUS and ECAD code fields to music_registry
ALTER TABLE public.music_registry 
ADD COLUMN IF NOT EXISTS abramus_code text,
ADD COLUMN IF NOT EXISTS ecad_code text;

-- Update status column to use new values
COMMENT ON COLUMN public.music_registry.status IS 'Status values: em_analise, aceita, pendente, recusada';