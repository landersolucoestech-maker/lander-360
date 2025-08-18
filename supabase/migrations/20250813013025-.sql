-- Promote the provided email to 'master' role if the user exists
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE lower(email) = lower('deyvisson.lander@gmail.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Perfil não encontrado para o e-mail % . Peça para o usuário realizar login/registro primeiro.', 'deyvisson.lander@gmail.com';
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    SELECT v_user_id, 'master'::app_role
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = v_user_id AND ur.role = 'master'
    );
  END IF;
END $$;