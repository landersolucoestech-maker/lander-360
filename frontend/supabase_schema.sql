-- =====================================================
-- LANDER 360 - Script SQL Completo para Supabase
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- PARTE 1: ENUMS (Tipos Enumerados)
-- =====================================================

-- Roles de aplicação
CREATE TYPE app_role AS ENUM (
  'admin',
  'manager', 
  'user',
  'empresario',
  'financeiro',
  'marketing',
  'juridico',
  'artista',
  'produtor_artistico'
);

-- Roles v2
CREATE TYPE app_role_v2 AS ENUM (
  'admin',
  'gestor_artistico',
  'financeiro',
  'marketing',
  'artista',
  'colaborador',
  'leitor'
);

-- Nível de carreira do artista
CREATE TYPE artist_career_level AS ENUM (
  'nivel_1',
  'nivel_2',
  'nivel_3',
  'nivel_4',
  'nivel_5',
  'nivel_6',
  'nivel_7'
);

-- Tipo de perfil do artista
CREATE TYPE artist_profile_type AS ENUM (
  'independente',
  'com_empresario',
  'gravadora_propria',
  'gravadora_externa',
  'produtor',
  'compositor'
);

-- Status de contrato
CREATE TYPE contract_status_enum AS ENUM (
  'rascunho',
  'em_analise',
  'aguardando_assinatura',
  'assinado',
  'ativo',
  'vencido',
  'cancelado',
  'rescindido'
);

-- Gêneros musicais
CREATE TYPE genre_enum AS ENUM (
  'pop', 'rock', 'hip_hop', 'rap', 'funk', 'sertanejo', 'pagode', 'samba',
  'mpb', 'forro', 'axe', 'reggae', 'eletronica', 'gospel', 'classica', 'jazz',
  'blues', 'country', 'trap', 'drill', 'arrocha', 'piseiro', 'brega', 'indie',
  'alternativo', 'r_and_b', 'soul', 'folk', 'metal', 'punk', 'outro'
);

-- Gêneros musicais simplificado
CREATE TYPE music_genre AS ENUM (
  'funk', 'trap', 'piseiro', 'arrocha', 'arrochadeira', 'sertanejo', 'axe',
  'pagode', 'forro', 'reggaeton', 'pop', 'rock', 'mpb', 'hip_hop', 'eletronica',
  'gospel', 'outro'
);

-- Tipo de conteúdo de aprendizado
CREATE TYPE learning_content_type AS ENUM ('video', 'text', 'pdf', 'link', 'template');

-- Dificuldade de aprendizado
CREATE TYPE learning_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Tipo de trilha de aprendizado
CREATE TYPE learning_track_type AS ENUM ('sistema', 'carreira', 'operacional');

-- Status de obra
CREATE TYPE obra_status_enum AS ENUM (
  'rascunho', 'em_analise', 'pendente_registro', 'registrada', 'aprovada', 'rejeitada', 'arquivada'
);

-- Status de projeto
CREATE TYPE project_status_enum AS ENUM (
  'rascunho', 'planejamento', 'em_producao', 'em_revisao', 'aprovado', 'finalizado', 'cancelado', 'pausado'
);

-- Status de lançamento
CREATE TYPE release_status_enum AS ENUM (
  'rascunho', 'em_analise', 'aprovado', 'agendado', 'distribuindo', 'lancado', 'cancelado', 'pausado'
);

-- =====================================================
-- PARTE 2: TABELAS PRINCIPAIS (sem dependências)
-- =====================================================

-- Tabela de artistas
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  stage_name TEXT,
  full_name TEXT,
  legal_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  genre TEXT,
  birth_date DATE,
  image_url TEXT,
  documents_url TEXT,
  contract_status TEXT,
  profile_type TEXT,
  artist_types TEXT[],
  observations TEXT,
  -- Redes sociais
  instagram TEXT,
  instagram_url TEXT,
  tiktok TEXT,
  soundcloud TEXT,
  spotify_id TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  deezer_url TEXT,
  youtube_url TEXT,
  youtube_channel_id TEXT,
  -- Distribuidores
  distributors TEXT[],
  distributor_emails JSONB,
  -- Contatos da gravadora/empresário
  record_label_name TEXT,
  label_contact_name TEXT,
  label_contact_email TEXT,
  label_contact_phone TEXT,
  manager_name TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'rascunho',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  project_type TEXT,
  priority TEXT,
  observations TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de templates de contrato
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  description TEXT,
  header_html TEXT,
  footer_html TEXT,
  clauses JSONB,
  default_fields JSONB,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de contatos CRM
