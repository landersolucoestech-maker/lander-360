-- Create table for pending shares (músicas que precisam receber share)
CREATE TABLE public.pending_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_title TEXT NOT NULL,
  artist_name TEXT,
  participant_name TEXT NOT NULL,
  participant_role TEXT DEFAULT 'Compositor',
  share_percentage NUMERIC,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view pending_shares"
ON public.pending_shares FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert pending_shares"
ON public.pending_shares FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update pending_shares"
ON public.pending_shares FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete pending_shares"
ON public.pending_shares FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_pending_shares_updated_at
BEFORE UPDATE ON public.pending_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();