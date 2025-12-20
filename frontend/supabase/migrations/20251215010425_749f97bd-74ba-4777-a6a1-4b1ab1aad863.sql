
-- Create a separate table for sensitive artist financial/identity data
CREATE TABLE public.artist_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL UNIQUE REFERENCES public.artists(id) ON DELETE CASCADE,
  cpf_cnpj text,
  rg text,
  full_address text,
  bank text,
  agency text,
  account text,
  pix_key text,
  account_holder text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policies - ONLY admin and financeiro can access
CREATE POLICY "Only admin can view sensitive artist data"
ON public.artist_sensitive_data
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can insert sensitive artist data"
ON public.artist_sensitive_data
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can update sensitive artist data"
ON public.artist_sensitive_data
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admin can delete sensitive artist data"
ON public.artist_sensitive_data
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add financeiro role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'financeiro' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
    ALTER TYPE app_role ADD VALUE 'financeiro';
  END IF;
END $$;

-- Create function to check if user has admin or financeiro role for sensitive data
CREATE OR REPLACE FUNCTION public.has_sensitive_data_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'financeiro')
  )
$$;

-- Add additional policy for financeiro role
CREATE POLICY "Financeiro can view sensitive artist data"
ON public.artist_sensitive_data
FOR SELECT
USING (has_role(auth.uid(), 'financeiro'::app_role));

-- Migrate existing sensitive data from artists table to new table
INSERT INTO public.artist_sensitive_data (artist_id, cpf_cnpj, rg, full_address, bank, agency, account, pix_key, account_holder)
SELECT id, cpf_cnpj, rg, full_address, bank, agency, account, pix_key, account_holder
FROM public.artists
WHERE cpf_cnpj IS NOT NULL 
   OR rg IS NOT NULL 
   OR full_address IS NOT NULL 
   OR bank IS NOT NULL;

-- Create updated_at trigger for new table
CREATE TRIGGER update_artist_sensitive_data_updated_at
BEFORE UPDATE ON public.artist_sensitive_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_artist_sensitive_data_artist_id ON public.artist_sensitive_data(artist_id);