CREATE TABLE crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  contact_type TEXT,
  status TEXT DEFAULT 'ativo',
  priority TEXT,
  document TEXT,
  image_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  artist_name TEXT,
  notes TEXT,
  next_action TEXT,
  interactions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de referência de gêneros
CREATE TABLE genre_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relatórios automatizados
CREATE TABLE automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  parameters JSONB,
  recipients JSONB,
  last_generated_at TIMESTAMPTZ,
  next_generation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de inventário
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  unit_value DECIMAL(12,2),
  location TEXT,
  sector TEXT,
  responsible TEXT,
  status TEXT DEFAULT 'disponível',
  entry_date DATE,
  purchase_location TEXT,
  invoice_number TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de serviços
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL,
  category TEXT NOT NULL,
  grupo TEXT,
  cost_price DECIMAL(12,2),
  sale_price DECIMAL(12,2) DEFAULT 0,
  margin DECIMAL(5,2),
  discount_type TEXT,
  discount_value DECIMAL(12,2),
  final_price DECIMAL(12,2) DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de influenciadores
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  handle TEXT,
  followers INTEGER,
  engagement_rate DECIMAL(5,2),
  niche TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  price_per_post DECIMAL(12,2),
  price_per_story DECIMAL(12,2),
  price_per_video DECIMAL(12,2),
  status TEXT DEFAULT 'ativo',
  notes TEXT,
  last_collaboration DATE,
  total_collaborations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de módulos do sistema
CREATE TABLE system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  route TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles do sistema
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de permissões de role
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module_name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret TEXT,
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles de usuário
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Tabela de sessões de usuário
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  device_type TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,
  terminated_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tentativas de login
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de histórico de login
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  device_type TEXT,
  location TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de códigos OTP de email
CREATE TABLE email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs de auditoria de segurança
CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 3: TABELAS COM DEPENDÊNCIAS (FK para artists)
-- =====================================================

-- Dados sensíveis do artista
CREATE TABLE artist_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL UNIQUE REFERENCES artists(id) ON DELETE CASCADE,
  cpf_cnpj TEXT,
  rg TEXT,
  email TEXT,
  phone TEXT,
  full_address TEXT,
  -- Dados bancários
  bank TEXT,
  agency TEXT,
  account TEXT,
  account_holder TEXT,
  pix_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metas do artista
CREATE TABLE artist_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  unit TEXT,
  platform TEXT,
  period TEXT,
  priority TEXT,
  status TEXT DEFAULT 'em_andamento',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Diagnóstico de carreira do artista
CREATE TABLE artist_career_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  career_level artist_career_level DEFAULT 'nivel_1',
  overall_score DECIMAL(5,2),
  music_score DECIMAL(5,2),
  identity_score DECIMAL(5,2),
  audience_score DECIMAL(5,2),
  marketing_score DECIMAL(5,2),
  monetization_score DECIMAL(5,2),
  dominant_bottleneck TEXT,
  unlocked_modules TEXT[],
  ninety_day_plan JSONB,
  spotify_data JSONB,
  instagram_data JSONB,
  youtube_data JSONB,
  tiktok_data JSONB,
  last_diagnosis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos da agenda
CREATE TABLE agenda_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date DATE NOT NULL,
  start_time TEXT,
  end_date DATE,
  end_time TEXT,
  location TEXT,
  venue_name TEXT,
  venue_address TEXT,
  venue_capacity INTEGER,
  venue_contact TEXT,
  expected_audience INTEGER,
  ticket_price DECIMAL(12,2),
  status TEXT DEFAULT 'agendado',
  observations TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Contratos
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT,
  client_type TEXT,
  service_type TEXT,
  status TEXT DEFAULT 'rascunho',
  start_date DATE,
  end_date DATE,
  effective_from DATE,
  effective_to DATE,
  signed_date DATE,
  signature_request_date DATE,
  registry_date DATE,
  registry_office BOOLEAN DEFAULT false,
  value DECIMAL(12,2),
  fixed_value DECIMAL(12,2),
  advance_amount DECIMAL(12,2),
  financial_support DECIMAL(12,2),
  royalty_rate DECIMAL(5,2),
  royalties_percentage DECIMAL(5,2),
  payment_type TEXT,
  terms TEXT,
  notes TEXT,
  observations TEXT,
  document_url TEXT,
  generated_document_content TEXT,
  autentique_document_id TEXT,
  contractor_contact TEXT,
  responsible_person TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Lançamentos
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  release_type TEXT,
  status TEXT DEFAULT 'rascunho',
  release_date DATE,
  upc TEXT,
  isrc TEXT,
  label TEXT,
  genre TEXT,
  subgenre TEXT,
  language TEXT,
  cover_art_url TEXT,
  description TEXT,
  spotify_uri TEXT,
  apple_music_url TEXT,
  deezer_url TEXT,
  youtube_url TEXT,
  distributor TEXT,
  distribution_status TEXT,
  metadata JSONB,
  streaming_metrics JSONB,
  observations TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Registro de músicas
