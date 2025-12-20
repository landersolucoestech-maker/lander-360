-- Remove anonymous access policies from login_attempts table to prevent lockout bypass

-- Drop dangerous anonymous policies
DROP POLICY IF EXISTS "Allow anonymous delete on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow anonymous select on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow anonymous update on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow anonymous insert on login_attempts" ON public.login_attempts;

-- Keep authenticated policies but restrict them
-- Only the system/service role should manage login attempts, not regular users
DROP POLICY IF EXISTS "Allow authenticated delete on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow authenticated select on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow authenticated update on login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow authenticated insert on login_attempts" ON public.login_attempts;

-- Create restricted policies: only admins can view login attempts for security monitoring
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Service role handles insert/update/delete via edge functions or server-side code
-- No direct user access to modify login_attempts table