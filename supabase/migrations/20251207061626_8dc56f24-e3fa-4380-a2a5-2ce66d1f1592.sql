-- Add missing columns to agenda_events table
ALTER TABLE public.agenda_events
ADD COLUMN IF NOT EXISTS status text DEFAULT 'agendado',
ADD COLUMN IF NOT EXISTS start_time text,
ADD COLUMN IF NOT EXISTS end_time text,
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS venue_address text,
ADD COLUMN IF NOT EXISTS venue_contact text,
ADD COLUMN IF NOT EXISTS venue_capacity integer,
ADD COLUMN IF NOT EXISTS ticket_price numeric,
ADD COLUMN IF NOT EXISTS expected_audience integer,
ADD COLUMN IF NOT EXISTS observations text;