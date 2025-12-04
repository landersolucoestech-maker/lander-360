-- Fix security warning: update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create agenda_events table
CREATE TABLE public.agenda_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  event_type TEXT DEFAULT 'meeting',
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create crm_contacts table
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  contact_type TEXT DEFAULT 'lead',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  category TEXT,
  location TEXT,
  status TEXT DEFAULT 'available',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  value DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create releases table
CREATE TABLE public.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  release_date DATE,
  type TEXT DEFAULT 'single',
  status TEXT DEFAULT 'planning',
  cover_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  duration INTEGER,
  isrc TEXT,
  track_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create marketing tables
CREATE TABLE public.marketing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'planning',
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.marketing_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE public.marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT,
  content_url TEXT,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create contributors table
CREATE TABLE public.contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create compositions table
CREATE TABLE public.compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  writers TEXT[],
  publishers TEXT[],
  iswc TEXT,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create distributions table
CREATE TABLE public.distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  distributed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view agenda_events" ON public.agenda_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert agenda_events" ON public.agenda_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update agenda_events" ON public.agenda_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete agenda_events" ON public.agenda_events FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view crm_contacts" ON public.crm_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert crm_contacts" ON public.crm_contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update crm_contacts" ON public.crm_contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete crm_contacts" ON public.crm_contacts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view financial_transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert financial_transactions" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update financial_transactions" ON public.financial_transactions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete financial_transactions" ON public.financial_transactions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inventory" ON public.inventory FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete inventory" ON public.inventory FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view releases" ON public.releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert releases" ON public.releases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update releases" ON public.releases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete releases" ON public.releases FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view tracks" ON public.tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tracks" ON public.tracks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tracks" ON public.tracks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tracks" ON public.tracks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view marketing_tasks" ON public.marketing_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert marketing_tasks" ON public.marketing_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_tasks" ON public.marketing_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete marketing_tasks" ON public.marketing_tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view marketing_campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert marketing_campaigns" ON public.marketing_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete marketing_campaigns" ON public.marketing_campaigns FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view marketing_briefings" ON public.marketing_briefings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert marketing_briefings" ON public.marketing_briefings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_briefings" ON public.marketing_briefings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete marketing_briefings" ON public.marketing_briefings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view marketing_content" ON public.marketing_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert marketing_content" ON public.marketing_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update marketing_content" ON public.marketing_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete marketing_content" ON public.marketing_content FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view contributors" ON public.contributors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert contributors" ON public.contributors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update contributors" ON public.contributors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete contributors" ON public.contributors FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view compositions" ON public.compositions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert compositions" ON public.compositions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update compositions" ON public.compositions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete compositions" ON public.compositions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view distributions" ON public.distributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert distributions" ON public.distributions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update distributions" ON public.distributions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete distributions" ON public.distributions FOR DELETE TO authenticated USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_agenda_events_updated_at BEFORE UPDATE ON public.agenda_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON public.releases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_tasks_updated_at BEFORE UPDATE ON public.marketing_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_briefings_updated_at BEFORE UPDATE ON public.marketing_briefings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_content_updated_at BEFORE UPDATE ON public.marketing_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();