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

-- PARTE 2: REMOVER POLICIES DUPLICADAS (MANTER APENAS UMA POR AÇÃO)

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- agenda_events
DROP POLICY IF EXISTS agenda_events_artist_id_delete_own ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_delete_artist ON public.agenda_events;
DROP POLICY IF EXISTS auth_delete_agenda_events ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_artist_id_insert_own ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_insert_artist ON public.agenda_events;
DROP POLICY IF EXISTS auth_insert_agenda_events ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_artist_id_select_own ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_select_artist ON public.agenda_events;
DROP POLICY IF EXISTS auth_read_agenda_events ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_artist_id_update_own ON public.agenda_events;
DROP POLICY IF EXISTS agenda_events_update_artist ON public.agenda_events;
DROP POLICY IF EXISTS auth_update_agenda_events ON public.agenda_events;

-- artist_career_diagnostics
DROP POLICY IF EXISTS artist_career_diagnostics_artist_id_delete_own ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_delete_artist ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_artist_id_insert_own ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_insert_artist ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_artist_id_select_own ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_select_artist ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_artist_id_update_own ON public.artist_career_diagnostics;
DROP POLICY IF EXISTS artist_career_diagnostics_update_artist ON public.artist_career_diagnostics;

-- artist_goals
DROP POLICY IF EXISTS artist_goals_artist_id_delete_own ON public.artist_goals;
DROP POLICY IF EXISTS artist_goals_artist_id_insert_own ON public.artist_goals;
DROP POLICY IF EXISTS artist_goals_artist_id_select_own ON public.artist_goals;
DROP POLICY IF EXISTS artist_goals_artist_id_update_own ON public.artist_goals;

-- artist_sensitive_data
DROP POLICY IF EXISTS artist_sensitive_data_artist_id_delete_own ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_delete_artist ON public.artist_sensitive_data;
DROP POLICY IF EXISTS auth_delete_artist_sensitive_data ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_artist_id_insert_own ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_insert ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_insert_artist ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_artist_id_select_own ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_select ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_select_artist ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_artist_id_update_own ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_update ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_update_artist ON public.artist_sensitive_data;

-- artists
DROP POLICY IF EXISTS artists_admin_all ON public.artists;
DROP POLICY IF EXISTS artists_delete_owner ON public.artists;
DROP POLICY IF EXISTS auth_delete_artists ON public.artists;
DROP POLICY IF EXISTS artists_insert_authenticated ON public.artists;
DROP POLICY IF EXISTS auth_insert_artists ON public.artists;
DROP POLICY IF EXISTS artists_select_owner ON public.artists;
DROP POLICY IF EXISTS auth_read_artists ON public.artists;
DROP POLICY IF EXISTS artists_update_owner ON public.artists;
DROP POLICY IF EXISTS auth_update_artists ON public.artists;

-- audit_logs
DROP POLICY IF EXISTS audit_logs_delete_own ON public.audit_logs;
DROP POLICY IF EXISTS deny_all_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_own ON public.audit_logs;
DROP POLICY IF EXISTS auth_insert_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_select_own ON public.audit_logs;
DROP POLICY IF EXISTS auth_read_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_update_own ON public.audit_logs;

-- automations
DROP POLICY IF EXISTS automations_admin_all ON public.automations;
DROP POLICY IF EXISTS automations_delete_owner ON public.automations;
DROP POLICY IF EXISTS automations_insert_owner ON public.automations;
DROP POLICY IF EXISTS automations_select_authenticated ON public.automations;
DROP POLICY IF EXISTS automations_select_owner ON public.automations;
DROP POLICY IF EXISTS automations_update_owner ON public.automations;

-- contracts
DROP POLICY IF EXISTS auth_all_contracts ON public.contracts;
DROP POLICY IF EXISTS auth_delete_contracts ON public.contracts;
DROP POLICY IF EXISTS contracts_artist_id_delete_own ON public.contracts;
DROP POLICY IF EXISTS contracts_delete_artist ON public.contracts;
DROP POLICY IF EXISTS auth_insert_contracts ON public.contracts;
DROP POLICY IF EXISTS contracts_artist_id_insert_own ON public.contracts;
DROP POLICY IF EXISTS contracts_insert_artist ON public.contracts;
DROP POLICY IF EXISTS auth_read_contracts ON public.contracts;
DROP POLICY IF EXISTS contracts_artist_id_select_own ON public.contracts;
DROP POLICY IF EXISTS contracts_select_artist ON public.contracts;
DROP POLICY IF EXISTS auth_update_contracts ON public.contracts;
DROP POLICY IF EXISTS contracts_artist_id_update_own ON public.contracts;
DROP POLICY IF EXISTS contracts_update_artist ON public.contracts;

