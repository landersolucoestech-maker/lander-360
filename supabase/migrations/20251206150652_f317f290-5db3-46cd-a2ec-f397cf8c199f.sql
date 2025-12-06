-- Create storage bucket for project audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-audio',
  'project-audio',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for project-audio bucket
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-audio');

CREATE POLICY "Authenticated users can view audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'project-audio');

CREATE POLICY "Authenticated users can update their audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-audio');

CREATE POLICY "Authenticated users can delete audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-audio');

-- Add audio_files column to projects table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'audio_files'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN audio_files jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;