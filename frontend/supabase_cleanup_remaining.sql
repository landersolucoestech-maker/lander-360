-- REMOVER POLICIES DUPLICADAS RESTANTES

-- artist_sensitive_data
DROP POLICY IF EXISTS artist_sensitive_data_insert ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_select ON public.artist_sensitive_data;
DROP POLICY IF EXISTS artist_sensitive_data_update ON public.artist_sensitive_data;

-- crm_contacts
DROP POLICY IF EXISTS crm_contacts_allow_delete ON public.crm_contacts;
DROP POLICY IF EXISTS crm_contacts_allow_insert ON public.crm_contacts;
DROP POLICY IF EXISTS crm_contacts_allow_read ON public.crm_contacts;
DROP POLICY IF EXISTS crm_contacts_allow_update ON public.crm_contacts;

-- ecad_divergences
DROP POLICY IF EXISTS ecad_divergences_public_read ON public.ecad_divergences;
