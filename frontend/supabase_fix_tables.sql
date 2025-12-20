-- =====================================================
-- CORREÇÃO DAS TABELAS - Adicionar colunas faltantes
-- Execute no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: TABELA ARTISTS - Colunas faltantes
-- =====================================================

ALTER TABLE artists ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS documents_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS contract_status TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS profile_type TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_types TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS soundcloud TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS spotify_id TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS apple_music_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS deezer_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS distributors TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS distributor_emails JSONB;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS record_label_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS label_contact_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS label_contact_email TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS label_contact_phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS manager_email TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS manager_phone TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 2: TABELA CONTRACTS - Colunas faltantes
-- =====================================================

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signature_request_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_office BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS fixed_value DECIMAL(12,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(12,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS financial_support DECIMAL(12,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalty_rate DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalties_percentage DECIMAL(5,2);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS generated_document_content TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_contact TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 3: TABELA RELEASES - Colunas faltantes
-- =====================================================

ALTER TABLE releases ADD COLUMN IF NOT EXISTS upc TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS isrc TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS subgenre TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS spotify_uri TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS apple_music_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS deezer_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS distributor TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS distribution_status TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS streaming_metrics JSONB;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 4: TABELA MUSIC_REGISTRY - Colunas faltantes
-- =====================================================

ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS writers TEXT[];
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS producers TEXT[];
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS performers TEXT[];
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS publishers TEXT[];
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS subgenre TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS key_signature TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS iswc TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS ecad_code TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS upc TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS registration_date DATE;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS copyright_status TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS rights_holders JSONB;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS split_sheet JSONB;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS audio_analysis JSONB;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS fingerprint_id TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS fingerprint_status TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 5: TABELA FINANCIAL_TRANSACTIONS - Colunas faltantes
-- =====================================================

ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS responsible_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS authorized_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES agenda_events(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS crm_contact_id UUID REFERENCES crm_contacts(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 6: TABELA AGENDA_EVENTS - Colunas faltantes
-- =====================================================

ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_capacity INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_contact TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS expected_audience INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(12,2);
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 7: TABELA CRM_CONTACTS - Colunas faltantes
-- =====================================================

ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS interactions JSONB;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 8: TABELA PROFILES - Colunas faltantes
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';

-- =====================================================
-- PARTE 9: TABELA MARKETING_CAMPAIGNS - Colunas faltantes
-- =====================================================

ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS target_audience JSONB;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS goals JSONB;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS channels TEXT[];
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS kpis JSONB;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS results JSONB;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 10: TABELAS FALTANTES
-- =====================================================

-- Tabela de parcelas de transações
CREATE TABLE IF NOT EXISTS transaction_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES financial_transactions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  paid_date DATE,
  paid_amount DECIMAL(12,2),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de regras de categorização
CREATE TABLE IF NOT EXISTS financial_categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  pattern TEXT NOT NULL,
  pattern_type TEXT DEFAULT 'contains',
  category TEXT NOT NULL,
  subcategory TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de execução de automação
CREATE TABLE IF NOT EXISTS automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pending_email_changes
CREATE TABLE IF NOT EXISTS pending_email_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de projeto artistas (relação N:N)
CREATE TABLE IF NOT EXISTS project_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, artist_id)
);

-- =====================================================
-- PARTE 11: TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE
-- =====================================================

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PARTE 12: ÍNDICES ADICIONAIS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contracts_template_id ON contracts(template_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_contract_id ON financial_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_event_id ON financial_transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_music_registry_fingerprint_id ON music_registry(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_pending_email_changes_token ON pending_email_changes(token);
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_automation_id ON automation_execution_logs(automation_id);

-- =====================================================
-- PARTE 13: ATUALIZAR RLS POLICIES
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE transaction_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categorization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_email_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_artists ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para tabelas novas
CREATE POLICY IF NOT EXISTS "Authenticated can manage transaction_installments" ON transaction_installments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated can manage financial_categorization_rules" ON financial_categorization_rules
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Authenticated can manage automation_execution_logs" ON automation_execution_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can view own pending_email_changes" ON pending_email_changes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Authenticated can manage project_artists" ON project_artists
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- FIM DAS CORREÇÕES
-- =====================================================
