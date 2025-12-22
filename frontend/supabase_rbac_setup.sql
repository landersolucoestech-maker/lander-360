-- PARTE 1: LIMPAR TABELAS EXISTENTES
DROP VIEW IF EXISTS v_user_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- PARTE 2: CRIAR TABELAS
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (action, module)
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  sector TEXT,
  artist_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_permissions_module ON permissions(module);

-- PARTE 3: POPULAR PERMISSÕES
INSERT INTO permissions (action, module, description)
SELECT a, m, a || ' em ' || m
FROM unnest(ARRAY['view','create','edit','delete','approve','export']) a,
     unnest(ARRAY['artistas','projetos','lancamentos','contratos','royalties','financeiro','marketing','integracoes','usuarios','relatorios','configuracoes','registros_musicas','crm','agenda','inventario','servicos','nota_fiscal','landerzap']) m;

-- PARTE 4: POPULAR ROLES
INSERT INTO roles (name, description) VALUES
  ('master', 'Acesso total ao sistema'),
  ('administrador', 'Administrador com acesso completo'),
  ('gerente', 'Gerente com acesso amplo'),
  ('produtor_musical', 'Produtor musical'),
  ('editor', 'Editor de conteudo'),
  ('analista_financeiro', 'Analista financeiro'),
  ('especialista_marketing', 'Especialista marketing'),
  ('assistente_producao', 'Assistente producao'),
  ('coordenador_eventos', 'Coordenador eventos'),
  ('tecnico_som', 'Tecnico som'),
  ('artista_gestor', 'Artista gestor'),
  ('artista_financeiro', 'Artista financeiro'),
  ('artista_marketing', 'Artista marketing'),
  ('artista_leitor', 'Artista leitor');

-- PARTE 5: ATRIBUIR PERMISSÕES
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'master';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'administrador';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.action IN ('view', 'create', 'edit', 'approve', 'export')
WHERE r.name = 'gerente' AND p.module NOT IN ('configuracoes', 'integracoes');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('artistas', 'projetos', 'lancamentos', 'registros_musicas', 'agenda', 'inventario') AND p.action IN ('view', 'create', 'edit')) OR (p.module = 'relatorios' AND p.action = 'view')
WHERE r.name = 'produtor_musical';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('artistas', 'projetos', 'lancamentos', 'marketing', 'registros_musicas') AND p.action IN ('view', 'create', 'edit')) OR (p.module = 'relatorios' AND p.action = 'view')
WHERE r.name = 'editor';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.module IN ('financeiro', 'royalties', 'nota_fiscal', 'relatorios', 'contratos') AND p.action IN ('view', 'create', 'edit', 'approve', 'export')
WHERE r.name = 'analista_financeiro';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('marketing', 'crm', 'landerzap') AND p.action IN ('view', 'create', 'edit', 'delete', 'export')) OR (p.module IN ('artistas', 'lancamentos', 'relatorios') AND p.action = 'view')
WHERE r.name = 'especialista_marketing';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('projetos', 'lancamentos', 'registros_musicas', 'agenda') AND p.action IN ('view', 'create', 'edit')) OR (p.module IN ('artistas', 'inventario') AND p.action = 'view')
WHERE r.name = 'assistente_producao';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('agenda', 'servicos', 'crm') AND p.action IN ('view', 'create', 'edit', 'delete')) OR (p.module IN ('artistas', 'contratos', 'financeiro') AND p.action = 'view')
WHERE r.name = 'coordenador_eventos';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('inventario', 'servicos') AND p.action IN ('view', 'create', 'edit')) OR (p.module IN ('agenda', 'projetos') AND p.action = 'view')
WHERE r.name = 'tecnico_som';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.module IN ('artistas', 'projetos', 'lancamentos', 'royalties', 'agenda', 'marketing', 'relatorios') AND p.action IN ('view', 'create', 'edit')
WHERE r.name = 'artista_gestor';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module IN ('royalties', 'financeiro', 'contratos') AND p.action IN ('view', 'export')) OR (p.module IN ('artistas', 'lancamentos') AND p.action = 'view')
WHERE r.name = 'artista_financeiro';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON (p.module = 'marketing' AND p.action IN ('view', 'create', 'edit')) OR (p.module IN ('artistas', 'lancamentos', 'relatorios') AND p.action = 'view')
WHERE r.name = 'artista_marketing';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.action = 'view' AND p.module IN ('artistas', 'projetos', 'lancamentos', 'royalties', 'agenda')
WHERE r.name = 'artista_leitor';

-- PARTE 6: RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_select ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_select ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY user_roles_select ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('master', 'administrador')));
CREATE POLICY user_roles_all ON user_roles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name IN ('master', 'administrador')));

-- PARTE 7: FUNÇÕES
CREATE OR REPLACE FUNCTION check_user_permission(p_user_id UUID, p_action TEXT, p_module TEXT, p_record_owner_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_is_master BOOLEAN; v_is_artist BOOLEAN; v_has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = p_user_id AND r.name = 'master') INTO v_is_master;
  IF v_is_master THEN RETURN TRUE; END IF;
  SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN role_permissions rp ON ur.role_id = rp.role_id JOIN permissions p ON rp.permission_id = p.id WHERE ur.user_id = p_user_id AND p.action = p_action AND p.module = p_module) INTO v_has_perm;
  IF NOT v_has_perm THEN RETURN FALSE; END IF;
  SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = p_user_id AND r.name LIKE 'artista_%') INTO v_is_artist;
  IF v_is_artist AND p_record_owner_id IS NOT NULL THEN RETURN p_record_owner_id = p_user_id; END IF;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE (role_name TEXT, sector TEXT, action TEXT, module TEXT) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT r.name, ur.sector, p.action, p.module FROM user_roles ur JOIN roles r ON ur.role_id = r.id JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON rp.permission_id = p.id WHERE ur.user_id = p_user_id;
END; $$;

-- PARTE 8: VIEW
CREATE VIEW v_user_permissions AS
SELECT ur.user_id, r.name AS role_name, r.description AS role_description, ur.sector, ur.artist_id, p.action, p.module, p.action || ':' || p.module AS permission_key
FROM user_roles ur JOIN roles r ON ur.role_id = r.id JOIN role_permissions rp ON r.id = rp.role_id JOIN permissions p ON rp.permission_id = p.id;
