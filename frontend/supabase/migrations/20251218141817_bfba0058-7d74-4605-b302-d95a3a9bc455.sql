-- ================================================
-- SISTEMA COMPLETO DE PERMISSÕES RBAC + ABAC
-- ================================================

-- 1. Atualizar enum app_role com todos os 7 perfis padrão
DO $$ BEGIN
  -- Drop existing type if exists and recreate
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role_v2') THEN
    CREATE TYPE public.app_role_v2 AS ENUM (
      'admin',              -- Administrador da Empresa
      'gestor_artistico',   -- Gestor Artístico (A&R / Manager)
      'financeiro',         -- Financeiro / Contábil
      'marketing',          -- Marketing
      'artista',            -- Artista (usuário final)
      'colaborador',        -- Colaborador / Freelancer
      'leitor'              -- Leitor (Read-only)
    );
  END IF;
END $$;

-- 2. Criar tabela de setores
CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir setores padrão
INSERT INTO public.sectors (name, description) VALUES
  ('producao', 'Produção'),
  ('administrativo', 'Administrativo'),
  ('financeiro', 'Financeiro'),
  ('marketing', 'Marketing'),
  ('comercial', 'Comercial'),
  ('tecnico', 'Técnico'),
  ('artistico', 'Artístico'),
  ('eventos', 'Eventos'),
  ('juridico', 'Jurídico'),
  ('rh', 'Recursos Humanos'),
  ('ti', 'TI')
ON CONFLICT (name) DO NOTHING;

-- 3. Criar tabela de módulos do sistema
CREATE TABLE IF NOT EXISTS public.system_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Inserir módulos padrão
INSERT INTO public.system_modules (name, display_name, description) VALUES
  ('artistas', 'Artistas', 'Gestão de artistas'),
  ('projetos', 'Projetos', 'Gestão de projetos'),
  ('lancamentos', 'Lançamentos', 'Distribuição e lançamentos'),
  ('contratos', 'Contratos', 'Gestão de contratos'),
  ('royalties', 'Royalties', 'Gestão de royalties e splits'),
  ('financeiro', 'Financeiro', 'Transações financeiras'),
  ('marketing', 'Marketing', 'Campanhas e marketing'),
  ('integracoes', 'Integrações', 'Integrações externas'),
  ('usuarios', 'Usuários', 'Gestão de usuários'),
  ('relatorios', 'Relatórios', 'Relatórios e analytics'),
  ('configuracoes', 'Configurações', 'Configurações do sistema'),
  ('registro_musicas', 'Registro de Músicas', 'Obras e fonogramas'),
  ('crm', 'CRM', 'Gestão de contatos'),
  ('agenda', 'Agenda', 'Eventos e agenda'),
  ('inventario', 'Inventário', 'Gestão de inventário'),
  ('servicos', 'Serviços', 'Catálogo de serviços'),
  ('nota_fiscal', 'Nota Fiscal', 'Notas fiscais'),
  ('landerzap', 'LanderZap', 'Comunicação')
ON CONFLICT (name) DO NOTHING;

-- 4. Criar tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.system_modules(id) ON DELETE CASCADE,
  permission text NOT NULL, -- view, create, edit, delete, submit, approve, export, connect, revoke, sign, calculate, pay, close_period, invite
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module_id, permission)
);

-- 5. Criar tabela de permissões de usuário por módulo
CREATE TABLE IF NOT EXISTS public.user_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.system_modules(id) ON DELETE CASCADE NOT NULL,
  permissions text[] NOT NULL DEFAULT '{}', -- array de permissões: ['view', 'create', 'edit']
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- 6. Criar tabela de escopo de acesso (ABAC)
CREATE TABLE IF NOT EXISTS public.user_access_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scope_type text NOT NULL, -- 'artist', 'project', 'all'
  scope_id uuid, -- NULL means all, otherwise specific artist_id or project_id
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scope_type, scope_id)
);

-- 7. Adicionar coluna sector_id na tabela profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sector_id') THEN
    ALTER TABLE public.profiles ADD COLUMN sector_id uuid REFERENCES public.sectors(id);
  END IF;
END $$;

-- 8. Função para verificar permissão em módulo
CREATE OR REPLACE FUNCTION public.has_module_permission(_user_id uuid, _module_name text, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_module_permissions ump
    JOIN public.system_modules sm ON ump.module_id = sm.id
    WHERE ump.user_id = _user_id
      AND sm.name = _module_name
      AND _permission = ANY(ump.permissions)
  )
  OR public.has_role(_user_id, 'admin'::app_role) -- Admin sempre tem acesso
$$;

