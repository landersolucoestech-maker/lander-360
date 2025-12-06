-- Create table to track failed login attempts
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email for efficient lookups
CREATE UNIQUE INDEX idx_login_attempts_email ON public.login_attempts(email);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for login attempt tracking (needed before auth)
CREATE POLICY "Allow anonymous insert on login_attempts"
ON public.login_attempts
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous select on login_attempts"
ON public.login_attempts
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous update on login_attempts"
ON public.login_attempts
FOR UPDATE
TO anon
USING (true);

CREATE POLICY "Allow anonymous delete on login_attempts"
ON public.login_attempts
FOR DELETE
TO anon
USING (true);

-- Also allow authenticated users
CREATE POLICY "Allow authenticated insert on login_attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select on login_attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update on login_attempts"
ON public.login_attempts
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete on login_attempts"
ON public.login_attempts
FOR DELETE
TO authenticated
USING (true);