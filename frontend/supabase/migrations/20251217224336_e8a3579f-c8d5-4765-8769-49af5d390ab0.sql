
-- Tabela de licenças sync
CREATE TABLE public.sync_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  license_type TEXT NOT NULL DEFAULT 'sync', -- sync, master, both
  media_type TEXT, -- tv, cinema, ads, games, streaming, social
  territory TEXT DEFAULT 'worldwide',
  duration TEXT, -- perpetuo, 1_ano, 2_anos, 5_anos
  exclusivity BOOLEAN DEFAULT false,
  
  -- Relacionamentos
  artist_id UUID REFERENCES public.artists(id),
  music_registry_id UUID REFERENCES public.music_registry(id),
  phonogram_id UUID REFERENCES public.phonograms(id),
  contact_id UUID REFERENCES public.crm_contacts(id),
  
  -- Valores
  license_fee NUMERIC,
  advance_payment NUMERIC,
  royalty_percentage NUMERIC,
  
  -- Status e datas
  status TEXT DEFAULT 'proposta', -- proposta, negociacao, aprovado, ativo, expirado, cancelado
  proposal_date DATE,
  start_date DATE,
  end_date DATE,
  signed_date DATE,
  
  -- Detalhes do uso
  usage_description TEXT,
  project_name TEXT,
  client_name TEXT,
  client_company TEXT,
  
  -- Documentos
  contract_url TEXT,
  brief_url TEXT,
  
  -- Metadados
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_licenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "sync_licenses_select_admin_manager" ON public.sync_licenses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "sync_licenses_insert_admin_manager" ON public.sync_licenses
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "sync_licenses_update_admin_manager" ON public.sync_licenses
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "sync_licenses_delete_admin" ON public.sync_licenses
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_sync_licenses_updated_at
  BEFORE UPDATE ON public.sync_licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de metas por artista
CREATE TABLE public.artist_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL, -- streams, followers, revenue, releases, shows, engagement
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- number, currency, percentage
  platform TEXT, -- spotify, instagram, youtube, all
  period TEXT, -- monthly, quarterly, yearly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, failed, paused
  priority TEXT DEFAULT 'medium', -- low, medium, high
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "artist_goals_select_admin_manager" ON public.artist_goals
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artist_goals_insert_admin_manager" ON public.artist_goals
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artist_goals_update_admin_manager" ON public.artist_goals
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "artist_goals_delete_admin" ON public.artist_goals
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_artist_goals_updated_at
  BEFORE UPDATE ON public.artist_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de campanhas de tráfego pago
CREATE TABLE public.paid_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL, -- meta, google, tiktok, spotify, youtube
  campaign_type TEXT, -- awareness, traffic, conversion, engagement
  
  -- Relacionamentos
  artist_id UUID REFERENCES public.artists(id),
  release_id UUID REFERENCES public.releases(id),
  marketing_campaign_id UUID REFERENCES public.marketing_campaigns(id),
  
  -- Orçamento
  budget NUMERIC,
  daily_budget NUMERIC,
  spent NUMERIC DEFAULT 0,
  
  -- Métricas
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cpm NUMERIC,
  cpc NUMERIC,
  ctr NUMERIC,
  roas NUMERIC,
  
  -- Datas
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed
  
  -- Links e assets
  ad_url TEXT,
  landing_url TEXT,
  creative_urls JSONB DEFAULT '[]',
  
  -- Segmentação
  target_audience JSONB,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paid_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "paid_campaigns_select" ON public.paid_campaigns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "paid_campaigns_insert" ON public.paid_campaigns
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "paid_campaigns_update" ON public.paid_campaigns
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "paid_campaigns_delete" ON public.paid_campaigns
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_paid_campaigns_updated_at
  BEFORE UPDATE ON public.paid_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de influenciadores
CREATE TABLE public.influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT,
  platform TEXT NOT NULL, -- instagram, tiktok, youtube, twitter
  followers INTEGER,
  engagement_rate NUMERIC,
  niche TEXT, -- music, lifestyle, gaming, fashion
  contact_email TEXT,
  contact_phone TEXT,
  price_per_post NUMERIC,
  price_per_story NUMERIC,
  price_per_video NUMERIC,
  notes TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, blocked
  last_collaboration DATE,
  total_collaborations INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "influencers_select" ON public.influencers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "influencers_insert" ON public.influencers
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "influencers_update" ON public.influencers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'marketing'::app_role));

CREATE POLICY "influencers_delete" ON public.influencers
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de takedowns
CREATE TABLE public.takedowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  reason TEXT NOT NULL, -- copyright, content_id, trademark, request, legal
  platform TEXT NOT NULL, -- youtube, spotify, apple, deezer, tiktok, instagram, other
  
  -- Relacionamentos
  artist_id UUID REFERENCES public.artists(id),
  release_id UUID REFERENCES public.releases(id),
  music_registry_id UUID REFERENCES public.music_registry(id),
  
  -- Detalhes
  content_url TEXT,
  infringing_party TEXT,
  description TEXT,
  
  -- Status e datas
  status TEXT DEFAULT 'pending', -- pending, submitted, processing, resolved, rejected
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_date DATE,
  resolved_date DATE,
  
  -- Documentação
  evidence_urls JSONB DEFAULT '[]',
  response_notes TEXT,
  
  -- Caso seja um claim contra nós
  is_incoming BOOLEAN DEFAULT false,
  dispute_status TEXT, -- none, disputed, won, lost
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.takedowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "takedowns_select_admin_manager" ON public.takedowns
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "takedowns_insert_admin_manager" ON public.takedowns
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "takedowns_update_admin_manager" ON public.takedowns
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "takedowns_delete_admin" ON public.takedowns
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_takedowns_updated_at
  BEFORE UPDATE ON public.takedowns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_sync_licenses_artist ON public.sync_licenses(artist_id);
CREATE INDEX idx_sync_licenses_status ON public.sync_licenses(status);
CREATE INDEX idx_artist_goals_artist ON public.artist_goals(artist_id);
CREATE INDEX idx_artist_goals_status ON public.artist_goals(status);
CREATE INDEX idx_paid_campaigns_artist ON public.paid_campaigns(artist_id);
CREATE INDEX idx_paid_campaigns_status ON public.paid_campaigns(status);
CREATE INDEX idx_takedowns_artist ON public.takedowns(artist_id);
CREATE INDEX idx_takedowns_status ON public.takedowns(status);
