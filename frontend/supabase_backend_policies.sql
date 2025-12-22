-- POLICIES DE BLOQUEIO PARA TABELAS BACKEND ONLY
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ecad_report_items') THEN
    DROP POLICY IF EXISTS backend_only_ecad_report_items ON public.ecad_report_items;
    CREATE POLICY backend_only_ecad_report_items ON public.ecad_report_items FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ecad_reports') THEN
    DROP POLICY IF EXISTS backend_only_ecad_reports ON public.ecad_reports;
    CREATE POLICY backend_only_ecad_reports ON public.ecad_reports FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'login_attempts') THEN
    DROP POLICY IF EXISTS backend_only_login_attempts ON public.login_attempts;
    CREATE POLICY backend_only_login_attempts ON public.login_attempts FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rate_limits') THEN
    DROP POLICY IF EXISTS backend_only_rate_limits ON public.rate_limits;
    CREATE POLICY backend_only_rate_limits ON public.rate_limits FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_distrokid') THEN
    DROP POLICY IF EXISTS backend_only_royalty_distrokid ON public.royalty_distrokid;
    CREATE POLICY backend_only_royalty_distrokid ON public.royalty_distrokid FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_details_commissions') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_commissions ON public.royalty_onerpm_details_commissions;
    CREATE POLICY backend_only_onerpm_commissions ON public.royalty_onerpm_details_commissions FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_details_masters') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_masters ON public.royalty_onerpm_details_masters;
    CREATE POLICY backend_only_onerpm_masters ON public.royalty_onerpm_details_masters FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_details_publishing') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_publishing ON public.royalty_onerpm_details_publishing;
    CREATE POLICY backend_only_onerpm_publishing ON public.royalty_onerpm_details_publishing FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_details_share') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_share ON public.royalty_onerpm_details_share;
    CREATE POLICY backend_only_onerpm_share ON public.royalty_onerpm_details_share FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_details_youtube') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_youtube ON public.royalty_onerpm_details_youtube;
    CREATE POLICY backend_only_onerpm_youtube ON public.royalty_onerpm_details_youtube FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_statement') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_statement ON public.royalty_onerpm_statement;
    CREATE POLICY backend_only_onerpm_statement ON public.royalty_onerpm_statement FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_onerpm_summary') THEN
    DROP POLICY IF EXISTS backend_only_onerpm_summary ON public.royalty_onerpm_summary;
    CREATE POLICY backend_only_onerpm_summary ON public.royalty_onerpm_summary FOR ALL USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'royalty_reports') THEN
    DROP POLICY IF EXISTS backend_only_royalty_reports ON public.royalty_reports;
    CREATE POLICY backend_only_royalty_reports ON public.royalty_reports FOR ALL USING (false);
  END IF;
END $$;
