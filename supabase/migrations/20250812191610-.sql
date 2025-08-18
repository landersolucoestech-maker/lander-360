-- Criar o primeiro usuário administrador
-- Inserir role de admin para o usuário existente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'deyvisson.lander@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se foi criado corretamente
-- Esta consulta pode ser executada posteriormente para verificar