-- 9. Função para verificar escopo de acesso a artista
CREATE OR REPLACE FUNCTION public.has_artist_scope(_user_id uuid, _artist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admin sempre tem acesso
    public.has_role(_user_id, 'admin'::app_role)
    -- Ou tem escopo 'all' para artistas
    OR EXISTS (
      SELECT 1 FROM public.user_access_scopes
      WHERE user_id = _user_id AND scope_type = 'artist' AND scope_id IS NULL
    )
    -- Ou tem escopo específico para este artista
    OR EXISTS (
      SELECT 1 FROM public.user_access_scopes
      WHERE user_id = _user_id AND scope_type = 'artist' AND scope_id = _artist_id
    )
    -- Ou está vinculado diretamente ao artista (user_artists)
    OR EXISTS (
      SELECT 1 FROM public.user_artists
      WHERE user_id = _user_id AND artist_id = _artist_id
    )
$$;

-- 10. Função para verificar escopo de acesso a projeto
CREATE OR REPLACE FUNCTION public.has_project_scope(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admin sempre tem acesso
    public.has_role(_user_id, 'admin'::app_role)
    -- Ou tem escopo 'all' para projetos
    OR EXISTS (
      SELECT 1 FROM public.user_access_scopes
      WHERE user_id = _user_id AND scope_type = 'project' AND scope_id IS NULL
    )
    -- Ou tem escopo específico para este projeto
    OR EXISTS (
      SELECT 1 FROM public.user_access_scopes
      WHERE user_id = _user_id AND scope_type = 'project' AND scope_id = _project_id
    )
    -- Ou tem acesso ao artista do projeto
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = _project_id AND public.has_artist_scope(_user_id, p.artist_id)
    )
$$;

-- 11. Inserir permissões padrão por módulo
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('create', 'Criar'),
    ('edit', 'Editar'),
    ('delete', 'Excluir')
) AS p(permission, description)
WHERE sm.name IN ('artistas', 'projetos', 'crm', 'agenda', 'inventario', 'servicos')
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para lançamentos
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('create', 'Criar'),
    ('submit', 'Submeter para aprovação'),
    ('approve', 'Aprovar lançamento')
) AS p(permission, description)
WHERE sm.name = 'lancamentos'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para contratos
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('create', 'Criar'),
    ('sign', 'Assinar'),
    ('approve', 'Aprovar')
) AS p(permission, description)
WHERE sm.name = 'contratos'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para royalties
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('calculate', 'Calcular'),
    ('edit', 'Editar'),
    ('pay', 'Pagar')
) AS p(permission, description)
WHERE sm.name = 'royalties'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para financeiro
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('export', 'Exportar'),
    ('close_period', 'Fechar período')
) AS p(permission, description)
WHERE sm.name = 'financeiro'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para integrações
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('connect', 'Conectar'),
    ('revoke', 'Revogar')
) AS p(permission, description)
WHERE sm.name = 'integracoes'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para usuários
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('invite', 'Convidar'),
    ('edit', 'Editar'),
    ('delete', 'Remover')
) AS p(permission, description)
WHERE sm.name = 'usuarios'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para relatórios
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('export', 'Exportar')
) AS p(permission, description)
WHERE sm.name = 'relatorios'
ON CONFLICT (module_id, permission) DO NOTHING;

-- Permissões especiais para marketing
INSERT INTO public.module_permissions (module_id, permission, description)
SELECT sm.id, p.permission, p.description
FROM public.system_modules sm
CROSS JOIN (
  VALUES 
    ('view', 'Visualizar'),
    ('create', 'Criar'),
    ('edit', 'Editar')
) AS p(permission, description)
WHERE sm.name = 'marketing'
ON CONFLICT (module_id, permission) DO NOTHING;

-- 12. Habilitar RLS nas novas tabelas
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_scopes ENABLE ROW LEVEL SECURITY;

