-- ============================================================
-- SCRIPT RBAC COMPLETO - MODELO DE PERMISSÕES NORMALIZADO
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: CRIAR TABELAS
-- ============================================================

-- 1️⃣ Tabela roles (funções)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ Tabela permissions (permissões: ação + módulo)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (action, module)
);

-- 3️⃣ Tabela role_permissions (vínculo role <-> permission)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- 4️⃣ Tabela user_roles (vínculo user <-> role + setor)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  sector TEXT,
  artist_id UUID, -- Para roles de artista, vincula ao artista específico
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_sector ON user_roles(sector);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- ============================================================
-- PARTE 2: POPULAR PERMISSÕES (AÇÕES x MÓDULOS)
-- ============================================================

-- Gera todas as combinações de ação x módulo
INSERT INTO permissions (action, module, description)
SELECT 
  a AS action, 
  m AS module,
  a || ' em ' || m AS description
FROM unnest(ARRAY['view','create','edit','delete','approve','export']) a,
     unnest(ARRAY[
       'artistas',
       'projetos',
       'lancamentos',
       'contratos',
       'royalties',
       'financeiro',
       'marketing',
       'integracoes',
       'usuarios',
       'relatorios',
       'configuracoes',
       'registros_musicas',
       'crm',
       'agenda',
       'inventario',
       'servicos',
       'nota_fiscal',
       'landerzap'
     ]) m
ON CONFLICT (action, module) DO NOTHING;

-- ============================================================
-- PARTE 3: POPULAR ROLES (FUNÇÕES)
-- ============================================================

INSERT INTO roles (name, description) VALUES
  ('master', 'Acesso total ao sistema, ignora restrições de setor'),
  ('administrador', 'Administrador com acesso completo'),
  ('gerente', 'Gerente com acesso amplo, sem delete em configurações'),
  ('produtor_musical', 'Produtor musical com foco em produção'),
  ('editor', 'Editor de conteúdo e mídia'),
  ('analista_financeiro', 'Analista com foco em finanças e royalties'),
  ('especialista_marketing', 'Especialista em marketing e campanhas'),
  ('assistente_producao', 'Assistente de produção musical'),
  ('coordenador_eventos', 'Coordenador de eventos e agenda'),
  ('tecnico_som', 'Técnico de som e equipamentos'),
  ('artista_gestor', 'Artista com permissões de gestão própria'),
  ('artista_financeiro', 'Artista com acesso a dados financeiros próprios'),
  ('artista_marketing', 'Artista com acesso a marketing próprio'),
  ('artista_leitor', 'Artista com acesso somente leitura')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- ============================================================
-- PARTE 4: ATRIBUIR PERMISSÕES ÀS ROLES
-- ============================================================

-- 🔑 MASTER (todas as permissões)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'master'
ON CONFLICT DO NOTHING;

-- 🔑 ADMINISTRADOR (todas as permissões)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'administrador'
ON CONFLICT DO NOTHING;

-- 🔑 GERENTE (sem delete em configuracoes/integracoes)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.action IN ('view', 'create', 'edit', 'approve', 'export')
WHERE r.name = 'gerente'
  AND NOT (p.module IN ('configuracoes', 'integracoes') AND p.action = 'delete')
ON CONFLICT DO NOTHING;

-- 🔑 PRODUTOR MUSICAL
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('artistas', 'projetos', 'lancamentos', 'registros_musicas', 'agenda', 'inventario') AND p.action IN ('view', 'create', 'edit'))
  OR (p.module IN ('relatorios') AND p.action = 'view')
)
WHERE r.name = 'produtor_musical'
ON CONFLICT DO NOTHING;

-- 🔑 EDITOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('artistas', 'projetos', 'lancamentos', 'marketing', 'registros_musicas') AND p.action IN ('view', 'create', 'edit'))
  OR (p.module IN ('relatorios') AND p.action = 'view')
)
WHERE r.name = 'editor'
ON CONFLICT DO NOTHING;

-- 🔑 ANALISTA FINANCEIRO
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  p.module IN ('financeiro', 'royalties', 'nota_fiscal', 'relatorios', 'contratos')
  AND p.action IN ('view', 'create', 'edit', 'approve', 'export')
)
WHERE r.name = 'analista_financeiro'
ON CONFLICT DO NOTHING;

-- 🔑 ESPECIALISTA MARKETING
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('marketing', 'crm', 'landerzap') AND p.action IN ('view', 'create', 'edit', 'delete', 'export'))
  OR (p.module IN ('artistas', 'lancamentos', 'relatorios') AND p.action = 'view')
)
WHERE r.name = 'especialista_marketing'
ON CONFLICT DO NOTHING;

-- 🔑 ASSISTENTE PRODUÇÃO
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('projetos', 'lancamentos', 'registros_musicas', 'agenda') AND p.action IN ('view', 'create', 'edit'))
  OR (p.module IN ('artistas', 'inventario') AND p.action = 'view')
)
WHERE r.name = 'assistente_producao'
ON CONFLICT DO NOTHING;

-- 🔑 COORDENADOR EVENTOS
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('agenda', 'servicos', 'crm') AND p.action IN ('view', 'create', 'edit', 'delete'))
  OR (p.module IN ('artistas', 'contratos', 'financeiro') AND p.action = 'view')
)
WHERE r.name = 'coordenador_eventos'
ON CONFLICT DO NOTHING;

