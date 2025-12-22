-- =====================================================
-- CORREÇÃO ESPECÍFICA: CONTRATOS, AGENDA, FINANCEIRO
-- Execute no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- TABELA: contracts (Contratos)
-- =====================================================
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
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

-- =====================================================
-- TABELA: agenda_events (Agenda)
-- =====================================================
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS artist_id UUID;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_capacity INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_contact TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS expected_audience INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS ticket_price NUMERIC;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- TABELA: financial_transactions (Financeiro)
-- =====================================================
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
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

-- =====================================================
-- TABELA: services (Serviços) - se existir
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC,
    duration INTEGER,
    status TEXT DEFAULT 'active',
    artist_id UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HABILITAR RLS E CRIAR POLÍTICAS
-- =====================================================

-- contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_all_contracts ON contracts;
CREATE POLICY auth_all_contracts ON contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- agenda_events
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_all_agenda_events ON agenda_events;
CREATE POLICY auth_all_agenda_events ON agenda_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- financial_transactions
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_all_financial_transactions ON financial_transactions;
CREATE POLICY auth_all_financial_transactions ON financial_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_all_services ON services;
CREATE POLICY auth_all_services ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

SELECT 'Tabelas contracts, agenda_events, financial_transactions e services corrigidas!' as resultado;
