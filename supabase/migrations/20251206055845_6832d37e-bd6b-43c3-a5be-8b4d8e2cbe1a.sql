-- Create table for email OTP codes
CREATE TABLE public.email_otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Users can only view their own OTP codes
CREATE POLICY "Users can view their own OTP codes" 
ON public.email_otp_codes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own OTP codes
CREATE POLICY "Users can insert their own OTP codes" 
ON public.email_otp_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own OTP codes
CREATE POLICY "Users can update their own OTP codes" 
ON public.email_otp_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own OTP codes
CREATE POLICY "Users can delete their own OTP codes" 
ON public.email_otp_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_email_otp_user_code ON public.email_otp_codes(user_id, code, expires_at);

-- Create table for user 2FA settings
CREATE TABLE public.user_2fa_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email_2fa_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own 2FA settings
CREATE POLICY "Users can view their own 2FA settings" 
ON public.user_2fa_settings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own 2FA settings
CREATE POLICY "Users can insert their own 2FA settings" 
ON public.user_2fa_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own 2FA settings
CREATE POLICY "Users can update their own 2FA settings" 
ON public.user_2fa_settings 
FOR UPDATE 
USING (auth.uid() = user_id);