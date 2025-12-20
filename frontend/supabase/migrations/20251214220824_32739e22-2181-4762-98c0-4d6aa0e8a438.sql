-- =============================================
-- SECURITY & PERFORMANCE IMPROVEMENTS
-- =============================================

-- 1. DETAILED AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN'
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- No updates or deletes allowed on audit logs (immutable)
-- No UPDATE or DELETE policies = cannot modify logs

-- 2. RLS POLICIES FOR FINANCIAL TRANSACTIONS
-- =============================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins and finance can view all financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins and finance can insert financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins and finance can update financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Admins can delete financial transactions" ON public.financial_transactions;

-- Only admin and financeiro roles can view financial transactions
CREATE POLICY "Admins and finance can view all financial transactions"
ON public.financial_transactions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

-- Only admin and financeiro roles can insert
CREATE POLICY "Admins and finance can insert financial transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

-- Only admin and financeiro roles can update
CREATE POLICY "Admins and finance can update financial transactions"
ON public.financial_transactions
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'financeiro')
);

-- Only admins can delete (stricter control)
CREATE POLICY "Only admins can delete financial transactions"
ON public.financial_transactions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. PERFORMANCE INDEXES
-- =============================================
-- Index for financial transaction queries by date
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date 
ON public.financial_transactions(transaction_date DESC);

-- Index for financial transaction type queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type 
ON public.financial_transactions(transaction_type);

-- Index for financial transaction status
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status 
ON public.financial_transactions(status);

-- Composite index for common financial queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type_status_date 
ON public.financial_transactions(transaction_type, status, transaction_date DESC);

-- Index for artist-related financial queries
CREATE INDEX IF NOT EXISTS idx_financial_transactions_artist 
ON public.financial_transactions(artist_id) WHERE artist_id IS NOT NULL;

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Index for login_attempts (for security alerts)
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_last_attempt ON public.login_attempts(last_attempt_at DESC);

-- 4. LOGIN ATTEMPT ALERT FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.check_suspicious_login()
RETURNS TRIGGER AS $$
BEGIN
  -- If attempt_count reaches 3, log a warning in audit_logs
  IF NEW.attempt_count >= 3 THEN
    INSERT INTO public.audit_logs (
      action,
      table_name,
      metadata,
      created_at
    ) VALUES (
      'SUSPICIOUS_LOGIN_ATTEMPT',
      'login_attempts',
      jsonb_build_object(
        'email', NEW.email,
        'attempt_count', NEW.attempt_count,
        'locked_until', NEW.locked_until
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_check_suspicious_login ON public.login_attempts;
CREATE TRIGGER trigger_check_suspicious_login
AFTER INSERT OR UPDATE ON public.login_attempts
FOR EACH ROW
EXECUTE FUNCTION public.check_suspicious_login();

-- 5. AUDIT TRIGGER FOR FINANCIAL TRANSACTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.audit_financial_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit trigger to financial_transactions
DROP TRIGGER IF EXISTS trigger_audit_financial ON public.financial_transactions;
CREATE TRIGGER trigger_audit_financial
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.audit_financial_changes();

-- Apply audit trigger to contracts
DROP TRIGGER IF EXISTS trigger_audit_contracts ON public.contracts;
CREATE TRIGGER trigger_audit_contracts
AFTER INSERT OR UPDATE OR DELETE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.audit_financial_changes();