-- Security Fix 1: Remove SECURITY DEFINER from financial views and implement proper RLS
-- These views currently bypass RLS which is a critical security vulnerability

-- Drop existing views
DROP VIEW IF EXISTS v_contributor_balance;
DROP VIEW IF EXISTS v_contributor_royalties;
DROP VIEW IF EXISTS v_track_revenue;

-- Recreate views WITHOUT SECURITY DEFINER
CREATE VIEW v_contributor_balance AS
SELECT 
    cr.org_id,
    cr.contributor_id,
    COALESCE(SUM(srl.net_amount * rs.share_percent / 100), 0) as total_due,
    COALESCE(SUM(p.amount), 0) as total_paid,
    COALESCE(SUM(srl.net_amount * rs.share_percent / 100), 0) - COALESCE(SUM(p.amount), 0) as balance
FROM contributors cr
LEFT JOIN royalty_splits rs ON cr.id = rs.contributor_id
LEFT JOIN sales_report_lines srl ON rs.track_id = srl.track_id
LEFT JOIN payments p ON cr.id = p.contributor_id AND p.status = 'completed'
WHERE cr.org_id IS NOT NULL
GROUP BY cr.org_id, cr.contributor_id;

CREATE VIEW v_contributor_royalties AS
SELECT 
    rs.org_id,
    rs.track_id,
    rs.contributor_id,
    COALESCE(SUM(srl.net_amount * rs.share_percent / 100), 0) as amount_due
FROM royalty_splits rs
LEFT JOIN sales_report_lines srl ON rs.track_id = srl.track_id
WHERE rs.org_id IS NOT NULL
GROUP BY rs.org_id, rs.track_id, rs.contributor_id;

CREATE VIEW v_track_revenue AS
SELECT 
    srl.org_id,
    srl.track_id,
    COALESCE(SUM(srl.net_amount), 0) as net_revenue
FROM sales_report_lines srl
WHERE srl.org_id IS NOT NULL
GROUP BY srl.org_id, srl.track_id;

-- Security Fix 2: Add RLS to views
ALTER TABLE v_contributor_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE v_contributor_royalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE v_track_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the views
CREATE POLICY "view_contributor_balance_org_access" ON v_contributor_balance
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "view_contributor_royalties_org_access" ON v_contributor_royalties
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "view_track_revenue_org_access" ON v_track_revenue
    FOR SELECT USING (is_org_member(org_id));

-- Security Fix 3: Strengthen profiles table RLS policies
-- Remove duplicate policies and create comprehensive ones
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_upsert" ON profiles;

-- Create single, clear policies for profiles
CREATE POLICY "profiles_own_access" ON profiles
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Security Fix 4: Add role-based access for sensitive contributor data
-- Create policy to restrict access to sensitive fields based on roles
CREATE POLICY "contributors_sensitive_data_admin_only" ON contributors
    FOR SELECT USING (
        is_org_member(org_id) AND 
        (
            has_role(auth.uid(), 'admin'::app_role) OR 
            auth.uid() IN (
                SELECT user_id FROM org_members 
                WHERE org_id = contributors.org_id AND role = 'admin'
            )
        )
    );

-- Security Fix 5: Add audit logging trigger for sensitive financial data access
CREATE OR REPLACE FUNCTION audit_financial_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Log access to sensitive financial data
    INSERT INTO audit_log (
        user_id, 
        table_name, 
        operation, 
        record_id, 
        timestamp
    ) VALUES (
        auth.uid(),
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    table_name text NOT NULL,
    operation text NOT NULL,
    record_id uuid,
    timestamp timestamp with time zone DEFAULT NOW(),
    org_id uuid
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log access (admin only)
CREATE POLICY "audit_log_admin_access" ON audit_log
    FOR SELECT USING (
        has_role(auth.uid(), 'admin'::app_role)
    );

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_contracts_access
    AFTER SELECT OR INSERT OR UPDATE OR DELETE ON contracts
    FOR EACH ROW EXECUTE FUNCTION audit_financial_access();

CREATE TRIGGER audit_payments_access
    AFTER SELECT OR INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_financial_access();

CREATE TRIGGER audit_invoices_access
    AFTER SELECT OR INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION audit_financial_access();