CREATE TABLE music_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  artist_name TEXT,
  composers TEXT[],
  writers TEXT[],
  producers TEXT[],
  performers TEXT[],
  publishers TEXT[],
  genre TEXT,
  subgenre TEXT,
  bpm INTEGER,
  duration TEXT,
  key_signature TEXT,
  isrc TEXT,
  iswc TEXT,
  ecad_code TEXT,
  upc TEXT,
  registration_date DATE,
  status TEXT DEFAULT 'rascunho',
  copyright_status TEXT,
  rights_holders JSONB,
  split_sheet JSONB,
  lyrics TEXT,
  audio_url TEXT,
  audio_analysis JSONB,
  fingerprint_id TEXT,
  fingerprint_status TEXT,
  observations TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Fonogramas
CREATE TABLE phonograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  isrc TEXT,
  duration TEXT,
  bpm INTEGER,
  key_signature TEXT,
  genre TEXT,
  status TEXT DEFAULT 'ativo',
  audio_url TEXT,
  cover_art_url TEXT,
  production_date DATE,
  master_owner TEXT,
  rights_holders JSONB,
  metadata JSONB,
  observations TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Faixas (tracks)
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  track_number INTEGER,
  duration TEXT,
  isrc TEXT,
  explicit BOOLEAN DEFAULT false,
  lyrics TEXT,
  audio_url TEXT,
  preview_url TEXT,
  spotify_uri TEXT,
  status TEXT DEFAULT 'rascunho',
  metadata JSONB,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composições
CREATE TABLE compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  iswc TEXT,
  writers TEXT[],
  publishers TEXT[],
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contribuidores
CREATE TABLE contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distribuições
CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  distributed_at TIMESTAMPTZ,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de lançamento
CREATE TABLE release_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value DECIMAL(15,2),
  date DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transações financeiras
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  transaction_date DATE,
  transaction_type TEXT,
  category TEXT,
  subcategory TEXT,
  payment_method TEXT,
  payment_type TEXT,
  status TEXT DEFAULT 'pendente',
  attachment_url TEXT,
  observations TEXT,
  responsible_by TEXT,
  authorized_by TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  event_id UUID REFERENCES agenda_events(id) ON DELETE SET NULL,
  crm_contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Parcelas de transações
CREATE TABLE transaction_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES financial_transactions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  paid_date DATE,
  paid_amount DECIMAL(12,2),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regras de categorização financeira
CREATE TABLE financial_categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  pattern TEXT NOT NULL,
  pattern_type TEXT DEFAULT 'contains',
  category TEXT NOT NULL,
  subcategory TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Notas fiscais
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_document TEXT,
  client_email TEXT,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'emitida',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Campanhas de marketing
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT,
  status TEXT DEFAULT 'rascunho',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  target_audience JSONB,
  goals JSONB,
  channels TEXT[],
  kpis JSONB,
  results JSONB,
  observations TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tarefas de marketing
CREATE TABLE marketing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT,
  status TEXT DEFAULT 'pendente',
  priority TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  platform TEXT,
  content_type TEXT,
  content_url TEXT,
  scheduled_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metrics JSONB,
  observations TEXT,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Conteúdos de marketing
