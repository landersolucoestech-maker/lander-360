-- Criar uma política temporária para permitir que usuários se tornem admin se não existir nenhum admin
CREATE OR REPLACE FUNCTION public.is_first_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  );
$$;

-- Política temporária para permitir que o primeiro usuário se torne admin
CREATE POLICY "Allow first admin creation" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  is_first_admin() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'manager'::app_role)
);