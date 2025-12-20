-- Add missing columns to contracts table
ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS client_type text,
ADD COLUMN IF NOT EXISTS service_type text,
ADD COLUMN IF NOT EXISTS contractor_contact text,
ADD COLUMN IF NOT EXISTS responsible_person text,
ADD COLUMN IF NOT EXISTS payment_type text,
ADD COLUMN IF NOT EXISTS fixed_value numeric,
ADD COLUMN IF NOT EXISTS royalties_percentage numeric,
ADD COLUMN IF NOT EXISTS terms text,
ADD COLUMN IF NOT EXISTS registry_office boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS registry_date date,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id),
ADD COLUMN IF NOT EXISTS observations text;