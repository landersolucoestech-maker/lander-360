-- Fix security definer views by dropping problematic views
-- The warnings are about views with SECURITY DEFINER which can be security risks

-- Check if there are security definer views and replace them
DROP VIEW IF EXISTS v_contributor_balance CASCADE;
DROP VIEW IF EXISTS v_contributor_royalties CASCADE;
DROP VIEW IF EXISTS v_track_revenue CASCADE;

-- Recreate views without SECURITY DEFINER
CREATE VIEW v_contributor_balance AS
SELECT 
    org_id,
    contributor_id,
    COALESCE(SUM(CASE WHEN invoices.status = 'completed' THEN invoices.total_amount ELSE 0 END), 0) as total_due,
    COALESCE(SUM(CASE WHEN payments.status = 'completed' THEN payments.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN invoices.status = 'completed' THEN invoices.total_amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN payments.status = 'completed' THEN payments.amount ELSE 0 END), 0) as balance
FROM public.contributors
LEFT JOIN public.invoices ON contributors.id = invoices.contributor_id
LEFT JOIN public.payments ON contributors.id = payments.contributor_id
GROUP BY org_id, contributor_id;

CREATE VIEW v_contributor_royalties AS
SELECT 
    r.org_id,
    r.track_id,
    r.contributor_id,
    COALESCE(SUM(srl.net_amount * (r.share_percent / 100)), 0) as amount_due
FROM public.royalty_splits r
LEFT JOIN public.sales_report_lines srl ON r.track_id = srl.track_id AND r.org_id = srl.org_id
WHERE r.effective_from <= CURRENT_DATE AND (r.effective_to IS NULL OR r.effective_to >= CURRENT_DATE)
GROUP BY r.org_id, r.track_id, r.contributor_id;

CREATE VIEW v_track_revenue AS
SELECT 
    org_id,
    track_id,
    COALESCE(SUM(net_amount), 0) as net_revenue
FROM public.sales_report_lines
GROUP BY org_id, track_id;