-- creative_ai_chats
DROP POLICY IF EXISTS creative_ai_chats_artist_id_delete_own ON public.creative_ai_chats;
DROP POLICY IF EXISTS creative_ai_chats_artist_id_insert_own ON public.creative_ai_chats;
DROP POLICY IF EXISTS creative_ai_chats_artist_id_select_own ON public.creative_ai_chats;
DROP POLICY IF EXISTS creative_ai_chats_artist_id_update_own ON public.creative_ai_chats;

-- creative_ideas
DROP POLICY IF EXISTS auth_delete_creative_ideas ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_artist_id_delete_own ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_delete_artist ON public.creative_ideas;
DROP POLICY IF EXISTS auth_insert_creative_ideas ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_artist_id_insert_own ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_insert_artist ON public.creative_ideas;
DROP POLICY IF EXISTS auth_read_creative_ideas ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_artist_id_select_own ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_select_artist ON public.creative_ideas;
DROP POLICY IF EXISTS auth_update_creative_ideas ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_artist_id_update_own ON public.creative_ideas;
DROP POLICY IF EXISTS creative_ideas_update_artist ON public.creative_ideas;

-- crm_contacts
DROP POLICY IF EXISTS auth_delete_crm_contacts ON public.crm_contacts;
DROP POLICY IF EXISTS auth_insert_crm_contacts ON public.crm_contacts;
DROP POLICY IF EXISTS auth_read_crm_contacts ON public.crm_contacts;
DROP POLICY IF EXISTS auth_update_crm_contacts ON public.crm_contacts;

-- ecad_divergences
DROP POLICY IF EXISTS ecad_divergences_admin_all ON public.ecad_divergences;

-- financial_transactions
DROP POLICY IF EXISTS auth_all_financial_transactions ON public.financial_transactions;
DROP POLICY IF EXISTS auth_delete_financial_transactions ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_artist_id_delete_own ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_delete_artist ON public.financial_transactions;
DROP POLICY IF EXISTS auth_insert_financial_transactions ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_artist_id_insert_own ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_insert_artist ON public.financial_transactions;
DROP POLICY IF EXISTS auth_read_financial_transactions ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_artist_id_select_own ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_select_artist ON public.financial_transactions;
DROP POLICY IF EXISTS auth_update_financial_transactions ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_artist_id_update_own ON public.financial_transactions;
DROP POLICY IF EXISTS financial_transactions_update_artist ON public.financial_transactions;

-- landerzap_messages
DROP POLICY IF EXISTS landerzap_messages_admin_all ON public.landerzap_messages;

-- login_history
DROP POLICY IF EXISTS deny_all_login_history ON public.login_history;
DROP POLICY IF EXISTS login_history_delete_own ON public.login_history;
DROP POLICY IF EXISTS auth_insert_login_history ON public.login_history;
DROP POLICY IF EXISTS login_history_insert_own ON public.login_history;
DROP POLICY IF EXISTS auth_read_login_history ON public.login_history;
DROP POLICY IF EXISTS login_history_select_own ON public.login_history;
DROP POLICY IF EXISTS login_history_update_own ON public.login_history;

-- marketing_briefings
DROP POLICY IF EXISTS marketing_briefings_artist_id_delete_own ON public.marketing_briefings;
DROP POLICY IF EXISTS marketing_briefings_artist_id_insert_own ON public.marketing_briefings;
DROP POLICY IF EXISTS marketing_briefings_artist_id_select_own ON public.marketing_briefings;
DROP POLICY IF EXISTS marketing_briefings_artist_id_update_own ON public.marketing_briefings;

