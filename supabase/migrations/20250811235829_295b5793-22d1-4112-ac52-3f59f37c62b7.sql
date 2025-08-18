-- Inserir usuário padrão admin com role de admin
-- Primeiro vamos inserir na tabela de profiles
INSERT INTO public.profiles (user_id, full_name, email) 
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Administrador',
  (SELECT email FROM auth.users LIMIT 1)
);

-- Inserir role de admin para o usuário
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'admin'
);

-- Verificar se funcionou
SELECT p.full_name, p.email, ur.role 
FROM public.profiles p
JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'admin';