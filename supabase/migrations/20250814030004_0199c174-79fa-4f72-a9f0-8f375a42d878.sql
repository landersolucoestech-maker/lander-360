-- Check if views have any security definer properties and clean them up
-- First, let's see the exact view definitions

-- Drop and recreate the views to ensure they don't have any hidden SECURITY DEFINER properties
DROP VIEW IF EXISTS public.v_contributor_balance CASCADE;
DROP VIEW IF EXISTS public.v_contributor_royalties CASCADE; 
DROP VIEW IF EXISTS public.v_track_revenue CASCADE;

-- Recreate v_track_revenue (base view)
CREATE VIEW public.v_track_revenue AS
SELECT 
    org_id,
    track_id,
    SUM(net_amount) AS net_revenue
FROM sales_report_lines srl
GROUP BY org_id, track_id;

-- Recreate v_contributor_royalties  
CREATE VIEW public.v_contributor_royalties AS
SELECT 
    tc.org_id,
    tc.contributor_id,
    tc.track_id,
    COALESCE(tr.net_revenue * (tc.split_percent / 100.0), 0) AS amount_due
FROM track_contributors tc
JOIN v_track_revenue tr ON tc.track_id = tr.track_id
WHERE tc.split_percent > 0;

-- Recreate v_contributor_balance
CREATE VIEW public.v_contributor_balance AS
SELECT 
    c.org_id,
    c.id AS contributor_id,
    COALESCE(SUM(cr.amount_due), 0) AS total_due,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COALESCE(SUM(cr.amount_due), 0) - COALESCE(SUM(p.amount), 0) AS balance
FROM contributors c
LEFT JOIN v_contributor_royalties cr ON c.id = cr.contributor_id
LEFT JOIN payments p ON c.id = p.contributor_id AND p.status = 'paid'
GROUP BY c.org_id, c.id;

-- Enable RLS on all views
ALTER VIEW public.v_track_revenue ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_contributor_royalties ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_contributor_balance ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for the views
CREATE POLICY "view_track_revenue_org_access" ON public.v_track_revenue
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "view_contributor_royalties_org_access" ON public.v_contributor_royalties  
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "view_contributor_balance_org_access" ON public.v_contributor_balance
    FOR SELECT USING (is_org_member(org_id));