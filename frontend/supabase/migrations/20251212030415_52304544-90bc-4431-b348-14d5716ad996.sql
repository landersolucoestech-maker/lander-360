-- Add project_id column to music_registry table to link works to projects
ALTER TABLE public.music_registry 
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_music_registry_project_id ON public.music_registry(project_id);