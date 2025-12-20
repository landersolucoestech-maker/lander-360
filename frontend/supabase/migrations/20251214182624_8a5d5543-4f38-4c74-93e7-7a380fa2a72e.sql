-- Add missing columns to financial_transactions table
ALTER TABLE public.financial_transactions 
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.agenda_events(id),
ADD COLUMN IF NOT EXISTS payment_type text;