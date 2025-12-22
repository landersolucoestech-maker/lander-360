-- =====================================================
-- CORREÇÃO DE FOREIGN KEYS
-- Adiciona as relações entre tabelas
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Primeiro, vamos verificar e remover constraints antigas se existirem
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_artist_id_fkey;
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_contract_id_fkey;
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_project_id_fkey;
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_event_id_fkey;
ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_crm_contact_id_fkey;

ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_artist_id_fkey;
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_project_id_fkey;

ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_artist_id_fkey;
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_project_id_fkey;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_artist_id_fkey;

ALTER TABLE agenda_events DROP CONSTRAINT IF EXISTS agenda_events_artist_id_fkey;

ALTER TABLE music_registry DROP CONSTRAINT IF EXISTS music_registry_artist_id_fkey;
ALTER TABLE music_registry DROP CONSTRAINT IF EXISTS music_registry_project_id_fkey;

ALTER TABLE phonograms DROP CONSTRAINT IF EXISTS phonograms_artist_id_fkey;

ALTER TABLE marketing_campaigns DROP CONSTRAINT IF EXISTS marketing_campaigns_artist_id_fkey;

ALTER TABLE creative_ideas DROP CONSTRAINT IF EXISTS creative_ideas_artist_id_fkey;

-- =====================================================
-- ADICIONAR FOREIGN KEYS
-- =====================================================

-- financial_transactions
ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_contract_id_fkey 
FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;

ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES agenda_events(id) ON DELETE SET NULL;

ALTER TABLE financial_transactions 
ADD CONSTRAINT financial_transactions_crm_contact_id_fkey 
FOREIGN KEY (crm_contact_id) REFERENCES crm_contacts(id) ON DELETE SET NULL;

-- contracts
ALTER TABLE contracts 
ADD CONSTRAINT contracts_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

ALTER TABLE contracts 
ADD CONSTRAINT contracts_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- releases
ALTER TABLE releases 
ADD CONSTRAINT releases_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

ALTER TABLE releases 
ADD CONSTRAINT releases_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- projects
ALTER TABLE projects 
ADD CONSTRAINT projects_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- agenda_events
ALTER TABLE agenda_events 
ADD CONSTRAINT agenda_events_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- music_registry
ALTER TABLE music_registry 
ADD CONSTRAINT music_registry_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

ALTER TABLE music_registry 
ADD CONSTRAINT music_registry_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- phonograms
ALTER TABLE phonograms 
ADD CONSTRAINT phonograms_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- marketing_campaigns
ALTER TABLE marketing_campaigns 
ADD CONSTRAINT marketing_campaigns_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- creative_ideas
ALTER TABLE creative_ideas 
ADD CONSTRAINT creative_ideas_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

SELECT 'Foreign keys criadas com sucesso!' as resultado;
