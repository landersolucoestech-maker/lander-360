-- Create agenda/events table
CREATE TABLE public.agenda_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  event_type TEXT CHECK (event_type IN ('show', 'gravacao', 'ensaio', 'entrevista')) NOT NULL,
  status TEXT CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'realizado')) DEFAULT 'agendado',
  observations TEXT,
  artist_id UUID REFERENCES public.artists(id),
  checklist JSONB,
  technical_sheet JSONB,
  google_calendar_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

-- Create policies for agenda events
CREATE POLICY "Authenticated users can manage agenda events" 
ON public.agenda_events 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_agenda_events_updated_at
BEFORE UPDATE ON public.agenda_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();