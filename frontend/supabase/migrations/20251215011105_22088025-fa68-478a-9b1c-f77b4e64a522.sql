
-- ========================================
-- 1. FIX PROFILES TABLE - Stricter RLS
-- ========================================

-- Drop existing profiles policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin_only" ON public.profiles;

-- Create separate, explicit policies
-- Users can ONLY see their own profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admin has separate explicit policy to see all
CREATE POLICY "profiles_select_admin"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Admin can update any profile
CREATE POLICY "profiles_update_admin"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admin can delete profiles
CREATE POLICY "profiles_delete_admin"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- ========================================
-- 2. FIX ARTISTS TABLE - Remove sensitive data, add phone/email to sensitive table
-- ========================================

-- First, add phone and email columns to artist_sensitive_data if not exist
ALTER TABLE public.artist_sensitive_data 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text;

-- Migrate phone and email data to sensitive table
UPDATE public.artist_sensitive_data asd
SET 
  phone = a.phone,
  email = a.email
FROM public.artists a
WHERE asd.artist_id = a.id
AND (a.phone IS NOT NULL OR a.email IS NOT NULL);

-- Insert records for artists that have phone/email but no sensitive_data record yet
INSERT INTO public.artist_sensitive_data (artist_id, phone, email)
SELECT a.id, a.phone, a.email
FROM public.artists a
WHERE NOT EXISTS (SELECT 1 FROM public.artist_sensitive_data asd WHERE asd.artist_id = a.id)
AND (a.phone IS NOT NULL OR a.email IS NOT NULL);

-- Now drop sensitive columns from artists table
-- Note: We keep phone/email for non-sensitive contact info but add new columns
ALTER TABLE public.artists 
DROP COLUMN IF EXISTS cpf_cnpj,
DROP COLUMN IF EXISTS rg,
DROP COLUMN IF EXISTS full_address,
DROP COLUMN IF EXISTS bank,
DROP COLUMN IF EXISTS agency,
DROP COLUMN IF EXISTS account,
DROP COLUMN IF EXISTS pix_key,
DROP COLUMN IF EXISTS account_holder;

-- Remove financeiro access to sensitive data (admin-only)
DROP POLICY IF EXISTS "Financeiro can view sensitive artist data" ON public.artist_sensitive_data;

-- Clean up duplicate artist policies
DROP POLICY IF EXISTS "Admin and manager can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Admin and manager can update artists" ON public.artists;
DROP POLICY IF EXISTS "Admin and manager can view artists" ON public.artists;
DROP POLICY IF EXISTS "Admin can delete artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can insert artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can update artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can view artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can delete artists" ON public.artists;

-- Create clean artist policies (managers see non-sensitive data only)
CREATE POLICY "artists_select_admin_manager"
ON public.artists
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artists_insert_admin_manager"
ON public.artists
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artists_update_admin_manager"
ON public.artists
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artists_delete_admin_only"
ON public.artists
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- ========================================
-- 3. FIX AGENDA_EVENTS - Artist-based isolation
-- ========================================

-- Create user_artists linking table for artist access control
CREATE TABLE IF NOT EXISTS public.user_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  access_level text DEFAULT 'view',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, artist_id)
);

ALTER TABLE public.user_artists ENABLE ROW LEVEL SECURITY;

-- RLS for user_artists
CREATE POLICY "user_artists_select_own_or_admin"
ON public.user_artists
FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_artists_manage_admin"
ON public.user_artists
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if user has access to artist
CREATE OR REPLACE FUNCTION public.user_can_access_artist(_user_id uuid, _artist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_artists
    WHERE user_id = _user_id AND artist_id = _artist_id
  )
  OR public.has_role(_user_id, 'admin'::app_role)
  OR public.has_role(_user_id, 'manager'::app_role)
$$;

-- Drop existing agenda_events policies
DROP POLICY IF EXISTS "Authenticated users can delete agenda_events" ON public.agenda_events;
DROP POLICY IF EXISTS "Authenticated users can insert agenda_events" ON public.agenda_events;
DROP POLICY IF EXISTS "Authenticated users can update agenda_events" ON public.agenda_events;
DROP POLICY IF EXISTS "Authenticated users can view agenda_events" ON public.agenda_events;

-- Create artist-based agenda_events policies
-- Admin/Manager can see all events
CREATE POLICY "agenda_events_select_admin_manager"
ON public.agenda_events
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Users can only see events for artists they're linked to
CREATE POLICY "agenda_events_select_linked_artist"
ON public.agenda_events
FOR SELECT
USING (
  artist_id IS NULL 
  OR user_can_access_artist(auth.uid(), artist_id)
);

-- Only admin/manager can insert events
CREATE POLICY "agenda_events_insert_admin_manager"
ON public.agenda_events
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Only admin/manager can update events
CREATE POLICY "agenda_events_update_admin_manager"
ON public.agenda_events
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Only admin can delete events
CREATE POLICY "agenda_events_delete_admin"
ON public.agenda_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_artists_user_id ON public.user_artists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_artists_artist_id ON public.user_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_artist_id ON public.agenda_events(artist_id);
