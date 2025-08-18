-- Update contracts table with all requested fields
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('artista', 'empresa')),
ADD COLUMN IF NOT EXISTS service_type TEXT CHECK (service_type IN ('empresariamento', 'gestao', 'agenciamento', 'edicao', 'distribuicao', 'marketing', 'producao_musical', 'producao_audiovisual')),
ADD COLUMN IF NOT EXISTS involved_parties JSONB,
ADD COLUMN IF NOT EXISTS responsible_person TEXT,
ADD COLUMN IF NOT EXISTS registry_office BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS registry_date DATE,
ADD COLUMN IF NOT EXISTS fixed_value NUMERIC,
ADD COLUMN IF NOT EXISTS royalties_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS advance_payment NUMERIC,
ADD COLUMN IF NOT EXISTS attachments JSONB,
ADD COLUMN IF NOT EXISTS observations TEXT;

-- Update status constraint to include new values
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('pendente', 'assinado', 'expirado', 'rescindido', 'rascunho'));