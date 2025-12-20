-- Add missing columns to artists table

-- Personal data
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cpf_cnpj text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS rg text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS full_address text;

-- Banking data
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS bank text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS agency text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS account text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS pix_key text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS account_holder text;

-- Social media (additional)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS tiktok text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS soundcloud text;

-- Profile type and manager data
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS profile_type text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_name text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_phone text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS manager_email text;

-- Distributors (array of distributor names and JSON for emails)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS distributors text[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS distributor_emails jsonb DEFAULT '{}'::jsonb;

-- Additional fields
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS observations text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS documents_url text;