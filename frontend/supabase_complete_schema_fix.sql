-- =====================================================
-- SCRIPT COMPLETO DE CORREÇÃO DE SCHEMA
-- Adiciona todas as colunas faltantes em todas as tabelas
-- Execute no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- TABELA: contracts
-- =====================================================
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS advance_amount NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contractor_contact TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS financial_support TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS fixed_value NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS generated_document_content TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS registry_office TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS responsible_person TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalties_percentage NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS royalty_rate NUMERIC;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signature_request_date TIMESTAMPTZ;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS value NUMERIC;

-- =====================================================
-- TABELA: releases
-- =====================================================
ALTER TABLE releases ADD COLUMN IF NOT EXISTS actual_release_date DATE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS copyright TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS distributors TEXT[];
ALTER TABLE releases ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS planned_release_date DATE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS release_type TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_expected NUMERIC;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_notes TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_received NUMERIC;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_share_applied NUMERIC;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS royalties_verified_at TIMESTAMPTZ;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned';
ALTER TABLE releases ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS tracks JSONB;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS upc TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS spotify_streams BIGINT DEFAULT 0;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS apple_music_streams BIGINT DEFAULT 0;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS deezer_streams BIGINT DEFAULT 0;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS youtube_views BIGINT DEFAULT 0;

-- =====================================================
-- TABELA: projects
-- =====================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS audio_files JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- =====================================================
-- TABELA: financial_transactions
-- =====================================================
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS authorized_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS contract_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS crm_contact_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS event_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS payment_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS responsible_by TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS type TEXT;

-- =====================================================
-- TABELA: agenda_events
-- =====================================================
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS expected_audience INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS ticket_price NUMERIC;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_capacity INTEGER;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_contact TEXT;
ALTER TABLE agenda_events ADD COLUMN IF NOT EXISTS venue_name TEXT;

-- =====================================================
-- TABELA: music_registry
-- =====================================================
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS abramus_code TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS ecad_code TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS genre_normalized TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS isrc TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS iswc TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS participants JSONB;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS publishers JSONB;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_expected NUMERIC;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_notes TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_received NUMERIC;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_share_applied NUMERIC;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS royalties_verified_at TIMESTAMPTZ;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE music_registry ADD COLUMN IF NOT EXISTS writers JSONB;

-- =====================================================
-- TABELA: phonograms
-- =====================================================
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS abramus_code TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS ecad_code TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS is_remix BOOLEAN DEFAULT FALSE;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS isrc TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS master_owner TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS participants JSONB;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS recording_date DATE;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS recording_location TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS recording_studio TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS remix_artist TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_expected NUMERIC;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_notes TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_received NUMERIC;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_share_applied NUMERIC;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS royalties_verified_at TIMESTAMPTZ;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS version_type TEXT;
ALTER TABLE phonograms ADD COLUMN IF NOT EXISTS work_id UUID;

-- =====================================================
-- TABELA: crm_contacts
-- =====================================================
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS artist_name TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS contact_type TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS interactions JSONB;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- =====================================================
-- TABELA: marketing_campaigns
-- =====================================================
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS budget NUMERIC;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS conversions INTEGER DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS cpc NUMERIC;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS ctr NUMERIC;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS roas NUMERIC;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS spent NUMERIC DEFAULT 0;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- =====================================================
-- TABELA: creative_ideas
-- =====================================================
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS additional_notes TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id);
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS content_format TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS engagement_strategies TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS execution_notes TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS feedback_notes TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS is_useful BOOLEAN;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS music_registry_id UUID;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS post_frequency TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS recommended_dates TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS release_id UUID;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS suggested_channel TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS tone TEXT;
ALTER TABLE creative_ideas ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- =====================================================
-- TABELA: inventory
-- =====================================================
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS entry_date DATE;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS purchase_location TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS responsible TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS unit_value NUMERIC;

-- =====================================================
-- TABELA: audit_logs
-- =====================================================
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS changes JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS table_name TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id UUID;

-- =====================================================
-- TABELA: login_history
-- =====================================================
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS device_info TEXT;
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS login_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS user_id UUID;

-- =====================================================
-- HABILITAR RLS E CRIAR POLÍTICAS PARA NOVAS TABELAS
-- =====================================================

-- Função para criar políticas padrão
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['contracts', 'releases', 'projects', 'financial_transactions', 
                           'agenda_events', 'music_registry', 'phonograms', 'crm_contacts',
                           'marketing_campaigns', 'creative_ideas', 'inventory', 'audit_logs', 
                           'login_history'];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        -- Habilitar RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- Criar política de SELECT
        BEGIN
            EXECUTE format('CREATE POLICY "auth_read_%s" ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        
        -- Criar política de INSERT
        BEGIN
            EXECUTE format('CREATE POLICY "auth_insert_%s" ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        
        -- Criar política de UPDATE
        BEGIN
            EXECUTE format('CREATE POLICY "auth_update_%s" ON %I FOR UPDATE TO authenticated USING (true)', tbl, tbl);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        
        -- Criar política de DELETE
        BEGIN
            EXECUTE format('CREATE POLICY "auth_delete_%s" ON %I FOR DELETE TO authenticated USING (true)', tbl, tbl);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END LOOP;
END $$;

-- =====================================================
-- NOTIFICAR POSTGREST PARA RECARREGAR SCHEMA
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
SELECT 'Script executado com sucesso!' as resultado;
