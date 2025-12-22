-- PARTE 1: REMOVER ÍNDICES DUPLICADOS
DROP INDEX IF EXISTS idx_events_artist;
DROP INDEX IF EXISTS idx_audit_user;
DROP INDEX IF EXISTS idx_contracts_artist;
DROP INDEX IF EXISTS idx_ideas_artist;
DROP INDEX IF EXISTS idx_fin_trans_artist;
DROP INDEX IF EXISTS idx_conv_last_msg;
DROP INDEX IF EXISTS idx_msg_conv;
DROP INDEX IF EXISTS idx_login_user;
DROP INDEX IF EXISTS idx_mkt_artist;
DROP INDEX IF EXISTS idx_music_artist;
DROP INDEX IF EXISTS idx_releases_artist;
DROP INDEX IF EXISTS idx_user_artists_user_artist;

-- PARTE 2: REMOVER POLICIES DUPLICADAS
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE schemaname = 'public' 
    AND (
      policyname LIKE '%_artist_id_%'
      OR policyname LIKE 'auth_%'
      OR policyname LIKE '%_artist'
      OR policyname LIKE '%_own'
      OR policyname LIKE '%_owner'
      OR policyname LIKE 'deny_all_%'
      OR policyname LIKE 'admins_only_%'
      OR policyname LIKE '%_admin_all'
      OR policyname LIKE '%_authenticated'
      OR policyname = 'user_roles_all'
      OR policyname = 'user_roles_select'
    )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Remover policies com espacos
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename FROM pg_policies 
    WHERE schemaname = 'public' 
    AND policyname LIKE '% %'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- PARTE 3: CRIAR POLICIES OTIMIZADAS
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
  DROP POLICY IF EXISTS profiles_all ON public.profiles;
  CREATE POLICY profiles_all ON public.profiles FOR ALL TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agenda_events') THEN
  DROP POLICY IF EXISTS agenda_events_all ON public.agenda_events;
  CREATE POLICY agenda_events_all ON public.agenda_events FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artist_career_diagnostics') THEN
  DROP POLICY IF EXISTS artist_career_diagnostics_all ON public.artist_career_diagnostics;
  CREATE POLICY artist_career_diagnostics_all ON public.artist_career_diagnostics FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artist_goals') THEN
  DROP POLICY IF EXISTS artist_goals_all ON public.artist_goals;
  CREATE POLICY artist_goals_all ON public.artist_goals FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artist_sensitive_data') THEN
  DROP POLICY IF EXISTS artist_sensitive_data_all ON public.artist_sensitive_data;
  CREATE POLICY artist_sensitive_data_all ON public.artist_sensitive_data FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artists') THEN
  DROP POLICY IF EXISTS artists_all ON public.artists;
  CREATE POLICY artists_all ON public.artists FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
  DROP POLICY IF EXISTS audit_logs_all ON public.audit_logs;
  CREATE POLICY audit_logs_all ON public.audit_logs FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'automations') THEN
  DROP POLICY IF EXISTS automations_all ON public.automations;
  CREATE POLICY automations_all ON public.automations FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contracts') THEN
  DROP POLICY IF EXISTS contracts_all ON public.contracts;
  CREATE POLICY contracts_all ON public.contracts FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'creative_ai_chats') THEN
  DROP POLICY IF EXISTS creative_ai_chats_all ON public.creative_ai_chats;
  CREATE POLICY creative_ai_chats_all ON public.creative_ai_chats FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'creative_ideas') THEN
  DROP POLICY IF EXISTS creative_ideas_all ON public.creative_ideas;
  CREATE POLICY creative_ideas_all ON public.creative_ideas FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crm_contacts') THEN
  DROP POLICY IF EXISTS crm_contacts_all ON public.crm_contacts;
  CREATE POLICY crm_contacts_all ON public.crm_contacts FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ecad_divergences') THEN
  DROP POLICY IF EXISTS ecad_divergences_all ON public.ecad_divergences;
  CREATE POLICY ecad_divergences_all ON public.ecad_divergences FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_transactions') THEN
  DROP POLICY IF EXISTS financial_transactions_all ON public.financial_transactions;
  CREATE POLICY financial_transactions_all ON public.financial_transactions FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landerzap_messages') THEN
  DROP POLICY IF EXISTS landerzap_messages_all ON public.landerzap_messages;
  CREATE POLICY landerzap_messages_all ON public.landerzap_messages FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'login_history') THEN
  DROP POLICY IF EXISTS login_history_all ON public.login_history;
  CREATE POLICY login_history_all ON public.login_history FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketing_briefings') THEN
  DROP POLICY IF EXISTS marketing_briefings_all ON public.marketing_briefings;
  CREATE POLICY marketing_briefings_all ON public.marketing_briefings FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketing_campaigns') THEN
  DROP POLICY IF EXISTS marketing_campaigns_all ON public.marketing_campaigns;
  CREATE POLICY marketing_campaigns_all ON public.marketing_campaigns FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketing_contents') THEN
  DROP POLICY IF EXISTS marketing_contents_all ON public.marketing_contents;
  CREATE POLICY marketing_contents_all ON public.marketing_contents FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketing_tasks') THEN
  DROP POLICY IF EXISTS marketing_tasks_all ON public.marketing_tasks;
  CREATE POLICY marketing_tasks_all ON public.marketing_tasks FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'music_registry') THEN
  DROP POLICY IF EXISTS music_registry_all ON public.music_registry;
  CREATE POLICY music_registry_all ON public.music_registry FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'paid_campaigns') THEN
  DROP POLICY IF EXISTS paid_campaigns_all ON public.paid_campaigns;
  CREATE POLICY paid_campaigns_all ON public.paid_campaigns FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'phonograms') THEN
  DROP POLICY IF EXISTS phonograms_all ON public.phonograms;
  CREATE POLICY phonograms_all ON public.phonograms FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'radio_tv_detections') THEN
  DROP POLICY IF EXISTS radio_tv_detections_all ON public.radio_tv_detections;
  CREATE POLICY radio_tv_detections_all ON public.radio_tv_detections FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'releases') THEN
  DROP POLICY IF EXISTS releases_all ON public.releases;
  CREATE POLICY releases_all ON public.releases FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'social_media_metrics') THEN
  DROP POLICY IF EXISTS social_media_metrics_all ON public.social_media_metrics;
  CREATE POLICY social_media_metrics_all ON public.social_media_metrics FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spotify_artist_tokens') THEN
  DROP POLICY IF EXISTS spotify_artist_tokens_all ON public.spotify_artist_tokens;
  CREATE POLICY spotify_artist_tokens_all ON public.spotify_artist_tokens FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spotify_metrics') THEN
  DROP POLICY IF EXISTS spotify_metrics_all ON public.spotify_metrics;
  CREATE POLICY spotify_metrics_all ON public.spotify_metrics FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spotify_oauth_states') THEN
  DROP POLICY IF EXISTS spotify_oauth_states_all ON public.spotify_oauth_states;
  CREATE POLICY spotify_oauth_states_all ON public.spotify_oauth_states FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sync_licenses') THEN
  DROP POLICY IF EXISTS sync_licenses_all ON public.sync_licenses;
  CREATE POLICY sync_licenses_all ON public.sync_licenses FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_alerts') THEN
  DROP POLICY IF EXISTS system_alerts_all ON public.system_alerts;
  CREATE POLICY system_alerts_all ON public.system_alerts FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'takedowns') THEN
  DROP POLICY IF EXISTS takedowns_all ON public.takedowns;
  CREATE POLICY takedowns_all ON public.takedowns FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
  DROP POLICY IF EXISTS tasks_all ON public.tasks;
  CREATE POLICY tasks_all ON public.tasks FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tracks') THEN
  DROP POLICY IF EXISTS tracks_all ON public.tracks;
  CREATE POLICY tracks_all ON public.tracks FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_artists') THEN
  DROP POLICY IF EXISTS user_artists_all ON public.user_artists;
  CREATE POLICY user_artists_all ON public.user_artists FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
  DROP POLICY IF EXISTS user_roles_unified ON public.user_roles;
  CREATE POLICY user_roles_unified ON public.user_roles FOR ALL TO authenticated 
  USING (user_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (select auth.uid()) AND r.name IN ('master','administrador')));
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transaction_installments') THEN
  DROP POLICY IF EXISTS transaction_installments_all ON public.transaction_installments;
  CREATE POLICY transaction_installments_all ON public.transaction_installments FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_categorization_rules') THEN
  DROP POLICY IF EXISTS financial_categorization_rules_all ON public.financial_categorization_rules;
  CREATE POLICY financial_categorization_rules_all ON public.financial_categorization_rules FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'automation_execution_logs') THEN
  DROP POLICY IF EXISTS automation_execution_logs_all ON public.automation_execution_logs;
  CREATE POLICY automation_execution_logs_all ON public.automation_execution_logs FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_artists') THEN
  DROP POLICY IF EXISTS project_artists_all ON public.project_artists;
  CREATE POLICY project_artists_all ON public.project_artists FOR ALL TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'release_metrics') THEN
  DROP POLICY IF EXISTS release_metrics_all ON public.release_metrics;
  CREATE POLICY release_metrics_all ON public.release_metrics FOR SELECT TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'release_streaming_metrics') THEN
  DROP POLICY IF EXISTS release_streaming_metrics_all ON public.release_streaming_metrics;
  CREATE POLICY release_streaming_metrics_all ON public.release_streaming_metrics FOR SELECT TO authenticated USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landerzap_conversations') THEN
  DROP POLICY IF EXISTS landerzap_conversations_all ON public.landerzap_conversations;
  CREATE POLICY landerzap_conversations_all ON public.landerzap_conversations FOR ALL TO authenticated USING (true);
END IF; END $$;
