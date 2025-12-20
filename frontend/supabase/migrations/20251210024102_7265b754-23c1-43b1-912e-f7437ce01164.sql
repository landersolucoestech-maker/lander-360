-- Add name column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name text;

-- Copy existing description to name for existing records
UPDATE public.services SET name = description WHERE name IS NULL;

-- Make name required for future records
ALTER TABLE public.services ALTER COLUMN name SET NOT NULL;