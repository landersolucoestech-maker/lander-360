-- Add UPC code column to releases table
ALTER TABLE public.releases ADD COLUMN IF NOT EXISTS upc VARCHAR(20);