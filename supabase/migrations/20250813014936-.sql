-- Ensure 'master' exists in app_role enum (safe add)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'master'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'master';
  END IF;
END $$;

-- Grant 'master' role to the current user (upsert-style insert)
INSERT INTO public.user_roles (user_id, role)
SELECT '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid, 'master'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = '4cf1a2a4-c8f7-410a-901c-8cdfaa292dac'::uuid AND role = 'master'::app_role
);
