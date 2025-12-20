-- =============================================
-- LEARNING HUB - ARQUITETURA DEFINITIVA
-- =============================================

-- Tipo de trilha: sistema (uso interno) ou carreira (desenvolvimento artístico)
CREATE TYPE learning_track_type AS ENUM ('sistema', 'carreira', 'operacional');

-- Níveis de carreira artística (1-7)
CREATE TYPE artist_career_level AS ENUM ('nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5', 'nivel_6', 'nivel_7');

-- Tabela de diagnóstico de carreira
CREATE TABLE IF NOT EXISTS artist_career_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  career_level artist_career_level NOT NULL DEFAULT 'nivel_1',
  overall_score INTEGER DEFAULT 0,
  music_score INTEGER DEFAULT 0,
  audience_score INTEGER DEFAULT 0,
  identity_score INTEGER DEFAULT 0,
  marketing_score INTEGER DEFAULT 0,
  monetization_score INTEGER DEFAULT 0,
  dominant_bottleneck TEXT,
  ninety_day_plan JSONB DEFAULT '[]'::jsonb,
  unlocked_modules TEXT[] DEFAULT '{}',
  last_diagnosis_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  spotify_data JSONB DEFAULT '{}'::jsonb,
  instagram_data JSONB DEFAULT '{}'::jsonb,
  youtube_data JSONB DEFAULT '{}'::jsonb,
  tiktok_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar coluna track_type à tabela learning_stages
ALTER TABLE learning_stages ADD COLUMN IF NOT EXISTS track_type learning_track_type DEFAULT 'sistema';
ALTER TABLE learning_stages ADD COLUMN IF NOT EXISTS required_career_level artist_career_level;
ALTER TABLE learning_stages ADD COLUMN IF NOT EXISTS module_category TEXT;

-- Adicionar campos de conteúdo expandido às lessons
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS best_practices TEXT[];
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS copywriting_tips TEXT;
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS related_module TEXT;
ALTER TABLE learning_lessons ADD COLUMN IF NOT EXISTS screenshots TEXT[];

-- RLS para diagnósticos
ALTER TABLE artist_career_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diagnostics" ON artist_career_diagnostics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostics" ON artist_career_diagnostics
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_career_diagnostics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_career_diagnostics_updated_at
  BEFORE UPDATE ON artist_career_diagnostics
  FOR EACH ROW
  EXECUTE FUNCTION update_career_diagnostics_updated_at();

-- =============================================
-- INSERIR ESTÁGIOS DA TRILHA CARREIRA ARTÍSTICA
-- =============================================

INSERT INTO learning_stages (stage_number, title, description, icon, color, track_type, module_category, is_active) VALUES
(9, 'Fundamentos', 'Introdução ao curso, mindset do artista empreendedor, aprimoramento de habilidades e experimentação prática.', 'book-open', '#22C55E', 'carreira', 'fundamentos', true),
(10, 'Construção de Identidade', 'Identificação de audiência, conceito artístico, identidade visual e presença digital profissional.', 'user-circle', '#8B5CF6', 'carreira', 'identidade', true),
(11, 'Estratégia de Lançamentos', 'Planejamento de lançamentos, estratégias de engajamento, distribuição e inserção em playlists.', 'calendar-check', '#F59E0B', 'carreira', 'lancamentos', true),
(12, 'Comunidade e Projetos', 'Criação e nutrição de comunidade de fãs, planejamento avançado e projetos especiais.', 'users', '#06B6D4', 'carreira', 'comunidade', true),
(13, 'Monetização e Viralização', 'Estratégias de monetização (vendas, streaming, shows, patrocínios) e técnicas de viralização.', 'trending-up', '#EF4444', 'carreira', 'monetizacao', true),
(14, 'Crescimento Avançado', 'Aprimoramento musical, colaborações estratégicas, investimento e internacionalização.', 'rocket', '#6366F1', 'carreira', 'crescimento', true);

-- =============================================
-- INSERIR TÓPICOS DA TRILHA CARREIRA
-- =============================================

-- Estágio 9: Fundamentos
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Introdução ao Curso', 'Objetivos, estrutura e como extrair o máximo do aprendizado.', true
FROM learning_stages WHERE stage_number = 9;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Mindset do Artista Empreendedor', 'Mentalidade vencedora, disciplina e visão de negócio.', true
FROM learning_stages WHERE stage_number = 9;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Aprimoramento de Habilidades', 'Técnicas, prática deliberada e evolução contínua.', true
FROM learning_stages WHERE stage_number = 9;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Experimentação Prática', 'Testes, exercícios e primeiras experiências reais.', true
FROM learning_stages WHERE stage_number = 9;

-- Estágio 10: Identidade
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Audiência e Segmentação', 'Como identificar, segmentar e entender seu público-alvo.', true
FROM learning_stages WHERE stage_number = 10;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Identidade Artística', 'Conceito, estilo único e diferenciação no mercado.', true
FROM learning_stages WHERE stage_number = 10;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Identidade Visual', 'Logo, paleta de cores, tipografia e presença visual.', true
FROM learning_stages WHERE stage_number = 10;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Presença Digital', 'Redes sociais, website e posicionamento online.', true
FROM learning_stages WHERE stage_number = 10;

-- Estágio 11: Lançamentos
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Planejamento de Lançamentos', 'Cronogramas, metas, KPIs e estratégia de release.', true
FROM learning_stages WHERE stage_number = 11;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Estratégia de Engajamento', 'Táticas para maximizar alcance e interação.', true
FROM learning_stages WHERE stage_number = 11;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Distribuição Digital', 'Agregadoras, plataformas e otimização de metadados.', true
FROM learning_stages WHERE stage_number = 11;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Playlists e Curadoria', 'Como entrar e promover em playlists editoriais e independentes.', true
FROM learning_stages WHERE stage_number = 11;

-- Estágio 12: Comunidade
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Construção de Comunidade', 'Criar e nutrir base de fãs engajados.', true
FROM learning_stages WHERE stage_number = 12;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Planejamento Avançado', 'Revisão, otimização e escala de lançamentos.', true
FROM learning_stages WHERE stage_number = 12;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Projetos Especiais', 'Colaborações, eventos ao vivo, EPs e singles estratégicos.', true
FROM learning_stages WHERE stage_number = 12;

-- Estágio 13: Monetização
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Monetização Parte 1', 'Streaming, vendas digitais e shows.', true
FROM learning_stages WHERE stage_number = 13;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Monetização Parte 2', 'Patrocínios, merchandising e licenciamento.', true
FROM learning_stages WHERE stage_number = 13;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Viralização e Trends', 'TikTok, Reels, tendências e estratégias virais.', true
FROM learning_stages WHERE stage_number = 13;

-- Estágio 14: Crescimento
INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 1, 'Produção Musical Avançada', 'Aprimoramento criativo e produção de alto nível.', true
FROM learning_stages WHERE stage_number = 14;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 2, 'Colaborações Estratégicas', 'Networking, parcerias e collabs de impacto.', true
FROM learning_stages WHERE stage_number = 14;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 3, 'Investimento e Scaling', 'Gestão financeira, reinvestimento e escala do negócio.', true
FROM learning_stages WHERE stage_number = 14;

INSERT INTO learning_topics (stage_id, topic_order, title, description, is_active)
SELECT id, 4, 'Internacionalização', 'Expansão para mercados internacionais.', true
FROM learning_stages WHERE stage_number = 14;

-- Atualizar estágios existentes para track_type 'sistema'
UPDATE learning_stages SET track_type = 'sistema' WHERE stage_number <= 8;