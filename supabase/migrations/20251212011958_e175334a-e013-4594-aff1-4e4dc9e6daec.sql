-- Add financial_support column to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS financial_support numeric DEFAULT NULL;