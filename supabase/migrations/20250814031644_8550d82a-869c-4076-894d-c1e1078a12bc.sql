-- Remove RLS from views (views cannot have RLS policies)
-- Security is enforced through the underlying table RLS policies

-- Drop any existing policies on views
DROP POLICY IF EXISTS "view_track_revenue_org_access" ON public.v_track_revenue;
DROP POLICY IF EXISTS "view_contributor_royalties_org_access" ON public.v_contributor_royalties;  
DROP POLICY IF EXISTS "view_contributor_balance_org_access" ON public.v_contributor_balance;

-- Disable RLS on views (PostgreSQL doesn't support RLS on views anyway)
ALTER VIEW public.v_track_revenue DISABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_contributor_royalties DISABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_contributor_balance DISABLE ROW LEVEL SECURITY;