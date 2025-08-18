-- =============================================================================
-- CORREÇÃO DE SEGURANÇA: PROTEÇÃO DE DADOS SENSÍVEIS DE ARTISTAS (CORRIGIDA)
-- =============================================================================

-- 1. Criar função para mascarar dados sensíveis baseado no nível de acesso
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(
  p_email TEXT,
  p_phone TEXT,
  p_user_id UUID DEFAULT auth.uid()
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  masked_data JSONB;
BEGIN
  -- Obter role do usuário atual
  SELECT role INTO user_role 
  FROM public.user_roles 
  WHERE user_id = p_user_id 
  LIMIT 1;
  
  -- Se não tem role definida, assume 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  -- Admins e managers veem dados completos
  IF user_role IN ('admin', 'manager') THEN
    masked_data := jsonb_build_object(
      'email', p_email,
      'phone', p_phone,
      'access_level', 'full'
    );
  -- Usuários comuns veem dados mascarados
  ELSE
    masked_data := jsonb_build_object(
      'email', CASE 
        WHEN p_email IS NOT NULL THEN 
          SUBSTRING(p_email, 1, 2) || '***@' || SPLIT_PART(p_email, '@', 2)
        ELSE NULL 
      END,
      'phone', CASE 
        WHEN p_phone IS NOT NULL THEN 
          SUBSTRING(p_phone, 1, 4) || '***' || RIGHT(p_phone, 2)
        ELSE NULL 
      END,
      'access_level', 'masked'
    );
  END IF;
  
  RETURN masked_data;
END;
$$;

-- 2. Criar view segura para artistas com dados mascarados (CORRIGIDA)
CREATE OR REPLACE VIEW public.artists_secure AS
SELECT 
  a.id,
  a.name,
  a.stage_name,
  -- Usar função de mascaramento para dados sensíveis
  (public.mask_sensitive_data(a.email, a.phone))->>'access_level' as data_access_level,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.email
    ELSE (public.mask_sensitive_data(a.email, a.phone))->>'email'
  END as email,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.phone
    ELSE (public.mask_sensitive_data(a.email, a.phone))->>'phone'
  END as phone,
  a.genre,
  a.bio,
  a.social_media,
  a.created_at,
  a.updated_at
FROM public.artists a;

-- 3. Criar função para log de auditoria de acesso a dados sensíveis
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_access_type TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log apenas se usuário não é admin (admins têm acesso legítimo)
  IF NOT has_role(auth.uid(), 'admin') THEN
    INSERT INTO public.user_activity_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address
    ) VALUES (
      auth.uid(),
      p_access_type,
      p_resource_type,
      p_resource_id,
      jsonb_build_object(
        'sensitive_data_access', true,
        'timestamp', NOW(),
        'warning', 'Acesso a dados sensíveis monitorado'
      ),
      inet_client_addr()
    );
  END IF;
END;
$$;

-- 4. Atualizar políticas RLS para serem mais restritivas
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins and managers can view all artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can create artists" ON public.artists;
DROP POLICY IF EXISTS "Admins and managers can update artists" ON public.artists;
DROP POLICY IF EXISTS "Only admins can delete artists" ON public.artists;

-- Criar novas políticas mais seguras
-- SELECT: Apenas admin/manager podem ver dados completos
CREATE POLICY "Secure artist data access" ON public.artists
FOR SELECT USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);

-- INSERT: Apenas admin/manager podem criar
CREATE POLICY "Admins and managers can create artists" ON public.artists
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);

-- UPDATE: Apenas admin/manager podem atualizar
CREATE POLICY "Admins and managers can update artists" ON public.artists
FOR UPDATE USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
) WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')
);

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Only admins can delete artists" ON public.artists
FOR DELETE USING (
  has_role(auth.uid(), 'admin')
);

-- 5. Criar função para acessar artistas de forma segura
CREATE OR REPLACE FUNCTION public.get_artists_secure()
RETURNS TABLE(
  id UUID,
  name TEXT,
  stage_name TEXT,
  email TEXT,
  phone TEXT,
  genre TEXT,
  bio TEXT,
  social_media JSONB,
  data_access_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log do acesso
  PERFORM public.log_sensitive_data_access('artists', NULL, 'bulk_access');
  
  -- Retornar dados baseado no nível de acesso
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.stage_name,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.email
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'email'
    END as email,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN a.phone
      ELSE (public.mask_sensitive_data(a.email, a.phone))->>'phone'
    END as phone,
    a.genre,
    a.bio,
    a.social_media,
    CASE 
      WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') THEN 'full'
      ELSE 'masked'
    END as data_access_level,
    a.created_at,
    a.updated_at
  FROM public.artists a;
END;
$$;