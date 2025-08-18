-- Create marketing_tasks table
CREATE TABLE public.marketing_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  responsible_person TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  attachments JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_content_calendar table
CREATE TABLE public.marketing_content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  post_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  publish_date DATE NOT NULL,
  publish_time TIME,
  caption TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'cancelled')),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  responsible_person TEXT,
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_metrics table
CREATE TABLE public.marketing_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.marketing_content_calendar(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  metric_date DATE NOT NULL,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0, -- Click Through Rate
  cpc NUMERIC(10,2) DEFAULT 0, -- Cost Per Click
  roi NUMERIC(10,2) DEFAULT 0, -- Return on Investment
  engagement_rate NUMERIC(5,4) DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost NUMERIC(10,2) DEFAULT 0,
  additional_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing_briefings table
CREATE TABLE public.marketing_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  target_audience TEXT,
  tone_of_voice TEXT,
  visual_style TEXT,
  references JSONB DEFAULT '[]'::jsonb,
  deadline DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  creator TEXT,
  assigned_to TEXT,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all marketing tables
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketing_tasks
CREATE POLICY "Authenticated users can manage marketing tasks"
ON public.marketing_tasks
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for marketing_content_calendar
CREATE POLICY "Authenticated users can manage content calendar"
ON public.marketing_content_calendar
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for marketing_metrics
CREATE POLICY "Authenticated users can manage marketing metrics"
ON public.marketing_metrics
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for marketing_briefings
CREATE POLICY "Authenticated users can manage marketing briefings"
ON public.marketing_briefings
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_marketing_tasks_status ON public.marketing_tasks(status);
CREATE INDEX idx_marketing_tasks_due_date ON public.marketing_tasks(due_date);
CREATE INDEX idx_marketing_tasks_campaign ON public.marketing_tasks(campaign_id);

CREATE INDEX idx_content_calendar_date ON public.marketing_content_calendar(publish_date);
CREATE INDEX idx_content_calendar_platform ON public.marketing_content_calendar(platform);
CREATE INDEX idx_content_calendar_status ON public.marketing_content_calendar(status);

CREATE INDEX idx_metrics_campaign ON public.marketing_metrics(campaign_id);
CREATE INDEX idx_metrics_date ON public.marketing_metrics(metric_date);
CREATE INDEX idx_metrics_platform ON public.marketing_metrics(platform);

CREATE INDEX idx_briefings_status ON public.marketing_briefings(status);
CREATE INDEX idx_briefings_deadline ON public.marketing_briefings(deadline);
CREATE INDEX idx_briefings_campaign ON public.marketing_briefings(campaign_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_marketing_tasks_updated_at
  BEFORE UPDATE ON public.marketing_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_content_calendar_updated_at
  BEFORE UPDATE ON public.marketing_content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_metrics_updated_at
  BEFORE UPDATE ON public.marketing_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_briefings_updated_at
  BEFORE UPDATE ON public.marketing_briefings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();