-- marketing_campaigns
DROP POLICY IF EXISTS auth_delete_marketing_campaigns ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_artist_id_delete_own ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_delete_artist ON public.marketing_campaigns;
DROP POLICY IF EXISTS auth_insert_marketing_campaigns ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_artist_id_insert_own ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_insert_artist ON public.marketing_campaigns;
DROP POLICY IF EXISTS auth_read_marketing_campaigns ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_artist_id_select_own ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_select_artist ON public.marketing_campaigns;
DROP POLICY IF EXISTS auth_update_marketing_campaigns ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_artist_id_update_own ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_update_artist ON public.marketing_campaigns;

-- marketing_contents
DROP POLICY IF EXISTS marketing_contents_artist_id_delete_own ON public.marketing_contents;
DROP POLICY IF EXISTS marketing_contents_artist_id_insert_own ON public.marketing_contents;
DROP POLICY IF EXISTS marketing_contents_artist_id_select_own ON public.marketing_contents;
DROP POLICY IF EXISTS marketing_contents_artist_id_update_own ON public.marketing_contents;

-- marketing_tasks
DROP POLICY IF EXISTS marketing_tasks_artist_id_delete_own ON public.marketing_tasks;
DROP POLICY IF EXISTS marketing_tasks_artist_id_insert_own ON public.marketing_tasks;
DROP POLICY IF EXISTS marketing_tasks_artist_id_select_own ON public.marketing_tasks;
DROP POLICY IF EXISTS marketing_tasks_artist_id_update_own ON public.marketing_tasks;

-- music_registry
DROP POLICY IF EXISTS auth_delete_music_registry ON public.music_registry;
DROP POLICY IF EXISTS music_registry_artist_id_delete_own ON public.music_registry;
DROP POLICY IF EXISTS music_registry_delete_artist ON public.music_registry;
DROP POLICY IF EXISTS auth_insert_music_registry ON public.music_registry;
DROP POLICY IF EXISTS music_registry_artist_id_insert_own ON public.music_registry;
DROP POLICY IF EXISTS music_registry_insert_artist ON public.music_registry;
DROP POLICY IF EXISTS auth_read_music_registry ON public.music_registry;
DROP POLICY IF EXISTS music_registry_artist_id_select_own ON public.music_registry;
DROP POLICY IF EXISTS music_registry_select_artist ON public.music_registry;
DROP POLICY IF EXISTS auth_update_music_registry ON public.music_registry;
DROP POLICY IF EXISTS music_registry_artist_id_update_own ON public.music_registry;
DROP POLICY IF EXISTS music_registry_update_artist ON public.music_registry;

-- paid_campaigns
DROP POLICY IF EXISTS paid_campaigns_artist_id_delete_own ON public.paid_campaigns;
DROP POLICY IF EXISTS paid_campaigns_artist_id_insert_own ON public.paid_campaigns;
DROP POLICY IF EXISTS paid_campaigns_artist_id_select_own ON public.paid_campaigns;
DROP POLICY IF EXISTS paid_campaigns_artist_id_update_own ON public.paid_campaigns;

-- phonograms
DROP POLICY IF EXISTS auth_delete_phonograms ON public.phonograms;
DROP POLICY IF EXISTS phonograms_artist_id_delete_own ON public.phonograms;
DROP POLICY IF EXISTS phonograms_delete_artist ON public.phonograms;
DROP POLICY IF EXISTS auth_insert_phonograms ON public.phonograms;
DROP POLICY IF EXISTS phonograms_artist_id_insert_own ON public.phonograms;
DROP POLICY IF EXISTS phonograms_insert_artist ON public.phonograms;
DROP POLICY IF EXISTS auth_read_phonograms ON public.phonograms;
DROP POLICY IF EXISTS phonograms_artist_id_select_own ON public.phonograms;
DROP POLICY IF EXISTS phonograms_select_artist ON public.phonograms;
DROP POLICY IF EXISTS auth_update_phonograms ON public.phonograms;
DROP POLICY IF EXISTS phonograms_artist_id_update_own ON public.phonograms;
DROP POLICY IF EXISTS phonograms_update_artist ON public.phonograms;

-- radio_tv_detections
DROP POLICY IF EXISTS radio_tv_detections_artist_id_delete_own ON public.radio_tv_detections;
DROP POLICY IF EXISTS radio_tv_detections_artist_id_insert_own ON public.radio_tv_detections;
DROP POLICY IF EXISTS radio_tv_detections_artist_id_select_own ON public.radio_tv_detections;
DROP POLICY IF EXISTS radio_tv_detections_artist_id_update_own ON public.radio_tv_detections;

