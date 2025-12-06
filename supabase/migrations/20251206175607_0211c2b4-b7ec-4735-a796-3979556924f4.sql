-- Create phonograms table for sound recording registrations
CREATE TABLE public.phonograms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  work_id UUID REFERENCES public.music_registry(id),
  isrc TEXT,
  artist_id UUID REFERENCES public.artists(id),
  recording_date DATE,
  recording_studio TEXT,
  recording_location TEXT,
  duration INTEGER,
  genre TEXT,
  language TEXT DEFAULT 'portugues',
  version_type TEXT DEFAULT 'original',
  is_remix BOOLEAN DEFAULT false,
  remix_artist TEXT,
  master_owner TEXT,
  label TEXT,
  status TEXT DEFAULT 'pendente',
  participants JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phonograms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view phonograms" 
ON public.phonograms 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert phonograms" 
ON public.phonograms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update phonograms" 
ON public.phonograms 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete phonograms" 
ON public.phonograms 
FOR DELETE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_phonograms_updated_at
BEFORE UPDATE ON public.phonograms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();