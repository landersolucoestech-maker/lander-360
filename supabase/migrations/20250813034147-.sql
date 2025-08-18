-- Secure access to view: financial_summary_secure
-- Views do not support RLS; restrict via privileges and use secure RPC

-- Revoke any existing select grants from exposed roles
REVOKE SELECT ON TABLE public.financial_summary_secure FROM anon;
REVOKE SELECT ON TABLE public.financial_summary_secure FROM authenticated;
REVOKE SELECT ON TABLE public.financial_summary_secure FROM public;

-- Optionally allow service_role (server-side only) to read
GRANT SELECT ON TABLE public.financial_summary_secure TO service_role;

COMMENT ON VIEW public.financial_summary_secure IS 'Secure financial summary view; direct SELECT revoked for anon/authenticated. Use RPC public.get_financial_summary_secure().' ;