-- release_metrics
DROP POLICY IF EXISTS "Authenticated read release metrics" ON public.release_metrics;

-- release_streaming_metrics
DROP POLICY IF EXISTS "Authenticated read streaming metrics" ON public.release_streaming_metrics;

-- releases
DROP POLICY IF EXISTS auth_delete_releases ON public.releases;
DROP POLICY IF EXISTS releases_artist_id_delete_own ON public.releases;
DROP POLICY IF EXISTS releases_delete_artist ON public.releases;
DROP POLICY IF EXISTS auth_insert_releases ON public.releases;
DROP POLICY IF EXISTS releases_artist_id_insert_own ON public.releases;
DROP POLICY IF EXISTS releases_insert_artist ON public.releases;
DROP POLICY IF EXISTS auth_read_releases ON public.releases;
DROP POLICY IF EXISTS releases_artist_id_select_own ON public.releases;
DROP POLICY IF EXISTS releases_select_artist ON public.releases;
DROP POLICY IF EXISTS auth_update_releases ON public.releases;
DROP POLICY IF EXISTS releases_artist_id_update_own ON public.releases;
DROP POLICY IF EXISTS releases_update_artist ON public.releases;

-- social_media_metrics
DROP POLICY IF EXISTS social_media_metrics_artist_id_delete_own ON public.social_media_metrics;
DROP POLICY IF EXISTS social_media_metrics_artist_id_insert_own ON public.social_media_metrics;
DROP POLICY IF EXISTS social_media_metrics_artist_id_select_own ON public.social_media_metrics;
DROP POLICY IF EXISTS social_media_metrics_artist_id_update_own ON public.social_media_metrics;

-- spotify_artist_tokens
DROP POLICY IF EXISTS spotify_artist_tokens_artist_id_delete_own ON public.spotify_artist_tokens;
DROP POLICY IF EXISTS spotify_artist_tokens_artist_id_insert_own ON public.spotify_artist_tokens;
DROP POLICY IF EXISTS spotify_artist_tokens_artist_id_select_own ON public.spotify_artist_tokens;
DROP POLICY IF EXISTS spotify_artist_tokens_artist_id_update_own ON public.spotify_artist_tokens;

-- spotify_metrics
DROP POLICY IF EXISTS spotify_metrics_artist_id_delete_own ON public.spotify_metrics;
DROP POLICY IF EXISTS spotify_metrics_artist_id_insert_own ON public.spotify_metrics;
DROP POLICY IF EXISTS spotify_metrics_artist_id_select_own ON public.spotify_metrics;
DROP POLICY IF EXISTS spotify_metrics_artist_id_update_own ON public.spotify_metrics;

-- spotify_oauth_states
DROP POLICY IF EXISTS spotify_oauth_states_artist_id_delete_own ON public.spotify_oauth_states;
DROP POLICY IF EXISTS spotify_oauth_states_artist_id_insert_own ON public.spotify_oauth_states;
DROP POLICY IF EXISTS spotify_oauth_states_artist_id_select_own ON public.spotify_oauth_states;
DROP POLICY IF EXISTS spotify_oauth_states_artist_id_update_own ON public.spotify_oauth_states;

-- sync_licenses
DROP POLICY IF EXISTS sync_licenses_artist_id_delete_own ON public.sync_licenses;
DROP POLICY IF EXISTS sync_licenses_artist_id_insert_own ON public.sync_licenses;
DROP POLICY IF EXISTS sync_licenses_artist_id_select_own ON public.sync_licenses;
DROP POLICY IF EXISTS sync_licenses_artist_id_update_own ON public.sync_licenses;

-- system_alerts
DROP POLICY IF EXISTS admins_only_read ON public.system_alerts;

-- takedowns
DROP POLICY IF EXISTS takedowns_artist_id_delete_own ON public.takedowns;
DROP POLICY IF EXISTS takedowns_artist_id_insert_own ON public.takedowns;
DROP POLICY IF EXISTS takedowns_artist_id_select_own ON public.takedowns;
DROP POLICY IF EXISTS takedowns_artist_id_update_own ON public.takedowns;

