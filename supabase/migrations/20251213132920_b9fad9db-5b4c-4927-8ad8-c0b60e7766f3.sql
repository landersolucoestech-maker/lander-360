-- Create enum for content types
CREATE TYPE public.learning_content_type AS ENUM ('video', 'text', 'pdf', 'link', 'template');

-- Create enum for difficulty levels
CREATE TYPE public.learning_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Learning stages table
CREATE TABLE public.learning_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning topics table
CREATE TABLE public.learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.learning_stages(id) ON DELETE CASCADE NOT NULL,
  topic_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning lessons table
CREATE TABLE public.learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.learning_topics(id) ON DELETE CASCADE NOT NULL,
  lesson_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type learning_content_type NOT NULL DEFAULT 'text',
  content_text TEXT,
  content_url TEXT,
  duration_minutes INTEGER,
  difficulty learning_difficulty DEFAULT 'beginner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User progress tracking
CREATE TABLE public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- User notes and bookmarks
CREATE TABLE public.learning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges table
CREATE TABLE public.learning_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  stage_id UUID REFERENCES public.learning_stages(id) ON DELETE SET NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.learning_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES public.learning_badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.learning_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stages, topics, lessons, badges (public read for authenticated)
CREATE POLICY "Authenticated users can view learning_stages"
ON public.learning_stages FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage learning_stages"
ON public.learning_stages FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view learning_topics"
ON public.learning_topics FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage learning_topics"
ON public.learning_topics FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view learning_lessons"
ON public.learning_lessons FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage learning_lessons"
ON public.learning_lessons FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view learning_badges"
ON public.learning_badges FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage learning_badges"
ON public.learning_badges FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user-specific data
CREATE POLICY "Users can view own learning_progress"
ON public.learning_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning_progress"
ON public.learning_progress FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning_notes"
ON public.learning_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning_notes"
ON public.learning_notes FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning_user_badges"
ON public.learning_user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning_user_badges"
ON public.learning_user_badges FOR ALL
USING (auth.uid() = user_id);

-- Insert default stages
INSERT INTO public.learning_stages (stage_number, title, description, icon, color) VALUES
(1, 'Fundamentos', 'Introdução ao curso, mindset e primeiras experiências', 'BookOpen', 'blue'),
(2, 'Construção de Identidade', 'Audiência, identidade artística e visual', 'Palette', 'purple'),
(3, 'Estratégia de Lançamentos', 'Planejamento, engajamento e playlists', 'Rocket', 'green'),
(4, 'Comunidade e Projetos', 'Criar comunidade e projetos especiais', 'Users', 'orange'),
(5, 'Monetização e Viralização', 'Monetização e estratégias virais', 'DollarSign', 'yellow'),
(6, 'Crescimento Avançado', 'Música avançada, colaborações e investimento', 'TrendingUp', 'red');

-- Insert topics for Stage 1
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Introdução ao curso e objetivos' FROM public.learning_stages WHERE stage_number = 1;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Mindset', 'Mentalidade do artista/empreendedor' FROM public.learning_stages WHERE stage_number = 1;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Aprimoramento', 'Habilidades, prática e técnicas' FROM public.learning_stages WHERE stage_number = 1;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Experimentação', 'Exercícios e primeiras experiências' FROM public.learning_stages WHERE stage_number = 1;

-- Insert topics for Stage 2
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Visão geral do estágio' FROM public.learning_stages WHERE stage_number = 2;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Audiência', 'Identificar e segmentar público' FROM public.learning_stages WHERE stage_number = 2;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Identidade Artística', 'Conceito e estilo do artista' FROM public.learning_stages WHERE stage_number = 2;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Identidade Visual', 'Logo, cores, presença digital' FROM public.learning_stages WHERE stage_number = 2;

-- Insert topics for Stage 3
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Visão geral do estágio' FROM public.learning_stages WHERE stage_number = 3;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Planejamento de Lançamentos', 'Cronogramas, metas e KPIs' FROM public.learning_stages WHERE stage_number = 3;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Estratégia de Engajamento', 'Canais, marketing, redes sociais' FROM public.learning_stages WHERE stage_number = 3;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Playlists', 'Como entrar e promover em playlists' FROM public.learning_stages WHERE stage_number = 3;

-- Insert topics for Stage 4
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Visão geral do estágio' FROM public.learning_stages WHERE stage_number = 4;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Comunidade', 'Criar e nutrir fãs e seguidores' FROM public.learning_stages WHERE stage_number = 4;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Planejamento de Lançamentos', 'Revisão e otimização' FROM public.learning_stages WHERE stage_number = 4;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Projetos Especiais', 'Colaborações, eventos, EPs' FROM public.learning_stages WHERE stage_number = 4;

-- Insert topics for Stage 5
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Visão geral do estágio' FROM public.learning_stages WHERE stage_number = 5;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Monetização Pt 1', 'Vendas, streaming, shows' FROM public.learning_stages WHERE stage_number = 5;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Monetização Pt 2', 'Patrocínios, merchandising, licenciamento' FROM public.learning_stages WHERE stage_number = 5;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Técnicas de Viralização', 'TikTok, Reels, trends' FROM public.learning_stages WHERE stage_number = 5;

-- Insert topics for Stage 6
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 1, 'Início', 'Visão geral do estágio' FROM public.learning_stages WHERE stage_number = 6;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 2, 'Música', 'Aprimoramento criativo, produção avançada' FROM public.learning_stages WHERE stage_number = 6;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 3, 'Colaborações', 'Networking e parcerias estratégicas' FROM public.learning_stages WHERE stage_number = 6;
INSERT INTO public.learning_topics (stage_id, topic_order, title, description)
SELECT id, 4, 'Investimento', 'Gestão financeira e scaling' FROM public.learning_stages WHERE stage_number = 6;

-- Insert default badges for each stage
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Fundamentos Completos', 'Concluiu o Estágio 1: Fundamentos', 'Award', id, 100 FROM public.learning_stages WHERE stage_number = 1;
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Identidade Definida', 'Concluiu o Estágio 2: Construção de Identidade', 'Star', id, 200 FROM public.learning_stages WHERE stage_number = 2;
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Estrategista de Lançamentos', 'Concluiu o Estágio 3: Estratégia de Lançamentos', 'Zap', id, 300 FROM public.learning_stages WHERE stage_number = 3;
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Construtor de Comunidade', 'Concluiu o Estágio 4: Comunidade e Projetos', 'Heart', id, 400 FROM public.learning_stages WHERE stage_number = 4;
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Mestre da Monetização', 'Concluiu o Estágio 5: Monetização e Viralização', 'Trophy', id, 500 FROM public.learning_stages WHERE stage_number = 5;
INSERT INTO public.learning_badges (name, description, icon, stage_id, points)
SELECT 'Artista Avançado', 'Concluiu o Estágio 6: Crescimento Avançado', 'Crown', id, 600 FROM public.learning_stages WHERE stage_number = 6;

-- Triggers for updated_at
CREATE TRIGGER update_learning_stages_updated_at BEFORE UPDATE ON public.learning_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_topics_updated_at BEFORE UPDATE ON public.learning_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_lessons_updated_at BEFORE UPDATE ON public.learning_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON public.learning_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_notes_updated_at BEFORE UPDATE ON public.learning_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();