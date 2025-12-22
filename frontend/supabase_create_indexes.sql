-- =====================================================
-- ÍNDICES DE PERFORMANCE - LANDER 360
-- Versão ULTRA-SEGURA - cria índices apenas se coluna existir
-- =====================================================

-- Função helper para criar índice de forma segura
CREATE OR REPLACE FUNCTION create_index_if_column_exists(
    p_index_name TEXT,
    p_table_name TEXT,
    p_column_name TEXT,
    p_desc BOOLEAN DEFAULT FALSE
) RETURNS VOID AS $$
DECLARE
    v_sql TEXT;
BEGIN
    -- Verifica se a coluna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name 
        AND column_name = p_column_name
    ) THEN
        -- Monta o SQL do índice
        IF p_desc THEN
            v_sql := format('CREATE INDEX IF NOT EXISTS %I ON %I(%I DESC)', 
                           p_index_name, p_table_name, p_column_name);
        ELSE
            v_sql := format('CREATE INDEX IF NOT EXISTS %I ON %I(%I)', 
                           p_index_name, p_table_name, p_column_name);
        END IF;
        
        EXECUTE v_sql;
        RAISE NOTICE 'Índice % criado com sucesso', p_index_name;
    ELSE
        RAISE NOTICE 'Coluna %.% não existe - índice % ignorado', 
                     p_table_name, p_column_name, p_index_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CRIAR ÍNDICES DE FORMA SEGURA
-- =====================================================

-- financial_transactions
SELECT create_index_if_column_exists('idx_fin_trans_date', 'financial_transactions', 'date', true);
SELECT create_index_if_column_exists('idx_fin_trans_created', 'financial_transactions', 'created_at', true);
SELECT create_index_if_column_exists('idx_fin_trans_artist', 'financial_transactions', 'artist_id', false);
SELECT create_index_if_column_exists('idx_fin_trans_status', 'financial_transactions', 'status', false);
SELECT create_index_if_column_exists('idx_fin_trans_type', 'financial_transactions', 'type', false);
SELECT create_index_if_column_exists('idx_fin_trans_category', 'financial_transactions', 'category', false);

-- releases
SELECT create_index_if_column_exists('idx_releases_artist', 'releases', 'artist_id', false);
SELECT create_index_if_column_exists('idx_releases_date', 'releases', 'release_date', true);
SELECT create_index_if_column_exists('idx_releases_status', 'releases', 'status', false);
SELECT create_index_if_column_exists('idx_releases_created', 'releases', 'created_at', true);

-- contracts
SELECT create_index_if_column_exists('idx_contracts_artist', 'contracts', 'artist_id', false);
SELECT create_index_if_column_exists('idx_contracts_status', 'contracts', 'status', false);
SELECT create_index_if_column_exists('idx_contracts_created', 'contracts', 'created_at', true);

-- artists
SELECT create_index_if_column_exists('idx_artists_name', 'artists', 'name', false);
SELECT create_index_if_column_exists('idx_artists_created', 'artists', 'created_at', true);

-- projects
SELECT create_index_if_column_exists('idx_projects_artist', 'projects', 'artist_id', false);
SELECT create_index_if_column_exists('idx_projects_status', 'projects', 'status', false);
SELECT create_index_if_column_exists('idx_projects_created', 'projects', 'created_at', true);

-- agenda_events
SELECT create_index_if_column_exists('idx_events_date', 'agenda_events', 'start_date', true);
SELECT create_index_if_column_exists('idx_events_artist', 'agenda_events', 'artist_id', false);
SELECT create_index_if_column_exists('idx_events_status', 'agenda_events', 'status', false);

-- audit_logs
SELECT create_index_if_column_exists('idx_audit_user', 'audit_logs', 'user_id', false);
SELECT create_index_if_column_exists('idx_audit_created', 'audit_logs', 'created_at', true);
SELECT create_index_if_column_exists('idx_audit_action', 'audit_logs', 'action', false);

-- music_registry
SELECT create_index_if_column_exists('idx_music_artist', 'music_registry', 'artist_id', false);
SELECT create_index_if_column_exists('idx_music_title', 'music_registry', 'title', false);
SELECT create_index_if_column_exists('idx_music_created', 'music_registry', 'created_at', true);

-- user_roles
SELECT create_index_if_column_exists('idx_user_roles_user', 'user_roles', 'user_id', false);
SELECT create_index_if_column_exists('idx_user_roles_role', 'user_roles', 'role', false);

-- profiles
SELECT create_index_if_column_exists('idx_profiles_email', 'profiles', 'email', false);

-- login_history
SELECT create_index_if_column_exists('idx_login_user', 'login_history', 'user_id', false);
SELECT create_index_if_column_exists('idx_login_at', 'login_history', 'login_at', true);

-- crm_contacts
SELECT create_index_if_column_exists('idx_crm_status', 'crm_contacts', 'status', false);
SELECT create_index_if_column_exists('idx_crm_created', 'crm_contacts', 'created_at', true);

-- marketing_campaigns
SELECT create_index_if_column_exists('idx_mkt_artist', 'marketing_campaigns', 'artist_id', false);
SELECT create_index_if_column_exists('idx_mkt_status', 'marketing_campaigns', 'status', false);

-- creative_ideas
SELECT create_index_if_column_exists('idx_ideas_artist', 'creative_ideas', 'artist_id', false);
SELECT create_index_if_column_exists('idx_ideas_status', 'creative_ideas', 'status', false);

-- landerzap_conversations
SELECT create_index_if_column_exists('idx_conv_contact', 'landerzap_conversations', 'contact_id', false);
SELECT create_index_if_column_exists('idx_conv_last_msg', 'landerzap_conversations', 'last_message_at', true);

-- landerzap_messages
SELECT create_index_if_column_exists('idx_msg_conv', 'landerzap_messages', 'conversation_id', false);
SELECT create_index_if_column_exists('idx_msg_sent', 'landerzap_messages', 'sent_at', true);

-- inventory
SELECT create_index_if_column_exists('idx_inv_category', 'inventory', 'category', false);
SELECT create_index_if_column_exists('idx_inv_status', 'inventory', 'status', false);

-- =====================================================
-- LIMPAR FUNÇÃO TEMPORÁRIA
-- =====================================================
DROP FUNCTION IF EXISTS create_index_if_column_exists;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
