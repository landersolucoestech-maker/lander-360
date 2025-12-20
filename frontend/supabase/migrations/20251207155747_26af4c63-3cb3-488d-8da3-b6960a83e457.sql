-- Add new columns to inventory table for complete form data
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS sector text,
ADD COLUMN IF NOT EXISTS responsible text,
ADD COLUMN IF NOT EXISTS purchase_location text,
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS entry_date date,
ADD COLUMN IF NOT EXISTS unit_value numeric,
ADD COLUMN IF NOT EXISTS observations text;