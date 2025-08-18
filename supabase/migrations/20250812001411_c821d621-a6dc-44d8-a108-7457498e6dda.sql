-- Security fix: Remove artists_secure view if it exists 
-- The artists_secure view should not exist as we have the get_artists_secure() function

-- Drop the artists_secure view if it exists (it's redundant and potentially insecure)
DROP VIEW IF EXISTS public.artists_secure;

-- Add a comment to document the security decision
COMMENT ON FUNCTION public.get_artists_secure() IS 'Secure function for accessing artist data with role-based masking. This replaces direct table access to prevent data exposure.';

-- Security is properly implemented through:
-- 1. RLS policies on the main artists table
-- 2. The get_artists_secure() function that masks data based on user roles  
-- 3. Audit logging through existing functions