
-- Create rate limiting table for Edge Functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  requests integer DEFAULT 0,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(key)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limits FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);

-- Create function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key text,
  p_max_requests integer DEFAULT 100,
  p_window_seconds integer DEFAULT 3600
) RETURNS boolean AS $$
DECLARE
  v_record record;
  v_window_start timestamp with time zone;
  v_now timestamp with time zone := now();
BEGIN
  v_window_start := v_now - (p_window_seconds || ' seconds')::interval;
  
  -- Try to get existing record
  SELECT * INTO v_record FROM rate_limits WHERE key = p_key FOR UPDATE;
  
  IF v_record IS NULL THEN
    -- No record exists, create one
    INSERT INTO rate_limits (key, requests, window_start)
    VALUES (p_key, 1, v_now);
    RETURN true;
  END IF;
  
  -- Check if window has expired
  IF v_record.window_start < v_window_start THEN
    -- Reset the window
    UPDATE rate_limits 
    SET requests = 1, window_start = v_now 
    WHERE key = p_key;
    RETURN true;
  END IF;
  
  -- Check if limit exceeded
  IF v_record.requests >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits 
  SET requests = requests + 1 
  WHERE key = p_key;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;
