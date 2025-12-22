CREATE SCHEMA IF NOT EXISTS internal;

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'artists','user_artists','projects','releases','contracts',
    'financial_transactions','music_registry','phonograms',
    'marketing_campaigns','marketing_content','crm_contacts',
    'agenda_events','inventory_items','services','invoices',
    'landerzap_conversations','landerzap_messages','users',
    'artist_sensitive_data','artist_goals','notifications',
    'categorization_rules','takedown_requests','licensing_requests',
    'contract_templates','shares','share_participants',
    'roles','permissions','role_permissions','user_roles',
    'edge_function_logs','login_history','audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_function_logs') THEN
    DROP POLICY IF EXISTS deny_all_edge_logs ON public.edge_function_logs;
    CREATE POLICY deny_all_edge_logs ON public.edge_function_logs FOR ALL USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'login_history') THEN
    DROP POLICY IF EXISTS deny_all_login_history ON public.login_history;
    CREATE POLICY deny_all_login_history ON public.login_history FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP POLICY IF EXISTS deny_all_audit_logs ON public.audit_logs;
    CREATE POLICY deny_all_audit_logs ON public.audit_logs FOR ALL USING (false);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'v_user_permissions') THEN
    ALTER VIEW public.v_user_permissions SET SCHEMA internal;
  END IF;
END $$;
