-- Add missing columns to contracts table
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'recording';
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS effective_from DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS effective_to DATE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS royalty_rate DECIMAL(5,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS advance_amount DECIMAL(12,2);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to financial_transactions table
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_display TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions TEXT[];

-- Add missing columns to marketing_campaigns table
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0;
ALTER TABLE public.marketing_campaigns ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2) DEFAULT 0;

-- Create music_registry table
CREATE TABLE IF NOT EXISTS public.music_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  isrc TEXT,
  iswc TEXT,
  release_date DATE,
  genre TEXT,
  duration INTEGER,
  bpm INTEGER,
  key TEXT,
  writers TEXT[],
  publishers TEXT[],
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create social_media_metrics table
CREATE TABLE IF NOT EXISTS public.social_media_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value INTEGER DEFAULT 0,
  date DATE NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_document TEXT,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.music_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for music_registry
CREATE POLICY "Authenticated users can view music_registry" ON public.music_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert music_registry" ON public.music_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update music_registry" ON public.music_registry FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete music_registry" ON public.music_registry FOR DELETE TO authenticated USING (true);

-- Create RLS policies for social_media_metrics
CREATE POLICY "Authenticated users can view social_media_metrics" ON public.social_media_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert social_media_metrics" ON public.social_media_metrics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update social_media_metrics" ON public.social_media_metrics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete social_media_metrics" ON public.social_media_metrics FOR DELETE TO authenticated USING (true);

-- Create RLS policies for invoices
CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_music_registry_updated_at BEFORE UPDATE ON public.music_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();