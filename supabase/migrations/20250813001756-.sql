-- Fix: financial_summary is a VIEW, so RLS cannot be enabled. Convert to MATERIALIZED VIEW (optional) and tighten privileges.

-- 1) If it's a normal view, convert it to a materialized view preserving its definition
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

    -- Drop regular view and recreate as materialized view
    EXECUTE 'DROP VIEW public.financial_summary';
    EXECUTE format('CREATE MATERIALIZED VIEW public.financial_summary AS %s', view_def);
  END IF;
END $$;

-- 2) Tighten privileges: revoke broad access and grant only SELECT to authenticated
DO $$
DECLARE
  relkind CHAR;
BEGIN
  SELECT c.relkind INTO relkind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'financial_summary';

  IF relkind = 'v' THEN
    -- Regular VIEW
    EXECUTE 'REVOKE ALL ON VIEW public.financial_summary FROM anon, authenticated';
    EXECUTE 'GRANT SELECT ON VIEW public.financial_summary TO authenticated';
  ELSIF relkind = 'm' THEN
    -- MATERIALIZED VIEW
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.financial_summary FROM anon, authenticated';
    EXECUTE 'GRANT SELECT ON MATERIALIZED VIEW public.financial_summary TO authenticated';
  ELSE
    -- If it's a TABLE for any reason, just adjust table privileges
    EXECUTE 'REVOKE ALL ON TABLE public.financial_summary FROM anon, authenticated';
    EXECUTE 'GRANT SELECT ON TABLE public.financial_summary TO authenticated';
  END IF;
END $$;