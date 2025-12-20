-- Add missing columns to releases table
ALTER TABLE public.releases 
ADD COLUMN IF NOT EXISTS genre text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS label text,
ADD COLUMN IF NOT EXISTS copyright text,
ADD COLUMN IF NOT EXISTS distributors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tracks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id);