CREATE TABLE marketing_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'rascunho',
  content TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  scheduled_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metrics JSONB,
  hashtags TEXT[],
  mentions TEXT[],
  observations TEXT,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  task_id UUID REFERENCES marketing_tasks(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Briefings de marketing
CREATE TABLE marketing_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  briefing_type TEXT,
  status TEXT DEFAULT 'rascunho',
  objectives TEXT,
  target_audience JSONB,
  key_messages TEXT[],
  tone_of_voice TEXT,
  visual_references TEXT[],
  deliverables JSONB,
  deadline DATE,
  budget DECIMAL(12,2),
  observations TEXT,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Ideias criativas
CREATE TABLE creative_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT DEFAULT 'nova',
  priority TEXT,
  channel TEXT,
  suggested_channel TEXT,
  content_format TEXT,
  tone TEXT,
  keywords TEXT[],
  engagement_strategies TEXT[],
  recommended_dates TEXT[],
  target_audience JSONB,
  post_frequency TEXT,
  is_useful BOOLEAN,
  feedback_notes TEXT,
  execution_notes TEXT,
  additional_notes TEXT,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES creative_ideas(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Chats de IA criativa
CREATE TABLE creative_ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  messages JSONB,
  context JSONB,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Métricas de redes sociais
CREATE TABLE social_media_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(15,2),
  followers INTEGER,
  followers_growth DECIMAL(5,2),
  engagement_rate DECIMAL(5,2),
  engagement_growth DECIMAL(5,2),
  reach INTEGER,
  reach_growth DECIMAL(5,2),
  posts_count INTEGER,
  stories_count INTEGER,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas do Spotify
CREATE TABLE spotify_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  spotify_artist_id TEXT NOT NULL,
  followers INTEGER,
  monthly_listeners INTEGER,
  popularity INTEGER,
  total_streams BIGINT,
  top_tracks JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens OAuth do Spotify
CREATE TABLE spotify_artist_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL UNIQUE REFERENCES artists(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estados OAuth do Spotify
CREATE TABLE spotify_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  priority TEXT DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenças de sincronização
CREATE TABLE sync_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  license_type TEXT DEFAULT 'sync',
  media_type TEXT,
  project_name TEXT,
  client_name TEXT,
  client_company TEXT,
  territory TEXT,
  duration TEXT,
  exclusivity BOOLEAN DEFAULT false,
  license_fee DECIMAL(12,2),
  advance_payment DECIMAL(12,2),
  royalty_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'proposta',
  proposal_date DATE,
  start_date DATE,
  end_date DATE,
  signed_date DATE,
  usage_description TEXT,
  contract_url TEXT,
  brief_url TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  phonogram_id UUID REFERENCES phonograms(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Takedowns
CREATE TABLE takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  takedown_type TEXT,
  platform TEXT,
  content_url TEXT,
  infringing_party TEXT,
  status TEXT DEFAULT 'identificado',
  priority TEXT,
  reported_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  evidence_urls TEXT[],
  reference_number TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  phonogram_id UUID REFERENCES phonograms(id) ON DELETE SET NULL,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Detecções de rádio/TV
CREATE TABLE radio_tv_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  phonogram_id UUID REFERENCES phonograms(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  station_name TEXT,
  station_type TEXT,
  channel TEXT,
  program_name TEXT,
  detection_date DATE,
  detection_time TEXT,
  duration_seconds INTEGER,
  confidence_score DECIMAL(5,2),
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relatórios ECAD
CREATE TABLE ecad_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_period TEXT NOT NULL,
  report_type TEXT,
  file_name TEXT,
  file_url TEXT,
  import_status TEXT DEFAULT 'pendente',
  import_error TEXT,
  imported_at TIMESTAMPTZ,
  total_records INTEGER,
  matched_records INTEGER,
  unmatched_records INTEGER,
  divergent_records INTEGER,
  total_value DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Itens de relatório ECAD
CREATE TABLE ecad_report_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecad_report_id UUID NOT NULL REFERENCES ecad_reports(id) ON DELETE CASCADE,
  ecad_work_code TEXT,
  title TEXT,
  artist_name TEXT,
  platform TEXT,
  period TEXT,
  execution_count INTEGER,
  execution_value DECIMAL(12,2),
  matched BOOLEAN DEFAULT false,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  divergence_type TEXT,
  divergence_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Divergências ECAD
CREATE TABLE ecad_divergences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  divergence_type TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  ecad_value DECIMAL(12,2),
  ecad_count INTEGER,
  detected_value DECIMAL(12,2),
  detected_count INTEGER,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  music_registry_id UUID REFERENCES music_registry(id) ON DELETE SET NULL,
  ecad_report_item_id UUID REFERENCES ecad_report_items(id) ON DELETE SET NULL,
  detection_id UUID REFERENCES radio_tv_detections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversas LanderZap
CREATE TABLE landerzap_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_initials TEXT NOT NULL,
  contact_image TEXT,
  contact_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens LanderZap
CREATE TABLE landerzap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES landerzap_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  channel TEXT NOT NULL,
  from_me BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automações
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  automation_type TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB,
  actions JSONB NOT NULL,
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Logs de execução de automação
CREATE TABLE automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  execution_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 4: TABELAS DE APRENDIZADO (Academy)
-- =====================================================

-- Estágios de aprendizado
CREATE TABLE learning_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stage_number INTEGER NOT NULL,
  icon TEXT,
  color TEXT,
  track_type learning_track_type,
  module_category TEXT,
  required_career_level artist_career_level,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tópicos de aprendizado
CREATE TABLE learning_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES learning_stages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lições
CREATE TABLE learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  content_type learning_content_type DEFAULT 'text',
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  difficulty learning_difficulty,
  related_module TEXT,
  screenshots TEXT[],
  best_practices TEXT[],
  copywriting_tips TEXT,
  checklist JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso de aprendizado
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Notas de aprendizado
CREATE TABLE learning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  note_text TEXT,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges de aprendizado
CREATE TABLE learning_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  stage_id UUID REFERENCES learning_stages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges conquistados pelo usuário
CREATE TABLE learning_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES learning_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- PARTE 5: TABELAS AUXILIARES
-- =====================================================

-- Artistas do projeto
CREATE TABLE project_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, artist_id)
);

-- Permissões de módulo do usuário
CREATE TABLE user_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES system_modules(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Escopo de artistas do usuário
CREATE TABLE user_artist_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artist_id)
);

-- Escopo de projetos do usuário
CREATE TABLE user_project_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Tokens do Google Calendar
CREATE TABLE google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sincronização de eventos do Google Calendar
CREATE TABLE google_calendar_events_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agenda_event_id UUID NOT NULL REFERENCES agenda_events(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agenda_event_id)
);

-- Rate limiting
CREATE TABLE rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  tokens INTEGER NOT NULL,
  last_refill TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 6: ÍNDICES
-- =====================================================

-- Índices para artists
CREATE INDEX idx_artists_created_by ON artists(created_by);
CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_artists_genre ON artists(genre);

-- Índices para releases
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_releases_release_date ON releases(release_date);

-- Índices para contracts
CREATE INDEX idx_contracts_artist_id ON contracts(artist_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- Índices para financial_transactions
CREATE INDEX idx_financial_transactions_artist_id ON financial_transactions(artist_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(date);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category);

-- Índices para agenda_events
CREATE INDEX idx_agenda_events_artist_id ON agenda_events(artist_id);
CREATE INDEX idx_agenda_events_start_date ON agenda_events(start_date);
CREATE INDEX idx_agenda_events_status ON agenda_events(status);

-- Índices para music_registry
CREATE INDEX idx_music_registry_artist_id ON music_registry(artist_id);
CREATE INDEX idx_music_registry_isrc ON music_registry(isrc);
CREATE INDEX idx_music_registry_status ON music_registry(status);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Índices para marketing_campaigns
CREATE INDEX idx_marketing_campaigns_artist_id ON marketing_campaigns(artist_id);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);

-- Índices para user_roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- =====================================================
-- PARTE 7: FUNÇÕES
-- =====================================================

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  v_bucket RECORD;
  v_tokens INTEGER;
  v_now TIMESTAMPTZ := NOW();
  v_elapsed INTEGER;
  v_refill INTEGER;
BEGIN
  SELECT * INTO v_bucket FROM rate_limit_buckets WHERE key = p_key FOR UPDATE;
  
  IF NOT FOUND THEN
    INSERT INTO rate_limit_buckets (key, tokens, last_refill)
    VALUES (p_key, p_max_requests - 1, v_now);
    RETURN TRUE;
  END IF;
  
  v_elapsed := EXTRACT(EPOCH FROM (v_now - v_bucket.last_refill))::INTEGER;
  v_refill := (v_elapsed * p_max_requests) / p_window_seconds;
  v_tokens := LEAST(p_max_requests, v_bucket.tokens + v_refill);
  
  IF v_tokens > 0 THEN
    UPDATE rate_limit_buckets
    SET tokens = v_tokens - 1, last_refill = v_now
    WHERE key = p_key;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar role
CREATE OR REPLACE FUNCTION has_role(
  _role app_role,
  _user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar permissão de módulo
CREATE OR REPLACE FUNCTION has_module_permission(
  _module_name TEXT,
  _permission TEXT,
  _user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Admin tem acesso total
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM user_module_permissions ump
    JOIN system_modules sm ON sm.id = ump.module_id
    WHERE ump.user_id = _user_id
    AND sm.name = _module_name
    AND _permission = ANY(ump.permissions)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar acesso a artista
CREATE OR REPLACE FUNCTION user_can_access_artist(
  _artist_id UUID,
  _user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Admin tem acesso total
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Verifica escopo específico
  RETURN EXISTS (
    SELECT 1 FROM user_artist_scope
    WHERE user_id = _user_id AND artist_id = _artist_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para normalizar gênero
CREATE OR REPLACE FUNCTION normalize_genre(input_genre TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(REGEXP_REPLACE(input_genre, '[^a-zA-Z0-9]', '_', 'g')));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 8: TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- =====================================================
-- PARTE 9: POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_roles (apenas admin pode gerenciar)
CREATE POLICY "Admin can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Política permissiva para artists (ajustar conforme necessidade)
CREATE POLICY "Authenticated users can view artists" ON artists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert artists" ON artists
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update artists" ON artists
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas similares para outras tabelas principais
CREATE POLICY "Authenticated users can view projects" ON projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view contracts" ON contracts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage contracts" ON contracts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view releases" ON releases
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage releases" ON releases
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view music_registry" ON music_registry
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage music_registry" ON music_registry
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view financial_transactions" ON financial_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage financial_transactions" ON financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view agenda_events" ON agenda_events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage agenda_events" ON agenda_events
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- PARTE 10: DADOS INICIAIS
-- =====================================================

-- Inserir módulos do sistema
INSERT INTO system_modules (name, display_name, description, icon, route, sort_order) VALUES
  ('dashboard', 'Dashboard', 'Visão geral do sistema', 'LayoutDashboard', '/', 1),
  ('artistas', 'Artistas', 'Gestão de artistas', 'Users', '/artistas', 2),
  ('projetos', 'Projetos', 'Gestão de projetos', 'Folder', '/projetos', 3),
  ('lancamentos', 'Lançamentos', 'Gestão de lançamentos', 'Music', '/lancamentos', 4),
  ('contratos', 'Contratos', 'Gestão de contratos', 'FileText', '/contratos', 5),
  ('financeiro', 'Financeiro', 'Gestão financeira', 'DollarSign', '/financeiro', 6),
  ('agenda', 'Agenda', 'Calendário de eventos', 'Calendar', '/agenda', 7),
  ('marketing', 'Marketing', 'Campanhas e conteúdo', 'Megaphone', '/marketing/visao-geral', 8),
  ('crm', 'CRM', 'Gestão de contatos', 'Contact', '/crm', 9),
  ('relatorios', 'Relatórios', 'Relatórios e análises', 'BarChart', '/relatorios', 10),
  ('configuracoes', 'Configurações', 'Configurações do sistema', 'Settings', '/configuracoes', 11)
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão por role
INSERT INTO role_permissions (role, module_name, permissions) VALUES
  ('admin', 'dashboard', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'artistas', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'projetos', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'lancamentos', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'contratos', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'financeiro', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'agenda', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'marketing', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'crm', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'relatorios', ARRAY['view', 'edit', 'delete', 'create']),
  ('admin', 'configuracoes', ARRAY['view', 'edit', 'delete', 'create']),
  ('manager', 'dashboard', ARRAY['view']),
  ('manager', 'artistas', ARRAY['view', 'edit', 'create']),
  ('manager', 'projetos', ARRAY['view', 'edit', 'create']),
  ('manager', 'lancamentos', ARRAY['view', 'edit', 'create']),
  ('manager', 'contratos', ARRAY['view', 'edit']),
  ('manager', 'financeiro', ARRAY['view']),
  ('manager', 'agenda', ARRAY['view', 'edit', 'create']),
  ('manager', 'marketing', ARRAY['view', 'edit', 'create']),
  ('manager', 'crm', ARRAY['view', 'edit', 'create']),
  ('manager', 'relatorios', ARRAY['view']),
  ('user', 'dashboard', ARRAY['view']),
  ('user', 'artistas', ARRAY['view']),
  ('user', 'projetos', ARRAY['view']),
  ('user', 'lancamentos', ARRAY['view']),
  ('user', 'agenda', ARRAY['view']),
  ('user', 'relatorios', ARRAY['view'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- IMPORTANTE: Após executar este script, você precisará:
-- 1. Criar um usuário admin via Authentication do Supabase
-- 2. Inserir o role admin para esse usuário:
--    INSERT INTO user_roles (user_id, role) VALUES ('SEU_USER_ID', 'admin');
-- 3. Criar um profile para o usuário:
--    INSERT INTO profiles (id, full_name, email) VALUES ('SEU_USER_ID', 'Admin', 'admin@email.com');
