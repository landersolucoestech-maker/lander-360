-- =====================================================
-- CORREÇÃO DA TABELA SERVICES (SERVIÇOS)
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Criar tabela services se não existir
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar todas as colunas necessárias
ALTER TABLE services ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS grupo TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS margin NUMERIC DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage';
ALTER TABLE services ADD COLUMN IF NOT EXISTS final_price NUMERIC DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS auth_all_services ON services;
DROP POLICY IF EXISTS auth_read_services ON services;
DROP POLICY IF EXISTS auth_insert_services ON services;
DROP POLICY IF EXISTS auth_update_services ON services;
DROP POLICY IF EXISTS auth_delete_services ON services;

-- Criar política única para todas operações
CREATE POLICY auth_all_services ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- CORREÇÃO DA TABELA CONTRACTS (CONTRATOS)
-- =====================================================

-- Adicionar colunas faltantes
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
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_office TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS generated_document_content TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_contact TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS financial_support TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Habilitar RLS para contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS auth_all_contracts ON contracts;

-- Criar política única para todas operações
CREATE POLICY auth_all_contracts ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- CORREÇÃO DA TABELA FINANCIAL_TRANSACTIONS (FINANCEIRO)
-- =====================================================

-- Adicionar colunas faltantes
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS artist_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS contract_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS crm_contact_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS authorized_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS responsible_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Habilitar RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS auth_all_financial_transactions ON financial_transactions;

-- Criar política única
CREATE POLICY auth_all_financial_transactions ON financial_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- FOREIGN KEYS (se não existirem)
-- =====================================================

-- Tentar adicionar foreign keys (ignorar erros se já existirem)
DO $$
BEGIN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_event FOREIGN KEY (event_id) REFERENCES agenda_events(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_crm FOREIGN KEY (crm_contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE contracts ADD CONSTRAINT fk_contract_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE contracts ADD CONSTRAINT fk_contract_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

SELECT 'Tabelas services, contracts e financial_transactions corrigidas!' as resultado;