-- 13. Políticas RLS para setores
CREATE POLICY "sectors_select_authenticated" ON public.sectors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "sectors_manage_admin" ON public.sectors
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 14. Políticas RLS para system_modules
CREATE POLICY "system_modules_select_authenticated" ON public.system_modules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "system_modules_manage_admin" ON public.system_modules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 15. Políticas RLS para module_permissions
CREATE POLICY "module_permissions_select_authenticated" ON public.module_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "module_permissions_manage_admin" ON public.module_permissions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 16. Políticas RLS para user_module_permissions
CREATE POLICY "user_module_permissions_select_own" ON public.user_module_permissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_module_permissions_select_admin" ON public.user_module_permissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_module_permissions_manage_admin" ON public.user_module_permissions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 17. Políticas RLS para user_access_scopes
CREATE POLICY "user_access_scopes_select_own" ON public.user_access_scopes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "user_access_scopes_select_admin" ON public.user_access_scopes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_access_scopes_manage_admin" ON public.user_access_scopes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 18. Função para obter permissões do perfil padrão
CREATE OR REPLACE FUNCTION public.get_default_role_permissions(_role text)
RETURNS TABLE(module_name text, permissions text[])
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.name,
    CASE _role
      -- Administrador - acesso total
      WHEN 'admin' THEN ARRAY['view', 'create', 'edit', 'delete', 'submit', 'approve', 'export', 'connect', 'revoke', 'sign', 'calculate', 'pay', 'close_period', 'invite']
      
      -- Gestor Artístico - criar lançamentos, uploads, sem financeiro sensível
      WHEN 'gestor_artistico' THEN 
        CASE sm.name
          WHEN 'artistas' THEN ARRAY['view', 'create', 'edit']
          WHEN 'projetos' THEN ARRAY['view', 'create', 'edit']
          WHEN 'lancamentos' THEN ARRAY['view', 'create', 'submit']
          WHEN 'registro_musicas' THEN ARRAY['view', 'create', 'edit']
          WHEN 'marketing' THEN ARRAY['view']
          WHEN 'relatorios' THEN ARRAY['view']
          WHEN 'agenda' THEN ARRAY['view', 'create', 'edit']
          WHEN 'crm' THEN ARRAY['view', 'create', 'edit']
          ELSE ARRAY['view']
        END
      
      -- Financeiro - royalties, pagamentos, contratos
      WHEN 'financeiro' THEN 
        CASE sm.name
          WHEN 'contratos' THEN ARRAY['view', 'edit']
          WHEN 'royalties' THEN ARRAY['view', 'calculate', 'edit', 'pay']
          WHEN 'financeiro' THEN ARRAY['view', 'export', 'close_period']
          WHEN 'relatorios' THEN ARRAY['view', 'export']
          WHEN 'nota_fiscal' THEN ARRAY['view', 'create', 'edit']
          WHEN 'inventario' THEN ARRAY['view']
          ELSE ARRAY[]::text[]
        END
      
      -- Marketing - campanhas, links, métricas
      WHEN 'marketing' THEN 
        CASE sm.name
          WHEN 'marketing' THEN ARRAY['view', 'create', 'edit']
          WHEN 'integracoes' THEN ARRAY['view', 'connect']
          WHEN 'relatorios' THEN ARRAY['view']
          WHEN 'artistas' THEN ARRAY['view']
          WHEN 'lancamentos' THEN ARRAY['view']
          ELSE ARRAY[]::text[]
        END
      
      -- Artista - dados próprios, somente leitura
      WHEN 'artista' THEN 
        CASE sm.name
          WHEN 'artistas' THEN ARRAY['view']
          WHEN 'projetos' THEN ARRAY['view']
          WHEN 'lancamentos' THEN ARRAY['view']
          WHEN 'royalties' THEN ARRAY['view']
          WHEN 'contratos' THEN ARRAY['view']
          WHEN 'relatorios' THEN ARRAY['view']
          WHEN 'agenda' THEN ARRAY['view']
          WHEN 'marketing' THEN ARRAY['view']
          ELSE ARRAY[]::text[]
        END
      
      -- Colaborador - somente projetos atribuídos
      WHEN 'colaborador' THEN 
        CASE sm.name
          WHEN 'projetos' THEN ARRAY['view']
          WHEN 'lancamentos' THEN ARRAY['view']
          WHEN 'registro_musicas' THEN ARRAY['view']
          ELSE ARRAY[]::text[]
        END
      
      -- Leitor - somente leitura
      WHEN 'leitor' THEN 
        CASE sm.name
          WHEN 'relatorios' THEN ARRAY['view']
          WHEN 'artistas' THEN ARRAY['view']
          WHEN 'lancamentos' THEN ARRAY['view']
          ELSE ARRAY[]::text[]
        END
      
      ELSE ARRAY[]::text[]
    END as permissions
  FROM public.system_modules sm;
END;
$$;

-- 19. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_user_module_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_user_module_permissions_updated_at ON public.user_module_permissions;
CREATE TRIGGER update_user_module_permissions_updated_at
  BEFORE UPDATE ON public.user_module_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_module_permissions_updated_at();

-- 20. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_module_permissions_user_id ON public.user_module_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_permissions_module_id ON public.user_module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_access_scopes_user_id ON public.user_access_scopes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_scopes_scope_type ON public.user_access_scopes(scope_type);