-- Corrigir políticas RLS para permitir que admins criem usuários

-- Remover política antiga do profiles para inserção
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Criar nova política que permite tanto usuários criarem seus próprios perfis
-- quanto admins criarem perfis para outros usuários
CREATE POLICY "Users and admins can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR  -- Usuário criando seu próprio perfil
  has_role(auth.uid(), 'admin'::app_role) -- Ou admin criando perfil para outro usuário
);

-- Atualizar política de user_roles para permitir criação por admins
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Recriar política separada para cada operação
CREATE POLICY "Admins can create user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles and admins can view all" 
ON public.user_roles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);