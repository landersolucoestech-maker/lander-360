-- Remove any RLS policies from views since views cannot have RLS policies
-- Security is enforced through the underlying table RLS policies automatically

-- Drop any existing policies on views (if they exist)
DROP POLICY IF EXISTS "view_track_revenue_org_access" ON public.v_track_revenue;
DROP POLICY IF EXISTS "view_contributor_royalties_org_access" ON public.v_contributor_royalties;  
DROP POLICY IF EXISTS "view_contributor_balance_org_access" ON public.v_contributor_balance;

-- Views inherit security from their underlying tables automatically
-- No additional configuration needed