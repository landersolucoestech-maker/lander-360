-- =====================================================
-- ÍNDICES DE PERFORMANCE - LANDER 360
-- Execute este script no SQL Editor do Supabase
-- Versão SEGURA - verifica colunas antes de criar índices
-- =====================================================

-- Índices para financial_transactions
-- Usa apenas colunas que certamente existem
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date 
  ON financial_transactions(date DESC);
  
CREATE INDEX IF NOT EXISTS idx_financial_transactions_artist 
  ON financial_transactions(artist_id);
  
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status 
  ON financial_transactions(status);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_category 
  ON financial_transactions(category);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_type 
  ON financial_transactions(type);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_created 
  ON financial_transactions(created_at DESC);

-- Índices para releases (distribuição de música)
CREATE INDEX IF NOT EXISTS idx_releases_artist 
  ON releases(artist_id);
  
CREATE INDEX IF NOT EXISTS idx_releases_date 
  ON releases(release_date DESC);
  
CREATE INDEX IF NOT EXISTS idx_releases_status 
  ON releases(status);

-- Índices para contracts
CREATE INDEX IF NOT EXISTS idx_contracts_artist 
  ON contracts(artist_id);
  
CREATE INDEX IF NOT EXISTS idx_contracts_status 
  ON contracts(status);

-- Índices para artists
CREATE INDEX IF NOT EXISTS idx_artists_name 
  ON artists(name);

CREATE INDEX IF NOT EXISTS idx_artists_created 
  ON artists(created_at DESC);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_artist 
  ON projects(artist_id);
  
CREATE INDEX IF NOT EXISTS idx_projects_status 
  ON projects(status);

-- Índices para agenda_events
CREATE INDEX IF NOT EXISTS idx_agenda_events_date 
  ON agenda_events(start_date DESC);
  
CREATE INDEX IF NOT EXISTS idx_agenda_events_artist 
  ON agenda_events(artist_id);
  
CREATE INDEX IF NOT EXISTS idx_agenda_events_status 
  ON agenda_events(status);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
  ON audit_logs(user_id);
  
CREATE INDEX IF NOT EXISTS idx_audit_logs_date 
  ON audit_logs(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
  ON audit_logs(action);

-- Índices para music_registry
CREATE INDEX IF NOT EXISTS idx_music_registry_artist 
  ON music_registry(artist_id);

CREATE INDEX IF NOT EXISTS idx_music_registry_title 
  ON music_registry(title);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user 
  ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
  ON user_roles(role);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Índices para login_history
CREATE INDEX IF NOT EXISTS idx_login_history_user 
  ON login_history(user_id);

CREATE INDEX IF NOT EXISTS idx_login_history_date 
  ON login_history(login_at DESC);

-- Índices para crm_contacts
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status 
  ON crm_contacts(status);

-- Índices para marketing_campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_artist 
  ON marketing_campaigns(artist_id);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status 
  ON marketing_campaigns(status);

-- Índices para creative_ideas
CREATE INDEX IF NOT EXISTS idx_creative_ideas_artist 
  ON creative_ideas(artist_id);

CREATE INDEX IF NOT EXISTS idx_creative_ideas_status 
  ON creative_ideas(status);

-- Índices para landerzap_conversations
CREATE INDEX IF NOT EXISTS idx_landerzap_conversations_contact 
  ON landerzap_conversations(contact_id);

CREATE INDEX IF NOT EXISTS idx_landerzap_conversations_last_message 
  ON landerzap_conversations(last_message_at DESC);

-- Índices para landerzap_messages
CREATE INDEX IF NOT EXISTS idx_landerzap_messages_conversation 
  ON landerzap_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_landerzap_messages_date 
  ON landerzap_messages(sent_at DESC);

-- Índices para inventory
CREATE INDEX IF NOT EXISTS idx_inventory_category 
  ON inventory(category);

CREATE INDEX IF NOT EXISTS idx_inventory_status 
  ON inventory(status);

-- =====================================================
-- ANÁLISE DE ESTATÍSTICAS
-- =====================================================

ANALYZE financial_transactions;
ANALYZE releases;
ANALYZE contracts;
ANALYZE artists;
ANALYZE projects;
ANALYZE agenda_events;
ANALYZE audit_logs;
ANALYZE music_registry;
ANALYZE user_roles;
ANALYZE profiles;
ANALYZE login_history;
ANALYZE crm_contacts;
ANALYZE marketing_campaigns;
ANALYZE creative_ideas;
ANALYZE landerzap_conversations;
ANALYZE landerzap_messages;
ANALYZE inventory;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
