-- =====================================================
-- SCRIPT DE CORREÇÃO DE SCHEMA - PARTE 2
-- Habilita RLS e cria políticas
-- Execute APÓS a Parte 1
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE phonograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Políticas para contracts
DROP POLICY IF EXISTS auth_read_contracts ON contracts;
DROP POLICY IF EXISTS auth_insert_contracts ON contracts;
DROP POLICY IF EXISTS auth_update_contracts ON contracts;
DROP POLICY IF EXISTS auth_delete_contracts ON contracts;
CREATE POLICY auth_read_contracts ON contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_contracts ON contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_contracts ON contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_contracts ON contracts FOR DELETE TO authenticated USING (true);

-- Políticas para releases
DROP POLICY IF EXISTS auth_read_releases ON releases;
DROP POLICY IF EXISTS auth_insert_releases ON releases;
DROP POLICY IF EXISTS auth_update_releases ON releases;
DROP POLICY IF EXISTS auth_delete_releases ON releases;
CREATE POLICY auth_read_releases ON releases FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_releases ON releases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_releases ON releases FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_releases ON releases FOR DELETE TO authenticated USING (true);

-- Políticas para projects
DROP POLICY IF EXISTS auth_read_projects ON projects;
DROP POLICY IF EXISTS auth_insert_projects ON projects;
DROP POLICY IF EXISTS auth_update_projects ON projects;
DROP POLICY IF EXISTS auth_delete_projects ON projects;
CREATE POLICY auth_read_projects ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_projects ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_projects ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_projects ON projects FOR DELETE TO authenticated USING (true);

-- Políticas para financial_transactions
DROP POLICY IF EXISTS auth_read_financial_transactions ON financial_transactions;
DROP POLICY IF EXISTS auth_insert_financial_transactions ON financial_transactions;
DROP POLICY IF EXISTS auth_update_financial_transactions ON financial_transactions;
DROP POLICY IF EXISTS auth_delete_financial_transactions ON financial_transactions;
CREATE POLICY auth_read_financial_transactions ON financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_financial_transactions ON financial_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_financial_transactions ON financial_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_financial_transactions ON financial_transactions FOR DELETE TO authenticated USING (true);

-- Políticas para agenda_events
DROP POLICY IF EXISTS auth_read_agenda_events ON agenda_events;
DROP POLICY IF EXISTS auth_insert_agenda_events ON agenda_events;
DROP POLICY IF EXISTS auth_update_agenda_events ON agenda_events;
DROP POLICY IF EXISTS auth_delete_agenda_events ON agenda_events;
CREATE POLICY auth_read_agenda_events ON agenda_events FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_agenda_events ON agenda_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_agenda_events ON agenda_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_agenda_events ON agenda_events FOR DELETE TO authenticated USING (true);

-- Políticas para music_registry
DROP POLICY IF EXISTS auth_read_music_registry ON music_registry;
DROP POLICY IF EXISTS auth_insert_music_registry ON music_registry;
DROP POLICY IF EXISTS auth_update_music_registry ON music_registry;
DROP POLICY IF EXISTS auth_delete_music_registry ON music_registry;
CREATE POLICY auth_read_music_registry ON music_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_music_registry ON music_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_music_registry ON music_registry FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_music_registry ON music_registry FOR DELETE TO authenticated USING (true);

-- Políticas para phonograms
DROP POLICY IF EXISTS auth_read_phonograms ON phonograms;
DROP POLICY IF EXISTS auth_insert_phonograms ON phonograms;
DROP POLICY IF EXISTS auth_update_phonograms ON phonograms;
DROP POLICY IF EXISTS auth_delete_phonograms ON phonograms;
CREATE POLICY auth_read_phonograms ON phonograms FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_phonograms ON phonograms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_phonograms ON phonograms FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_phonograms ON phonograms FOR DELETE TO authenticated USING (true);

-- Políticas para crm_contacts
DROP POLICY IF EXISTS auth_read_crm_contacts ON crm_contacts;
DROP POLICY IF EXISTS auth_insert_crm_contacts ON crm_contacts;
DROP POLICY IF EXISTS auth_update_crm_contacts ON crm_contacts;
DROP POLICY IF EXISTS auth_delete_crm_contacts ON crm_contacts;
CREATE POLICY auth_read_crm_contacts ON crm_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_crm_contacts ON crm_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_crm_contacts ON crm_contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_crm_contacts ON crm_contacts FOR DELETE TO authenticated USING (true);

-- Políticas para marketing_campaigns
DROP POLICY IF EXISTS auth_read_marketing_campaigns ON marketing_campaigns;
DROP POLICY IF EXISTS auth_insert_marketing_campaigns ON marketing_campaigns;
DROP POLICY IF EXISTS auth_update_marketing_campaigns ON marketing_campaigns;
DROP POLICY IF EXISTS auth_delete_marketing_campaigns ON marketing_campaigns;
CREATE POLICY auth_read_marketing_campaigns ON marketing_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_marketing_campaigns ON marketing_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_marketing_campaigns ON marketing_campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_marketing_campaigns ON marketing_campaigns FOR DELETE TO authenticated USING (true);

-- Políticas para creative_ideas
DROP POLICY IF EXISTS auth_read_creative_ideas ON creative_ideas;
DROP POLICY IF EXISTS auth_insert_creative_ideas ON creative_ideas;
DROP POLICY IF EXISTS auth_update_creative_ideas ON creative_ideas;
DROP POLICY IF EXISTS auth_delete_creative_ideas ON creative_ideas;
CREATE POLICY auth_read_creative_ideas ON creative_ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_creative_ideas ON creative_ideas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_creative_ideas ON creative_ideas FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_creative_ideas ON creative_ideas FOR DELETE TO authenticated USING (true);

-- Políticas para inventory
DROP POLICY IF EXISTS auth_read_inventory ON inventory;
DROP POLICY IF EXISTS auth_insert_inventory ON inventory;
DROP POLICY IF EXISTS auth_update_inventory ON inventory;
DROP POLICY IF EXISTS auth_delete_inventory ON inventory;
CREATE POLICY auth_read_inventory ON inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_inventory ON inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY auth_update_inventory ON inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY auth_delete_inventory ON inventory FOR DELETE TO authenticated USING (true);

-- Políticas para audit_logs
DROP POLICY IF EXISTS auth_read_audit_logs ON audit_logs;
DROP POLICY IF EXISTS auth_insert_audit_logs ON audit_logs;
CREATE POLICY auth_read_audit_logs ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_audit_logs ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para login_history
DROP POLICY IF EXISTS auth_read_login_history ON login_history;
DROP POLICY IF EXISTS auth_insert_login_history ON login_history;
CREATE POLICY auth_read_login_history ON login_history FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_insert_login_history ON login_history FOR INSERT TO authenticated WITH CHECK (true);

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

SELECT 'Parte 2 executada com sucesso - RLS e políticas configuradas!' as resultado;
