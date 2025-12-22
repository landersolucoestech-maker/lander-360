-- PARTE 1: CRIAR POLICIES PARA TABELAS SEM POLICIES
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contributors') THEN
  CREATE POLICY contributors_all ON public.contributors FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'distributions') THEN
  CREATE POLICY distributions_all ON public.distributions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_function_logs') THEN
  CREATE POLICY edge_function_logs_deny ON public.edge_function_logs FOR ALL USING (false);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_function_permissions') THEN
  CREATE POLICY edge_function_permissions_all ON public.edge_function_permissions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_functions') THEN
  CREATE POLICY edge_functions_all ON public.edge_functions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_otp_codes') THEN
  CREATE POLICY email_otp_codes_deny ON public.email_otp_codes FOR ALL USING (false);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'genre_reference') THEN
  CREATE POLICY genre_reference_read ON public.genre_reference FOR SELECT TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'influencers') THEN
  CREATE POLICY influencers_all ON public.influencers FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory') THEN
  CREATE POLICY inventory_all ON public.inventory FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
  CREATE POLICY invoices_all ON public.invoices FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_permissions') THEN
  CREATE POLICY module_permissions_all ON public.module_permissions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
  CREATE POLICY notifications_all ON public.notifications FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_email_changes') THEN
  CREATE POLICY pending_email_changes_deny ON public.pending_email_changes FOR ALL USING (false);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pending_shares') THEN
  CREATE POLICY pending_shares_all ON public.pending_shares FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
  CREATE POLICY projects_all ON public.projects FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'scheduled_notifications') THEN
  CREATE POLICY scheduled_notifications_all ON public.scheduled_notifications FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sectors') THEN
  CREATE POLICY sectors_read ON public.sectors FOR SELECT TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'security_audit_logs') THEN
  CREATE POLICY security_audit_logs_deny ON public.security_audit_logs FOR ALL USING (false);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'services') THEN
  CREATE POLICY services_all ON public.services FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_modules') THEN
  CREATE POLICY system_modules_all ON public.system_modules FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_access_scopes') THEN
  CREATE POLICY user_access_scopes_all ON public.user_access_scopes FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_module_permissions') THEN
  CREATE POLICY user_module_permissions_all ON public.user_module_permissions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
  CREATE POLICY user_sessions_deny ON public.user_sessions FOR ALL USING (false);
END IF; END $$;

-- PARTE 2: CRIAR ÍNDICES PARA FOREIGN KEYS
CREATE INDEX IF NOT EXISTS idx_automation_execution_logs_automation_id ON public.automation_execution_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_compositions_track_id ON public.compositions(track_id);
CREATE INDEX IF NOT EXISTS idx_contributors_track_id ON public.contributors(track_id);
CREATE INDEX IF NOT EXISTS idx_ecad_divergences_ecad_report_item_id ON public.ecad_divergences(ecad_report_item_id);
CREATE INDEX IF NOT EXISTS idx_ecad_divergences_music_registry_id ON public.ecad_divergences(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_ecad_report_items_ecad_report_id ON public.ecad_report_items(ecad_report_id);
CREATE INDEX IF NOT EXISTS idx_ecad_report_items_music_registry_id ON public.ecad_report_items(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_contract_id ON public.financial_transactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_crm_contact_id ON public.financial_transactions(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_event_id ON public.financial_transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_music_registry_project_id ON public.music_registry(project_id);
CREATE INDEX IF NOT EXISTS idx_phonograms_music_registry_id ON public.phonograms(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_project_artists_artist_id ON public.project_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_projects_artist_id ON public.projects(artist_id);
CREATE INDEX IF NOT EXISTS idx_radio_tv_detections_music_registry_id ON public.radio_tv_detections(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_radio_tv_detections_phonogram_id ON public.radio_tv_detections(phonogram_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_royalty_distrokid_report_id ON public.royalty_distrokid(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_details_commissions_report_id ON public.royalty_onerpm_details_commissions(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_details_masters_report_id ON public.royalty_onerpm_details_masters(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_details_publishing_report_id ON public.royalty_onerpm_details_publishing(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_details_share_report_id ON public.royalty_onerpm_details_share(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_details_youtube_report_id ON public.royalty_onerpm_details_youtube(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_statement_report_id ON public.royalty_onerpm_statement(report_id);
CREATE INDEX IF NOT EXISTS idx_royalty_onerpm_summary_report_id ON public.royalty_onerpm_summary(report_id);
CREATE INDEX IF NOT EXISTS idx_sync_licenses_music_registry_id ON public.sync_licenses(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_takedowns_music_registry_id ON public.takedowns(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_transaction_installments_transaction_id ON public.transaction_installments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_module_permissions_module_id ON public.user_module_permissions(module_id);
