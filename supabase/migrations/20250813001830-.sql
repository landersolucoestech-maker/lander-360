-- Retry: convert view to materialized view if needed, then safely adjust privileges without relying on relkind branching

-- 1) Convert regular view -> materialized view (if it's currently a view)
DO $$
DECLARE
  is_view BOOLEAN;
  view_def TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'financial_summary' AND c.relkind = 'v'
  ) INTO is_view;

  IF is_view THEN
    SELECT definition INTO view_def
    FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'financial_summary'
    LIMIT 1;

    EXECUTE 'DROP VIEW public.financial_summary';
    EXECUTE format('CREATE MATERIALIZED VIEW public.financial_summary AS %s', view_def);
  END IF;
END $$;

-- 2) Tighten privileges for whichever object type exists (materialized view/view/table)
DO $$
BEGIN
  -- REVOKE for MATERIALIZED VIEW (ignore if not a matview)
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON MATERIALIZED VIEW public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
    -- ignore
  END;

  -- REVOKE for VIEW (ignore if not a view)
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;

  -- REVOKE for TABLE (ignore if not a table)
  BEGIN
    EXECUTE 'REVOKE ALL PRIVILEGES ON TABLE public.financial_summary FROM anon, authenticated';
  EXCEPTION WHEN undefined_object THEN
  END;

  -- GRANT SELECT for MATERIALIZED VIEW
  BEGIN
    EXECUTE 'GRANT SELECT ON MATERIALIZED VIEW public.financial_summary TO authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;

  -- GRANT SELECT for VIEW
  BEGIN
    EXECUTE 'GRANT SELECT ON VIEW public.financial_summary TO authenticated';
  EXCEPTION WHEN undefined_object OR syntax_error_or_access_rule_violation THEN
  END;

  -- GRANT SELECT for TABLE
  BEGIN
    EXECUTE 'GRANT SELECT ON TABLE public.financial_summary TO authenticated';
  EXCEPTION WHEN undefined_object THEN
  END;
END $$;