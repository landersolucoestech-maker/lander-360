-- ============================================
-- LANDER 360º - SCRIPT DE MIGRAÇÃO COMPLETO
-- Execute este script no SQL Editor do seu Supabase
-- ============================================

-- ============================================
-- 1. ENUM TYPES
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- ============================================
-- 2. FUNCTIONS
-- ============================================

-- Function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. TABLES
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  roles text[],
  permissions text[],
  role_display text,
  sector text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Artists table
CREATE TABLE public.artists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  stage_name text,
  full_name text,
  legal_name text,
  email text,
  phone text,
  genre text,
  bio text,
  image_url text,
  contract_status text DEFAULT 'active',
  spotify_url text,
  instagram_url text,
  youtube_url text,
  spotify_id text,
  youtube_channel_id text,
  instagram text,
  tiktok text,
  soundcloud text,
  birth_date date,
  cpf_cnpj text,
  rg text,
  full_address text,
  bank text,
  agency text,
  account text,
  pix_key text,
  account_holder text,
  profile_type text,
  manager_name text,
  manager_phone text,
  manager_email text,
  distributors text[],
  distributor_emails jsonb DEFAULT '{}'::jsonb,
  documents_url text,
  observations text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning',
  start_date date,
  end_date date,
  budget numeric,
  audio_files jsonb DEFAULT '[]'::jsonb,
  artist_id uuid REFERENCES public.artists(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Contracts table
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft',
  contract_type text DEFAULT 'recording',
  client_type text,
  service_type text,
  responsible_person text,
  contractor_contact text,
  start_date date,
  end_date date,
  effective_from date,
  effective_to date,
  value numeric,
  fixed_value numeric,
  royalties_percentage numeric,
  royalty_rate numeric,
  advance_amount numeric,
  payment_type text,
  registry_office boolean DEFAULT false,
  registry_date date,
  document_url text,
  notes text,
  terms text,
  observations text,
  artist_id uuid REFERENCES public.artists(id),
  project_id uuid REFERENCES public.projects(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Releases table
CREATE TABLE public.releases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text DEFAULT 'single',
  release_type text,
  status text DEFAULT 'planning',
  release_date date,
  cover_url text,
  genre text,
  language text,
  label text,
  copyright text,
  distributors text[] DEFAULT '{}'::text[],
  tracks jsonb DEFAULT '[]'::jsonb,
  artist_id uuid REFERENCES public.artists(id),
  project_id uuid REFERENCES public.projects(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tracks table
CREATE TABLE public.tracks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  track_number integer,
  duration integer,
  isrc text,
  primary_genre text,
  release_id uuid REFERENCES public.releases(id),
  artist_id uuid REFERENCES public.artists(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Compositions table
CREATE TABLE public.compositions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  iswc text,
  writers text[],
  publishers text[],
  track_id uuid REFERENCES public.tracks(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Contributors table
CREATE TABLE public.contributors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  track_id uuid REFERENCES public.tracks(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Distributions table
CREATE TABLE public.distributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  status text DEFAULT 'pending',
  distributed_at timestamp with time zone,
  release_id uuid REFERENCES public.releases(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Music Registry table
CREATE TABLE public.music_registry (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  isrc text,
  iswc text,
  abramus_code text,
  ecad_code text,
  genre text,
  key text,
  bpm integer,
  duration integer,
  release_date date,
  status text DEFAULT 'draft',
  writers text[],
  publishers text[],
  participants jsonb DEFAULT '[]'::jsonb,
  artist_id uuid REFERENCES public.artists(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Phonograms table
CREATE TABLE public.phonograms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  isrc text,
  status text DEFAULT 'pendente',
  genre text,
  language text DEFAULT 'portugues',
  version_type text DEFAULT 'original',
  duration integer,
  recording_date date,
  recording_location text,
  recording_studio text,
  master_owner text,
  label text,
  is_remix boolean DEFAULT false,
  remix_artist text,
  audio_url text,
  participants jsonb DEFAULT '[]'::jsonb,
  work_id uuid REFERENCES public.music_registry(id),
  artist_id uuid REFERENCES public.artists(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Agenda Events table
CREATE TABLE public.agenda_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_type text DEFAULT 'meeting',
  status text DEFAULT 'agendado',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  start_time text,
  end_time text,
  location text,
  venue_name text,
  venue_address text,
  venue_contact text,
  venue_capacity integer,
  ticket_price numeric,
  expected_audience integer,
  observations text,
  artist_id uuid REFERENCES public.artists(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- CRM Contacts table
CREATE TABLE public.crm_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  position text,
  contact_type text DEFAULT 'lead',
  status text,
  priority text,
  next_action text,
  notes text,
  image_url text,
  document text,
  address text,
  city text,
  state text,
  zip_code text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Financial Transactions table
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  transaction_date date,
  status text DEFAULT 'pending',
  category text,
  transaction_type text,
  payment_method text,
  responsible_by text,
  authorized_by text,
  attachment_url text,
  observations text,
  artist_id uuid REFERENCES public.artists(id),
  project_id uuid REFERENCES public.projects(id),
  contract_id uuid REFERENCES public.contracts(id),
  crm_contact_id uuid REFERENCES public.crm_contacts(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_document text,
  description text,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'draft',
  issue_date date NOT NULL,
  due_date date,
  paid_date date,
  project_id uuid REFERENCES public.projects(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE public.inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  location text,
  sector text,
  quantity integer DEFAULT 0,
  unit_value numeric,
  status text DEFAULT 'available',
  responsible text,
  purchase_location text,
  invoice_number text,
  entry_date date,
  observations text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date date,
  assigned_to uuid,
  project_id uuid REFERENCES public.projects(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Marketing Campaigns table
CREATE TABLE public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  status text DEFAULT 'planning',
  start_date date,
  end_date date,
  budget numeric,
  spent numeric DEFAULT 0,
  reach integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  ctr numeric DEFAULT 0,
  cpc numeric DEFAULT 0,
  roas numeric DEFAULT 0,
  artist_id uuid REFERENCES public.artists(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Marketing Briefings table
CREATE TABLE public.marketing_briefings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content text,
  campaign text,
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  target_audience text,
  budget numeric,
  deadline date,
  status text DEFAULT 'draft',
  priority text DEFAULT 'medium',
  deliverables text[],
  created_by uuid,
  created_by_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Marketing Content table
CREATE TABLE public.marketing_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content_type text,
  content_url text,
  status text DEFAULT 'draft',
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Marketing Tasks table
CREATE TABLE public.marketing_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  category text,
  campaign text,
  due_date date,
  progress integer DEFAULT 0,
  assigned_to uuid,
  assignee_name text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Social Media Metrics table
CREATE TABLE public.social_media_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  metric_type text NOT NULL,
  date date NOT NULL,
  value integer DEFAULT 0,
  followers integer DEFAULT 0,
  reach integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  posts_count integer DEFAULT 0,
  stories_count integer DEFAULT 0,
  followers_growth numeric DEFAULT 0,
  engagement_growth numeric DEFAULT 0,
  reach_growth numeric DEFAULT 0,
  artist_id uuid REFERENCES public.artists(id),
  campaign_id uuid REFERENCES public.marketing_campaigns(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Login History table
CREATE TABLE public.login_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  login_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  browser text,
  device_type text,
  location text
);

-- Login Attempts table
CREATE TABLE public.login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User 2FA Settings table
CREATE TABLE public.user_2fa_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email_2fa_enabled boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Email OTP Codes table
CREATE TABLE public.email_otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Pending Email Changes table
CREATE TABLE public.pending_email_changes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  current_email text NOT NULL,
  new_email text NOT NULL,
  token text NOT NULL,
  confirmed_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Security Audit Logs table
CREATE TABLE public.security_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  setting_type text NOT NULL,
  old_value text,
  new_value text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Sessions table
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  browser text,
  device_type text,
  location text,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  terminated_at timestamp with time zone,
  terminated_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============================================
-- 4. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phonograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_email_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Artists policies
CREATE POLICY "Authenticated users can view artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert artists" ON public.artists FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can update artists" ON public.artists FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete artists" ON public.artists FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Projects policies
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert projects" ON public.projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can update projects" ON public.projects FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Generic authenticated user policies for other tables
CREATE POLICY "Authenticated users can view contracts" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert contracts" ON public.contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update contracts" ON public.contracts FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete contracts" ON public.contracts FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view releases" ON public.releases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert releases" ON public.releases FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update releases" ON public.releases FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete releases" ON public.releases FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tracks" ON public.tracks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update tracks" ON public.tracks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete tracks" ON public.tracks FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view compositions" ON public.compositions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert compositions" ON public.compositions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update compositions" ON public.compositions FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete compositions" ON public.compositions FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view contributors" ON public.contributors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert contributors" ON public.contributors FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update contributors" ON public.contributors FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete contributors" ON public.contributors FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view distributions" ON public.distributions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert distributions" ON public.distributions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update distributions" ON public.distributions FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete distributions" ON public.distributions FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view music_registry" ON public.music_registry FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert music_registry" ON public.music_registry FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update music_registry" ON public.music_registry FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete music_registry" ON public.music_registry FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view phonograms" ON public.phonograms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert phonograms" ON public.phonograms FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update phonograms" ON public.phonograms FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete phonograms" ON public.phonograms FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view agenda_events" ON public.agenda_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert agenda_events" ON public.agenda_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update agenda_events" ON public.agenda_events FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete agenda_events" ON public.agenda_events FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view crm_contacts" ON public.crm_contacts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert crm_contacts" ON public.crm_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update crm_contacts" ON public.crm_contacts FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete crm_contacts" ON public.crm_contacts FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view financial_transactions" ON public.financial_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert financial_transactions" ON public.financial_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update financial_transactions" ON public.financial_transactions FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete financial_transactions" ON public.financial_transactions FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete invoices" ON public.invoices FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert marketing_campaigns" ON public.marketing_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete marketing_campaigns" ON public.marketing_campaigns FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view marketing_briefings" ON public.marketing_briefings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert marketing_briefings" ON public.marketing_briefings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_briefings" ON public.marketing_briefings FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete marketing_briefings" ON public.marketing_briefings FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view marketing_content" ON public.marketing_content FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert marketing_content" ON public.marketing_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_content" ON public.marketing_content FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete marketing_content" ON public.marketing_content FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view marketing_tasks" ON public.marketing_tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert marketing_tasks" ON public.marketing_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_tasks" ON public.marketing_tasks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete marketing_tasks" ON public.marketing_tasks FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view social_media_metrics" ON public.social_media_metrics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert social_media_metrics" ON public.social_media_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update social_media_metrics" ON public.social_media_metrics FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete social_media_metrics" ON public.social_media_metrics FOR DELETE USING (true);

-- Login history policies
CREATE POLICY "Users can view their own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow insert for authenticated users" ON public.login_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Login attempts policies (allow anonymous for login flow)
CREATE POLICY "Allow anonymous select on login_attempts" ON public.login_attempts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on login_attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update on login_attempts" ON public.login_attempts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete on login_attempts" ON public.login_attempts FOR DELETE USING (true);
CREATE POLICY "Allow authenticated select on login_attempts" ON public.login_attempts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on login_attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on login_attempts" ON public.login_attempts FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on login_attempts" ON public.login_attempts FOR DELETE USING (true);

-- User 2FA settings policies
CREATE POLICY "Users can view their own 2FA settings" ON public.user_2fa_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own 2FA settings" ON public.user_2fa_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own 2FA settings" ON public.user_2fa_settings FOR UPDATE USING (auth.uid() = user_id);

-- Email OTP codes policies
CREATE POLICY "Users can view their own OTP codes" ON public.email_otp_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own OTP codes" ON public.email_otp_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own OTP codes" ON public.email_otp_codes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own OTP codes" ON public.email_otp_codes FOR DELETE USING (auth.uid() = user_id);

-- Pending email changes policies
CREATE POLICY "Users can view their own pending email changes" ON public.pending_email_changes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage pending email changes" ON public.pending_email_changes FOR ALL USING (auth.role() = 'service_role');

-- Security audit logs policies
CREATE POLICY "Users can view their own audit logs" ON public.security_audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all audit logs" ON public.security_audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert their own audit logs" ON public.security_audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Admins can view all sessions" ON public.user_sessions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all sessions" ON public.user_sessions FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('artist-documents', 'artist-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-audio', 'project-audio', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('release-covers', 'release-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('crm-contacts', 'crm-contacts', true);

-- ============================================
-- 8. STORAGE POLICIES
-- ============================================

-- Avatars bucket (public read, authenticated write)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Artist documents bucket (authenticated only)
CREATE POLICY "Authenticated users can view artist documents" ON storage.objects FOR SELECT USING (bucket_id = 'artist-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload artist documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artist-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update artist documents" ON storage.objects FOR UPDATE USING (bucket_id = 'artist-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete artist documents" ON storage.objects FOR DELETE USING (bucket_id = 'artist-documents' AND auth.role() = 'authenticated');

-- Project audio bucket (authenticated only)
CREATE POLICY "Authenticated users can view project audio" ON storage.objects FOR SELECT USING (bucket_id = 'project-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload project audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update project audio" ON storage.objects FOR UPDATE USING (bucket_id = 'project-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete project audio" ON storage.objects FOR DELETE USING (bucket_id = 'project-audio' AND auth.role() = 'authenticated');

-- Release covers bucket (public read, authenticated write)
CREATE POLICY "Release covers are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'release-covers');
CREATE POLICY "Authenticated users can upload release covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'release-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update release covers" ON storage.objects FOR UPDATE USING (bucket_id = 'release-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete release covers" ON storage.objects FOR DELETE USING (bucket_id = 'release-covers' AND auth.role() = 'authenticated');

-- CRM contacts bucket (public read, authenticated write)
CREATE POLICY "CRM contact images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'crm-contacts');
CREATE POLICY "Authenticated users can upload CRM contact images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'crm-contacts' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update CRM contact images" ON storage.objects FOR UPDATE USING (bucket_id = 'crm-contacts' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete CRM contact images" ON storage.objects FOR DELETE USING (bucket_id = 'crm-contacts' AND auth.role() = 'authenticated');

-- ============================================
-- FIM DO SCRIPT
-- ============================================
