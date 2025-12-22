-- HABILITAR RLS NAS TABELAS BACKEND ONLY (SEM POLICIES)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'royalty_distrokid','royalty_onerpm_details_commissions','royalty_onerpm_details_masters',
    'royalty_onerpm_details_publishing','royalty_onerpm_details_share','royalty_onerpm_details_youtube',
    'royalty_onerpm_statement','royalty_onerpm_summary','royalty_reports',
    'ecad_reports','ecad_report_items','login_attempts','rate_limits'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;

-- MÉTRICAS (LEITURA AUTENTICADOS)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'release_metrics') THEN
    ALTER TABLE public.release_metrics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS auth_read_release_metrics ON public.release_metrics;
    CREATE POLICY auth_read_release_metrics ON public.release_metrics FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'release_streaming_metrics') THEN
    ALTER TABLE public.release_streaming_metrics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS auth_read_streaming_metrics ON public.release_streaming_metrics;
    CREATE POLICY auth_read_streaming_metrics ON public.release_streaming_metrics FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- TABELAS VINCULADAS AO USUÁRIO (user_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_own_invoices ON public.invoices;
    CREATE POLICY user_own_invoices ON public.invoices FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'influencers') THEN
    ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_own_influencers ON public.influencers;
    CREATE POLICY user_own_influencers ON public.influencers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'landerzap_conversations') THEN
    ALTER TABLE public.landerzap_conversations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS user_own_conversations ON public.landerzap_conversations;
    CREATE POLICY user_own_conversations ON public.landerzap_conversations FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- SISTEMA / RBAC / ADMINISTRAÇÃO
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_modules') THEN
    ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS admin_system_modules ON public.system_modules;
    CREATE POLICY admin_system_modules ON public.system_modules FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('master','administrador'))));
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_permissions') THEN
    ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS admin_module_permissions ON public.module_permissions;
    CREATE POLICY admin_module_permissions ON public.module_permissions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('master','administrador'))));
  END IF;
END $$;

-- EDGE FUNCTIONS (ADMIN)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_functions') THEN
    ALTER TABLE public.edge_functions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS admin_edge_functions ON public.edge_functions;
    CREATE POLICY admin_edge_functions ON public.edge_functions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('master','administrador'))));
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'edge_function_permissions') THEN
    ALTER TABLE public.edge_function_permissions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS admin_edge_permissions ON public.edge_function_permissions;
    CREATE POLICY admin_edge_permissions ON public.edge_function_permissions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('master','administrador'))));
  END IF;
END $$;

-- TABELAS DE APOIO / CATÁLOGO
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sectors') THEN
    ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS auth_read_sectors ON public.sectors;
    CREATE POLICY auth_read_sectors ON public.sectors FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
