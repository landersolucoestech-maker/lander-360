-- Ensure the user has the 'master' role
INSERT INTO public.user_roles (user_id, role)
SELECT '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid, 'master'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid AND role = 'master'::app_role
);

-- Optionally ensure they at least have 'manager' if master insert is skipped
INSERT INTO public.user_roles (user_id, role)
SELECT '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid, 'manager'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid
);
