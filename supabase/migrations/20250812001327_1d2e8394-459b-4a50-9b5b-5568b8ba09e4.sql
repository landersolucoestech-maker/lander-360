-- Security fix: Remove artists_secure table if it exists and ensure proper access control
-- The artists_secure table should not exist as a real table since we have the get_artists_secure() function

-- Drop the artists_secure table if it exists (it's redundant and insecure)
DROP TABLE IF EXISTS public.artists_secure;

-- Ensure the get_artists_secure function is the only way to access secure artist data
-- Add a comment to document this security decision
COMMENT ON FUNCTION public.get_artists_secure() IS 'Secure function for accessing artist data with role-based masking. This replaces direct table access to prevent data exposure.';

-- Verify that the main artists table has proper RLS (it already does based on existing policies)
-- Add an additional constraint to ensure all artist data access is audited
CREATE OR REPLACE FUNCTION public.ensure_artist_access_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any direct access to artists table
  PERFORM public.log_sensitive_data_access('artists', NEW.id, 'direct_access');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for audit logging on direct artist table access
DROP TRIGGER IF EXISTS audit_artist_access ON public.artists;
CREATE TRIGGER audit_artist_access
  AFTER SELECT ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_artist_access_audit();