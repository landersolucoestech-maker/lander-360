-- =====================================================
-- CORREÇÃO FINAL: TABELA CONTRACTS
-- Garante que todas as colunas existem com tipos corretos
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Remover e recriar coluna registry_office como TEXT
ALTER TABLE contracts DROP COLUMN IF EXISTS registry_office;
ALTER TABLE contracts ADD COLUMN registry_office TEXT;

-- Garantir todas as outras colunas
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS artist_id UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS value NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS fixed_value NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS advance_amount NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalty_rate NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalties_percentage NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signature_request_date TIMESTAMPTZ;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS generated_document_content TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_contact TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS financial_support TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_all_contracts ON contracts;
CREATE POLICY auth_all_contracts ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Foreign key
DO $$
BEGIN
    ALTER TABLE contracts ADD CONSTRAINT fk_contracts_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

-- Verificar estrutura
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contracts' ORDER BY ordinal_position;
