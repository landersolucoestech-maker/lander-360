-- Create table for pending email changes
CREATE TABLE public.pending_email_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_email_changes ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own pending changes
CREATE POLICY "Users can view their own pending email changes"
ON public.pending_email_changes
FOR SELECT
USING (auth.uid() = user_id);

-- Only allow service role to insert/update/delete (via edge functions)
CREATE POLICY "Service role can manage pending email changes"
ON public.pending_email_changes
FOR ALL
USING (auth.role() = 'service_role');

-- Create index for faster token lookups
CREATE INDEX idx_pending_email_changes_token ON public.pending_email_changes(token);
CREATE INDEX idx_pending_email_changes_user_id ON public.pending_email_changes(user_id);