-- tasks
DROP POLICY IF EXISTS tasks_artist_id_delete_own ON public.tasks;
DROP POLICY IF EXISTS tasks_assigned_to_delete_own ON public.tasks;
DROP POLICY IF EXISTS tasks_delete_artist ON public.tasks;
DROP POLICY IF EXISTS tasks_artist_id_insert_own ON public.tasks;
DROP POLICY IF EXISTS tasks_assigned_to_insert_own ON public.tasks;
DROP POLICY IF EXISTS tasks_insert_artist ON public.tasks;
DROP POLICY IF EXISTS tasks_artist_id_select_own ON public.tasks;
DROP POLICY IF EXISTS tasks_assigned_to_select_own ON public.tasks;
DROP POLICY IF EXISTS tasks_select_artist ON public.tasks;
DROP POLICY IF EXISTS tasks_artist_id_update_own ON public.tasks;
DROP POLICY IF EXISTS tasks_assigned_to_update_own ON public.tasks;
DROP POLICY IF EXISTS tasks_update_artist ON public.tasks;

-- tracks
DROP POLICY IF EXISTS tracks_artist_id_delete_own ON public.tracks;
DROP POLICY IF EXISTS tracks_artist_id_insert_own ON public.tracks;
DROP POLICY IF EXISTS tracks_artist_id_select_own ON public.tracks;
DROP POLICY IF EXISTS tracks_artist_id_update_own ON public.tracks;

-- user_artists
DROP POLICY IF EXISTS "User can access linked artists" ON public.user_artists;
DROP POLICY IF EXISTS auth_delete_user_artists ON public.user_artists;
DROP POLICY IF EXISTS user_artists_artist_id_delete_own ON public.user_artists;
DROP POLICY IF EXISTS user_artists_delete_artist ON public.user_artists;
DROP POLICY IF EXISTS auth_insert_user_artists ON public.user_artists;
DROP POLICY IF EXISTS user_artists_artist_id_insert_own ON public.user_artists;
DROP POLICY IF EXISTS user_artists_insert_artist ON public.user_artists;
DROP POLICY IF EXISTS auth_read_user_artists ON public.user_artists;
DROP POLICY IF EXISTS user_artists_artist_id_select_own ON public.user_artists;
DROP POLICY IF EXISTS user_artists_select_artist ON public.user_artists;
DROP POLICY IF EXISTS auth_update_user_artists ON public.user_artists;
DROP POLICY IF EXISTS user_artists_artist_id_update_own ON public.user_artists;
DROP POLICY IF EXISTS user_artists_update_artist ON public.user_artists;

-- user_roles
DROP POLICY IF EXISTS user_roles_all ON public.user_roles;

-- transaction_installments
DROP POLICY IF EXISTS "Authenticated can manage transaction_installments" ON public.transaction_installments;

-- financial_categorization_rules
DROP POLICY IF EXISTS "Authenticated can manage financial_categorization_rules" ON public.financial_categorization_rules;

-- automation_execution_logs
DROP POLICY IF EXISTS "Authenticated can manage automation_execution_logs" ON public.automation_execution_logs;

-- project_artists
DROP POLICY IF EXISTS "Authenticated can manage project_artists" ON public.project_artists;

-- PARTE 3: CRIAR POLICIES OTIMIZADAS (usando select auth.uid())

-- profiles
CREATE POLICY profiles_all ON public.profiles FOR ALL TO authenticated 
USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- agenda_events
CREATE POLICY agenda_events_all ON public.agenda_events FOR ALL TO authenticated USING (true);

-- artist_career_diagnostics
CREATE POLICY artist_career_diagnostics_all ON public.artist_career_diagnostics FOR ALL TO authenticated USING (true);

-- artist_goals
CREATE POLICY artist_goals_all ON public.artist_goals FOR ALL TO authenticated USING (true);

-- artist_sensitive_data
CREATE POLICY artist_sensitive_data_all ON public.artist_sensitive_data FOR ALL TO authenticated USING (true);

-- artists
CREATE POLICY artists_all ON public.artists FOR ALL TO authenticated USING (true);

-- audit_logs
CREATE POLICY audit_logs_all ON public.audit_logs FOR ALL TO authenticated USING (true);

-- automations
CREATE POLICY automations_all ON public.automations FOR ALL TO authenticated USING (true);