-- 🔑 TÉCNICO SOM
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('inventario', 'servicos') AND p.action IN ('view', 'create', 'edit'))
  OR (p.module IN ('agenda', 'projetos') AND p.action = 'view')
)
WHERE r.name = 'tecnico_som'
ON CONFLICT DO NOTHING;

-- 🔑 ARTISTA GESTOR (acesso próprio amplo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  p.module IN ('artistas', 'projetos', 'lancamentos', 'royalties', 'agenda', 'marketing', 'relatorios')
  AND p.action IN ('view', 'create', 'edit')
)
WHERE r.name = 'artista_gestor'
ON CONFLICT DO NOTHING;

-- 🔑 ARTISTA FINANCEIRO (acesso financeiro próprio)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('royalties', 'financeiro', 'contratos') AND p.action IN ('view', 'export'))
  OR (p.module IN ('artistas', 'lancamentos') AND p.action = 'view')
)
WHERE r.name = 'artista_financeiro'
ON CONFLICT DO NOTHING;

-- 🔑 ARTISTA MARKETING (acesso marketing próprio)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  (p.module IN ('marketing') AND p.action IN ('view', 'create', 'edit'))
  OR (p.module IN ('artistas', 'lancamentos', 'relatorios') AND p.action = 'view')
)
WHERE r.name = 'artista_marketing'
ON CONFLICT DO NOTHING;

-- 🔑 ARTISTA LEITOR (somente visualização)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
  p.action = 'view'
  AND p.module IN ('artistas', 'projetos', 'lancamentos', 'royalties', 'agenda')
)
WHERE r.name = 'artista_leitor'
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTE 5: RLS (Row Level Security) POLICIES
-- ============================================================

-- Habilitar RLS nas tabelas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies para roles (leitura para autenticados)
DROP POLICY IF EXISTS "Roles visíveis para autenticados" ON roles;
CREATE POLICY "Roles visíveis para autenticados" ON roles
  FOR SELECT TO authenticated USING (true);

-- Policies para permissions (leitura para autenticados)
DROP POLICY IF EXISTS "Permissions visíveis para autenticados" ON permissions;
CREATE POLICY "Permissions visíveis para autenticados" ON permissions
  FOR SELECT TO authenticated USING (true);

-- Policies para role_permissions (leitura para autenticados)
DROP POLICY IF EXISTS "Role_permissions visíveis para autenticados" ON role_permissions;
CREATE POLICY "Role_permissions visíveis para autenticados" ON role_permissions
  FOR SELECT TO authenticated USING (true);

-- Policies para user_roles
DROP POLICY IF EXISTS "User_roles visíveis para próprio usuário ou admin" ON user_roles;
CREATE POLICY "User_roles visíveis para próprio usuário ou admin" ON user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('master', 'administrador')
    )
  );

DROP POLICY IF EXISTS "User_roles editáveis por admin" ON user_roles;
CREATE POLICY "User_roles editáveis por admin" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('master', 'administrador')
    )
  );

-- ============================================================
-- PARTE 6: FUNÇÃO PARA VERIFICAR PERMISSÃO
-- ============================================================

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_action TEXT,
  p_module TEXT,
  p_record_owner_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_master BOOLEAN;
  v_is_artist_role BOOLEAN;
  v_has_permission BOOLEAN;
BEGIN
  -- Verificar se é master (ignora tudo)
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = 'master'
  ) INTO v_is_master;
  
  IF v_is_master THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se tem a permissão
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.action = p_action
      AND p.module = p_module
  ) INTO v_has_permission;
  
  IF NOT v_has_permission THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se é role de artista (precisa ser dono do registro)
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name LIKE 'artista_%'
  ) INTO v_is_artist_role;
  
  IF v_is_artist_role AND p_record_owner_id IS NOT NULL THEN
    -- Artista só pode acessar seus próprios registros
    RETURN p_record_owner_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ============================================================
-- PARTE 7: FUNÇÃO PARA OBTER PERMISSÕES DO USUÁRIO
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  role_name TEXT,
  sector TEXT,
  action TEXT,
  module TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name AS role_name,
    ur.sector,
    p.action,
    p.module
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id;
END;
$$;

-- ============================================================
-- PARTE 8: VIEW PARA CONSULTA FÁCIL
-- ============================================================

CREATE OR REPLACE VIEW v_user_permissions AS
SELECT 
  ur.user_id,
  r.name AS role_name,
  r.description AS role_description,
  ur.sector,
  ur.artist_id,
  p.action,
  p.module,
  p.action || ':' || p.module AS permission_key
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Contar registros criados
DO $$
DECLARE
  roles_count INTEGER;
  permissions_count INTEGER;
  role_permissions_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM roles;
  SELECT COUNT(*) INTO permissions_count FROM permissions;
  SELECT COUNT(*) INTO role_permissions_count FROM role_permissions;
  
  RAISE NOTICE '✅ RBAC Setup Completo!';
  RAISE NOTICE '   - Roles: %', roles_count;
  RAISE NOTICE '   - Permissions: %', permissions_count;
  RAISE NOTICE '   - Role-Permissions: %', role_permissions_count;
END $$;
