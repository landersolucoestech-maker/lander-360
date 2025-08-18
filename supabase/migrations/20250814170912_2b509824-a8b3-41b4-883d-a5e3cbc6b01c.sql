-- Create marketing tasks table
CREATE TABLE public.marketing_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  priority TEXT NOT NULL DEFAULT 'Média',
  category TEXT,
  assignee_id UUID,
  assignee_name TEXT,
  campaign TEXT,
  due_date DATE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  budget NUMERIC,
  spent NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  ctr NUMERIC DEFAULT 0,
  cpc NUMERIC DEFAULT 0,
  platform TEXT,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketing briefings table
CREATE TABLE public.marketing_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  campaign TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  priority TEXT NOT NULL DEFAULT 'Média',
  target_audience TEXT,
  deliverables TEXT[],
  budget NUMERIC,
  deadline DATE,
  created_by_id UUID,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social media metrics table
CREATE TABLE public.social_media_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  platform TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  followers_growth NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  engagement_growth NUMERIC DEFAULT 0,
  reach INTEGER DEFAULT 0,
  reach_growth NUMERIC DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  stories_count INTEGER DEFAULT 0,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketing_tasks
CREATE POLICY "marketing_tasks_select" ON public.marketing_tasks FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "marketing_tasks_insert" ON public.marketing_tasks FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "marketing_tasks_update" ON public.marketing_tasks FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "marketing_tasks_delete" ON public.marketing_tasks FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for marketing_campaigns
CREATE POLICY "marketing_campaigns_select" ON public.marketing_campaigns FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "marketing_campaigns_insert" ON public.marketing_campaigns FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "marketing_campaigns_update" ON public.marketing_campaigns FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "marketing_campaigns_delete" ON public.marketing_campaigns FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for marketing_briefings
CREATE POLICY "marketing_briefings_select" ON public.marketing_briefings FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "marketing_briefings_insert" ON public.marketing_briefings FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "marketing_briefings_update" ON public.marketing_briefings FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "marketing_briefings_delete" ON public.marketing_briefings FOR DELETE USING (is_org_member(org_id));

-- Create RLS policies for social_media_metrics
CREATE POLICY "social_media_metrics_select" ON public.social_media_metrics FOR SELECT USING (is_org_member(org_id));
CREATE POLICY "social_media_metrics_insert" ON public.social_media_metrics FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY "social_media_metrics_update" ON public.social_media_metrics FOR UPDATE USING (is_org_member(org_id));
CREATE POLICY "social_media_metrics_delete" ON public.social_media_metrics FOR DELETE USING (is_org_member(org_id));

-- Create triggers for updated_at
CREATE TRIGGER update_marketing_tasks_updated_at
  BEFORE UPDATE ON public.marketing_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp();

CREATE TRIGGER update_marketing_briefings_updated_at
  BEFORE UPDATE ON public.marketing_briefings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp();

-- Insert sample data for testing
INSERT INTO public.social_media_metrics (org_id, platform, followers, followers_growth, engagement_rate, engagement_growth, reach, reach_growth, posts_count, stories_count)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Instagram', 45200, 12.5, 8.7, 15.2, 234500, 22.1, 24, 48),
  ('00000000-0000-0000-0000-000000000000', 'TikTok', 28800, 35.8, 12.3, 28.5, 156300, 45.2, 18, 0),
  ('00000000-0000-0000-0000-000000000000', 'Facebook', 18500, 5.2, 4.2, 8.1, 89200, 12.5, 16, 12),
  ('00000000-0000-0000-0000-000000000000', 'YouTube', 12100, 18.7, 6.8, 22.3, 67800, 32.1, 8, 0);