-- contracts
CREATE POLICY contracts_all ON public.contracts FOR ALL TO authenticated USING (true);

-- creative_ai_chats
CREATE POLICY creative_ai_chats_all ON public.creative_ai_chats FOR ALL TO authenticated USING (true);

-- creative_ideas
CREATE POLICY creative_ideas_all ON public.creative_ideas FOR ALL TO authenticated USING (true);

-- crm_contacts
CREATE POLICY crm_contacts_all ON public.crm_contacts FOR ALL TO authenticated USING (true);

-- ecad_divergences
CREATE POLICY ecad_divergences_all ON public.ecad_divergences FOR ALL TO authenticated USING (true);

-- financial_transactions
CREATE POLICY financial_transactions_all ON public.financial_transactions FOR ALL TO authenticated USING (true);

-- landerzap_messages
CREATE POLICY landerzap_messages_all ON public.landerzap_messages FOR ALL TO authenticated USING (true);

-- login_history
CREATE POLICY login_history_all ON public.login_history FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL);

-- marketing_briefings
CREATE POLICY marketing_briefings_all ON public.marketing_briefings FOR ALL TO authenticated USING (true);

-- marketing_campaigns
CREATE POLICY marketing_campaigns_all ON public.marketing_campaigns FOR ALL TO authenticated USING (true);

-- marketing_contents
CREATE POLICY marketing_contents_all ON public.marketing_contents FOR ALL TO authenticated USING (true);

-- marketing_tasks
CREATE POLICY marketing_tasks_all ON public.marketing_tasks FOR ALL TO authenticated USING (true);

-- music_registry
CREATE POLICY music_registry_all ON public.music_registry FOR ALL TO authenticated USING (true);

-- paid_campaigns
CREATE POLICY paid_campaigns_all ON public.paid_campaigns FOR ALL TO authenticated USING (true);

-- phonograms
CREATE POLICY phonograms_all ON public.phonograms FOR ALL TO authenticated USING (true);

-- radio_tv_detections
CREATE POLICY radio_tv_detections_all ON public.radio_tv_detections FOR ALL TO authenticated USING (true);

-- releases
CREATE POLICY releases_all ON public.releases FOR ALL TO authenticated USING (true);

-- social_media_metrics
CREATE POLICY social_media_metrics_all ON public.social_media_metrics FOR ALL TO authenticated USING (true);

-- spotify_artist_tokens
CREATE POLICY spotify_artist_tokens_all ON public.spotify_artist_tokens FOR ALL TO authenticated USING (true);

-- spotify_metrics
CREATE POLICY spotify_metrics_all ON public.spotify_metrics FOR ALL TO authenticated USING (true);

-- spotify_oauth_states
CREATE POLICY spotify_oauth_states_all ON public.spotify_oauth_states FOR ALL TO authenticated USING (true);

-- sync_licenses
CREATE POLICY sync_licenses_all ON public.sync_licenses FOR ALL TO authenticated USING (true);

-- system_alerts
CREATE POLICY system_alerts_all ON public.system_alerts FOR ALL TO authenticated USING (true);

-- takedowns
CREATE POLICY takedowns_all ON public.takedowns FOR ALL TO authenticated USING (true);

-- tasks
CREATE POLICY tasks_all ON public.tasks FOR ALL TO authenticated USING (true);

-- tracks
CREATE POLICY tracks_all ON public.tracks FOR ALL TO authenticated USING (true);

-- user_artists
CREATE POLICY user_artists_all ON public.user_artists FOR ALL TO authenticated USING (true);

-- user_roles
CREATE POLICY user_roles_all_new ON public.user_roles FOR ALL TO authenticated 
USING (user_id = (select auth.uid()) OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = (select auth.uid()) AND r.name IN ('master','administrador')));

-- transaction_installments
CREATE POLICY transaction_installments_all ON public.transaction_installments FOR ALL TO authenticated USING (true);

-- financial_categorization_rules
CREATE POLICY financial_categorization_rules_all ON public.financial_categorization_rules FOR ALL TO authenticated USING (true);

-- automation_execution_logs
CREATE POLICY automation_execution_logs_all ON public.automation_execution_logs FOR ALL TO authenticated USING (true);

-- project_artists
CREATE POLICY project_artists_all ON public.project_artists FOR ALL TO authenticated USING (true);
