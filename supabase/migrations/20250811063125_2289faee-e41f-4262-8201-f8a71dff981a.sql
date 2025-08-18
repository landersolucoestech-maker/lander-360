-- Add new fields to agenda_events table for artist-related events
ALTER TABLE public.agenda_events 
ADD COLUMN venue_name text,
ADD COLUMN venue_address text,
ADD COLUMN venue_contact text,
ADD COLUMN venue_capacity integer,
ADD COLUMN ticket_price numeric,
ADD COLUMN expected_audience integer;