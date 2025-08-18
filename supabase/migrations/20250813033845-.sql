-- Secure contracts access: fine-grained RLS with contract_access mapping

-- 1) Contract access mapping table
CREATE TABLE IF NOT EXISTS public.contract_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  access_level text NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('viewer','editor','owner')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, contract_id)
);

ALTER TABLE public.contract_access ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contract_access_contract ON public.contract_access(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_access_user ON public.contract_access(user_id);

-- Timestamp trigger
CREATE TRIGGER update_contract_access_updated_at
BEFORE UPDATE ON public.contract_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies for contract_access
DO $$
BEGIN
  -- SELECT: self or privileged
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contract_access' AND policyname = 'Contract access select: self or privileged'
  ) THEN
    CREATE POLICY "Contract access select: self or privileged" ON public.contract_access
    FOR SELECT
    USING (
      user_id = auth.uid() OR
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;

  -- INSERT: privileged only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contract_access' AND policyname = 'Contract access insert: privileged only'
  ) THEN
    CREATE POLICY "Contract access insert: privileged only" ON public.contract_access
    FOR INSERT
    WITH CHECK (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;

  -- UPDATE: privileged only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contract_access' AND policyname = 'Contract access update: privileged only'
  ) THEN
    CREATE POLICY "Contract access update: privileged only" ON public.contract_access
    FOR UPDATE
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    )
    WITH CHECK (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;

  -- DELETE: privileged only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contract_access' AND policyname = 'Contract access delete: privileged only'
  ) THEN
    CREATE POLICY "Contract access delete: privileged only" ON public.contract_access
    FOR DELETE
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;
END
$$;

-- 2) Harden contracts table policies
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Remove overly broad policy if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'contracts' AND policyname = 'Authenticated users can manage contracts'
  ) THEN
    DROP POLICY "Authenticated users can manage contracts" ON public.contracts;
  END IF;
END$$;

-- SELECT policy: privileged roles, explicit access, or project creators
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contracts' AND policyname='Contracts select: privileged or assigned'
  ) THEN
    CREATE POLICY "Contracts select: privileged or assigned" ON public.contracts
    FOR SELECT
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.contract_access ca
        WHERE ca.contract_id = contracts.id AND ca.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = contracts.project_id AND p.created_by = auth.uid()
      )
    );
  END IF;
END$$;

-- INSERT policy: privileged only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contracts' AND policyname='Contracts insert: privileged only'
  ) THEN
    CREATE POLICY "Contracts insert: privileged only" ON public.contracts
    FOR INSERT
    WITH CHECK (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role)
    );
  END IF;
END$$;

-- UPDATE policy: privileged or editors/owners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contracts' AND policyname='Contracts update: privileged or editors'
  ) THEN
    CREATE POLICY "Contracts update: privileged or editors" ON public.contracts
    FOR UPDATE
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.contract_access ca
        WHERE ca.contract_id = contracts.id AND ca.user_id = auth.uid() AND ca.access_level IN ('editor','owner')
      )
    )
    WITH CHECK (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.contract_access ca
        WHERE ca.contract_id = contracts.id AND ca.user_id = auth.uid() AND ca.access_level IN ('editor','owner')
      )
    );
  END IF;
END$$;

-- DELETE policy: privileged or owners
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contracts' AND policyname='Contracts delete: privileged or owners'
  ) THEN
    CREATE POLICY "Contracts delete: privileged or owners" ON public.contracts
    FOR DELETE
    USING (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'manager'::app_role) OR
      has_role(auth.uid(), 'master'::app_role) OR
      EXISTS (
        SELECT 1 FROM public.contract_access ca
        WHERE ca.contract_id = contracts.id AND ca.user_id = auth.uid() AND ca.access_level = 'owner'
      )
    );
  END IF;
END$$;

-- 3) Backfill: project creators become owners for related contracts
INSERT INTO public.contract_access (user_id, contract_id, access_level)
SELECT p.created_by, c.id, 'owner'
FROM public.contracts c
JOIN public.projects p ON p.id = c.project_id
ON CONFLICT (user_id, contract_id) DO NOTHING;