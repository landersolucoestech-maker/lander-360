
-- Create table for storing creative ideas
CREATE TABLE public.creative_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES public.music_registry(id) ON DELETE SET NULL,
  release_id UUID REFERENCES public.releases(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  
  -- Input parameters
  objective TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}'::jsonb,
  channel TEXT,
  tone TEXT,
  keywords TEXT[],
  additional_notes TEXT,
  
  -- Generated content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggested_channel TEXT,
  content_format TEXT,
  execution_notes TEXT,
  priority TEXT DEFAULT 'medium',
  
  -- Strategic suggestions
  post_frequency TEXT,
  recommended_dates TEXT[],
  engagement_strategies TEXT[],
  
  -- Metadata
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.creative_ideas(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  is_useful BOOLEAN,
  feedback_notes TEXT,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creative_ideas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view creative_ideas"
ON public.creative_ideas FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert creative_ideas"
ON public.creative_ideas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update creative_ideas"
ON public.creative_ideas FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete creative_ideas"
ON public.creative_ideas FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_creative_ideas_updated_at
BEFORE UPDATE ON public.creative_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for AI chat sessions
CREATE TABLE public.creative_ai_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creative_ai_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can manage creative_ai_chats"
ON public.creative_ai_chats FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_creative_ai_chats_updated_at
BEFORE UPDATE ON public.creative_ai_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
