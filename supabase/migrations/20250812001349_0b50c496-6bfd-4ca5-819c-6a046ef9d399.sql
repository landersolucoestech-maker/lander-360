-- Security fix: Remove artists_secure table if it exists and ensure proper access control
-- The artists_secure table should not exist as a real table since we have the get_artists_secure() function

-- Drop the artists_secure table if it exists (it's redundant and insecure)
DROP TABLE IF EXISTS public.artists_secure;

-- Add a comment to document the security decision
COMMENT ON FUNCTION public.get_artists_secure() IS 'Secure function for accessing artist data with role-based masking. This replaces direct table access to prevent data exposure.';

-- The main artists table already has proper RLS policies:
-- - Secure artist data access (SELECT)
-- - Admins and managers can create/update artists (INSERT/UPDATE) 
-- - Only admins can delete artists (DELETE)

-- No additional changes needed as the security is properly implemented through:
-- 1. RLS policies on the main artists table
-- 2. The get_artists_secure() function that masks data based on user roles
-- 3. Audit logging through existing functions