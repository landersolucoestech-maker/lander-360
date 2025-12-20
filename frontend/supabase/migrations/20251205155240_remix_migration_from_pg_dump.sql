CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'manager',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: agenda_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    event_type text DEFAULT 'meeting'::text,
    artist_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: artists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    stage_name text,
    genre text,
    email text,
    phone text,
    bio text,
    image_url text,
    contract_status text DEFAULT 'active'::text,
    spotify_url text,
    instagram_url text,
    youtube_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    legal_name text,
    instagram text,
    spotify_id text,
    youtube_channel_id text
);


--
-- Name: compositions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compositions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    writers text[],
    publishers text[],
    iswc text,
    track_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    artist_id uuid,
    start_date date,
    end_date date,
    value numeric(12,2),
    status text DEFAULT 'draft'::text,
    document_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contract_type text DEFAULT 'recording'::text,
    effective_from date,
    effective_to date,
    royalty_rate numeric(5,2),
    advance_amount numeric(12,2),
    notes text
);


--
-- Name: contributors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role text,
    track_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    company text,
    "position" text,
    contact_type text DEFAULT 'lead'::text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: distributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.distributions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    release_id uuid,
    platform text NOT NULL,
    status text DEFAULT 'pending'::text,
    distributed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    type text NOT NULL,
    category text,
    date date NOT NULL,
    artist_id uuid,
    project_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    transaction_type text,
    transaction_date date,
    status text DEFAULT 'pending'::text,
    payment_method text
);


--
-- Name: inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    quantity integer DEFAULT 0,
    category text,
    location text,
    status text DEFAULT 'available'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    client_name text NOT NULL,
    client_email text,
    client_document text,
    description text,
    amount numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    status text DEFAULT 'draft'::text,
    issue_date date NOT NULL,
    due_date date,
    paid_date date,
    project_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_briefings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_briefings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text,
    campaign_id uuid,
    status text DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    campaign text,
    description text,
    priority text DEFAULT 'medium'::text,
    created_by_name text,
    deliverables text[],
    target_audience text,
    deadline date,
    budget numeric(12,2)
);


--
-- Name: marketing_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    start_date date,
    end_date date,
    budget numeric(12,2),
    status text DEFAULT 'planning'::text,
    artist_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reach integer DEFAULT 0,
    roas numeric(10,2) DEFAULT 0,
    spent numeric(12,2) DEFAULT 0,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    ctr numeric(5,2) DEFAULT 0,
    cpc numeric(10,2) DEFAULT 0
);


--
-- Name: marketing_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content_type text,
    content_url text,
    campaign_id uuid,
    status text DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: marketing_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketing_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'medium'::text,
    due_date date,
    assigned_to uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    campaign text,
    category text,
    assignee_name text,
    progress integer DEFAULT 0
);


--
-- Name: music_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.music_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    artist_id uuid,
    isrc text,
    iswc text,
    release_date date,
    genre text,
    duration integer,
    bpm integer,
    key text,
    writers text[],
    publishers text[],
    status text DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    role_display text,
    sector text,
    roles text[],
    is_active boolean DEFAULT true,
    permissions text[]
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    artist_id uuid,
    status text DEFAULT 'planning'::text,
    start_date date,
    end_date date,
    budget numeric(12,2),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.releases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    artist_id uuid,
    release_date date,
    type text DEFAULT 'single'::text,
    status text DEFAULT 'planning'::text,
    cover_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    release_type text
);


--
-- Name: social_media_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    metric_type text NOT NULL,
    value integer DEFAULT 0,
    date date NOT NULL,
    artist_id uuid,
    campaign_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reach integer DEFAULT 0,
    followers integer DEFAULT 0,
    engagement_rate numeric(5,2) DEFAULT 0,
    posts_count integer DEFAULT 0,
    stories_count integer DEFAULT 0,
    followers_growth numeric(5,2) DEFAULT 0,
    engagement_growth numeric(5,2) DEFAULT 0,
    reach_growth numeric(5,2) DEFAULT 0
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'medium'::text,
    due_date date,
    project_id uuid,
    assigned_to uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    release_id uuid,
    duration integer,
    isrc text,
    track_number integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    artist_id uuid,
    primary_genre text
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agenda_events agenda_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_pkey PRIMARY KEY (id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- Name: compositions compositions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compositions
    ADD CONSTRAINT compositions_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: contributors contributors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_pkey PRIMARY KEY (id);


--
-- Name: crm_contacts crm_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);


--
-- Name: distributions distributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distributions
    ADD CONSTRAINT distributions_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: marketing_briefings marketing_briefings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_briefings
    ADD CONSTRAINT marketing_briefings_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaigns marketing_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_pkey PRIMARY KEY (id);


--
-- Name: marketing_content marketing_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_pkey PRIMARY KEY (id);


--
-- Name: marketing_tasks marketing_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_tasks
    ADD CONSTRAINT marketing_tasks_pkey PRIMARY KEY (id);


--
-- Name: music_registry music_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_registry
    ADD CONSTRAINT music_registry_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: social_media_metrics social_media_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_metrics
    ADD CONSTRAINT social_media_metrics_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: agenda_events update_agenda_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agenda_events_updated_at BEFORE UPDATE ON public.agenda_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: artists update_artists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contracts update_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_contacts update_crm_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_transactions update_financial_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory update_inventory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_briefings update_marketing_briefings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_briefings_updated_at BEFORE UPDATE ON public.marketing_briefings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_campaigns update_marketing_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_content update_marketing_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_content_updated_at BEFORE UPDATE ON public.marketing_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: marketing_tasks update_marketing_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_marketing_tasks_updated_at BEFORE UPDATE ON public.marketing_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: music_registry update_music_registry_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_music_registry_updated_at BEFORE UPDATE ON public.music_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: releases update_releases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON public.releases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agenda_events agenda_events_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: agenda_events agenda_events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: artists artists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: compositions compositions_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compositions
    ADD CONSTRAINT compositions_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: contracts contracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: contributors contributors_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributors
    ADD CONSTRAINT contributors_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- Name: crm_contacts crm_contacts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: distributions distributions_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.distributions
    ADD CONSTRAINT distributions_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: financial_transactions financial_transactions_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: financial_transactions financial_transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: inventory inventory_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: invoices invoices_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: marketing_briefings marketing_briefings_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_briefings
    ADD CONSTRAINT marketing_briefings_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL;


--
-- Name: marketing_briefings marketing_briefings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_briefings
    ADD CONSTRAINT marketing_briefings_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: marketing_campaigns marketing_campaigns_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: marketing_campaigns marketing_campaigns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_campaigns
    ADD CONSTRAINT marketing_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: marketing_content marketing_content_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL;


--
-- Name: marketing_content marketing_content_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_content
    ADD CONSTRAINT marketing_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: marketing_tasks marketing_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_tasks
    ADD CONSTRAINT marketing_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: marketing_tasks marketing_tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketing_tasks
    ADD CONSTRAINT marketing_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: music_registry music_registry_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_registry
    ADD CONSTRAINT music_registry_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: music_registry music_registry_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_registry
    ADD CONSTRAINT music_registry_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: releases releases_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: releases releases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: social_media_metrics social_media_metrics_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_metrics
    ADD CONSTRAINT social_media_metrics_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: social_media_metrics social_media_metrics_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_metrics
    ADD CONSTRAINT social_media_metrics_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);


--
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tracks tracks_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: tracks tracks_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: artists Admins and managers can insert artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and managers can insert artists" ON public.artists FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: projects Admins and managers can insert projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and managers can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: artists Admins and managers can update artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and managers can update artists" ON public.artists FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: projects Admins and managers can update projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and managers can update projects" ON public.projects FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: artists Admins can delete artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete artists" ON public.artists FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: projects Admins can delete projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: agenda_events Authenticated users can delete agenda_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete agenda_events" ON public.agenda_events FOR DELETE TO authenticated USING (true);


--
-- Name: compositions Authenticated users can delete compositions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete compositions" ON public.compositions FOR DELETE TO authenticated USING (true);


--
-- Name: contracts Authenticated users can delete contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (true);


--
-- Name: contributors Authenticated users can delete contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete contributors" ON public.contributors FOR DELETE TO authenticated USING (true);


--
-- Name: crm_contacts Authenticated users can delete crm_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete crm_contacts" ON public.crm_contacts FOR DELETE TO authenticated USING (true);


--
-- Name: distributions Authenticated users can delete distributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete distributions" ON public.distributions FOR DELETE TO authenticated USING (true);


--
-- Name: financial_transactions Authenticated users can delete financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete financial_transactions" ON public.financial_transactions FOR DELETE TO authenticated USING (true);


--
-- Name: inventory Authenticated users can delete inventory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete inventory" ON public.inventory FOR DELETE TO authenticated USING (true);


--
-- Name: invoices Authenticated users can delete invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);


--
-- Name: marketing_briefings Authenticated users can delete marketing_briefings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete marketing_briefings" ON public.marketing_briefings FOR DELETE TO authenticated USING (true);


--
-- Name: marketing_campaigns Authenticated users can delete marketing_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete marketing_campaigns" ON public.marketing_campaigns FOR DELETE TO authenticated USING (true);


--
-- Name: marketing_content Authenticated users can delete marketing_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete marketing_content" ON public.marketing_content FOR DELETE TO authenticated USING (true);


--
-- Name: marketing_tasks Authenticated users can delete marketing_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete marketing_tasks" ON public.marketing_tasks FOR DELETE TO authenticated USING (true);


--
-- Name: music_registry Authenticated users can delete music_registry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete music_registry" ON public.music_registry FOR DELETE TO authenticated USING (true);


--
-- Name: releases Authenticated users can delete releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete releases" ON public.releases FOR DELETE TO authenticated USING (true);


--
-- Name: social_media_metrics Authenticated users can delete social_media_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete social_media_metrics" ON public.social_media_metrics FOR DELETE TO authenticated USING (true);


--
-- Name: tasks Authenticated users can delete tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);


--
-- Name: tracks Authenticated users can delete tracks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete tracks" ON public.tracks FOR DELETE TO authenticated USING (true);


--
-- Name: agenda_events Authenticated users can insert agenda_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert agenda_events" ON public.agenda_events FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: compositions Authenticated users can insert compositions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert compositions" ON public.compositions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: contracts Authenticated users can insert contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: contributors Authenticated users can insert contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert contributors" ON public.contributors FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: crm_contacts Authenticated users can insert crm_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert crm_contacts" ON public.crm_contacts FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: distributions Authenticated users can insert distributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert distributions" ON public.distributions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: financial_transactions Authenticated users can insert financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert financial_transactions" ON public.financial_transactions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: inventory Authenticated users can insert inventory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert inventory" ON public.inventory FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: invoices Authenticated users can insert invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: marketing_briefings Authenticated users can insert marketing_briefings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert marketing_briefings" ON public.marketing_briefings FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: marketing_campaigns Authenticated users can insert marketing_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert marketing_campaigns" ON public.marketing_campaigns FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: marketing_content Authenticated users can insert marketing_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert marketing_content" ON public.marketing_content FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: marketing_tasks Authenticated users can insert marketing_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert marketing_tasks" ON public.marketing_tasks FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: music_registry Authenticated users can insert music_registry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert music_registry" ON public.music_registry FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: releases Authenticated users can insert releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert releases" ON public.releases FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: social_media_metrics Authenticated users can insert social_media_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert social_media_metrics" ON public.social_media_metrics FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: tasks Authenticated users can insert tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: tracks Authenticated users can insert tracks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert tracks" ON public.tracks FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: agenda_events Authenticated users can update agenda_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update agenda_events" ON public.agenda_events FOR UPDATE TO authenticated USING (true);


--
-- Name: compositions Authenticated users can update compositions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update compositions" ON public.compositions FOR UPDATE TO authenticated USING (true);


--
-- Name: contracts Authenticated users can update contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (true);


--
-- Name: contributors Authenticated users can update contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update contributors" ON public.contributors FOR UPDATE TO authenticated USING (true);


--
-- Name: crm_contacts Authenticated users can update crm_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update crm_contacts" ON public.crm_contacts FOR UPDATE TO authenticated USING (true);


--
-- Name: distributions Authenticated users can update distributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update distributions" ON public.distributions FOR UPDATE TO authenticated USING (true);


--
-- Name: financial_transactions Authenticated users can update financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update financial_transactions" ON public.financial_transactions FOR UPDATE TO authenticated USING (true);


--
-- Name: inventory Authenticated users can update inventory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update inventory" ON public.inventory FOR UPDATE TO authenticated USING (true);


--
-- Name: invoices Authenticated users can update invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);


--
-- Name: marketing_briefings Authenticated users can update marketing_briefings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update marketing_briefings" ON public.marketing_briefings FOR UPDATE TO authenticated USING (true);


--
-- Name: marketing_campaigns Authenticated users can update marketing_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update marketing_campaigns" ON public.marketing_campaigns FOR UPDATE TO authenticated USING (true);


--
-- Name: marketing_content Authenticated users can update marketing_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update marketing_content" ON public.marketing_content FOR UPDATE TO authenticated USING (true);


--
-- Name: marketing_tasks Authenticated users can update marketing_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update marketing_tasks" ON public.marketing_tasks FOR UPDATE TO authenticated USING (true);


--
-- Name: music_registry Authenticated users can update music_registry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update music_registry" ON public.music_registry FOR UPDATE TO authenticated USING (true);


--
-- Name: releases Authenticated users can update releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update releases" ON public.releases FOR UPDATE TO authenticated USING (true);


--
-- Name: social_media_metrics Authenticated users can update social_media_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update social_media_metrics" ON public.social_media_metrics FOR UPDATE TO authenticated USING (true);


--
-- Name: tasks Authenticated users can update tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);


--
-- Name: tracks Authenticated users can update tracks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update tracks" ON public.tracks FOR UPDATE TO authenticated USING (true);


--
-- Name: agenda_events Authenticated users can view agenda_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view agenda_events" ON public.agenda_events FOR SELECT TO authenticated USING (true);


--
-- Name: artists Authenticated users can view artists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view artists" ON public.artists FOR SELECT TO authenticated USING (true);


--
-- Name: compositions Authenticated users can view compositions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view compositions" ON public.compositions FOR SELECT TO authenticated USING (true);


--
-- Name: contracts Authenticated users can view contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view contracts" ON public.contracts FOR SELECT TO authenticated USING (true);


--
-- Name: contributors Authenticated users can view contributors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view contributors" ON public.contributors FOR SELECT TO authenticated USING (true);


--
-- Name: crm_contacts Authenticated users can view crm_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view crm_contacts" ON public.crm_contacts FOR SELECT TO authenticated USING (true);


--
-- Name: distributions Authenticated users can view distributions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view distributions" ON public.distributions FOR SELECT TO authenticated USING (true);


--
-- Name: financial_transactions Authenticated users can view financial_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view financial_transactions" ON public.financial_transactions FOR SELECT TO authenticated USING (true);


--
-- Name: inventory Authenticated users can view inventory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);


--
-- Name: invoices Authenticated users can view invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);


--
-- Name: marketing_briefings Authenticated users can view marketing_briefings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view marketing_briefings" ON public.marketing_briefings FOR SELECT TO authenticated USING (true);


--
-- Name: marketing_campaigns Authenticated users can view marketing_campaigns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view marketing_campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated USING (true);


--
-- Name: marketing_content Authenticated users can view marketing_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view marketing_content" ON public.marketing_content FOR SELECT TO authenticated USING (true);


--
-- Name: marketing_tasks Authenticated users can view marketing_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view marketing_tasks" ON public.marketing_tasks FOR SELECT TO authenticated USING (true);


--
-- Name: music_registry Authenticated users can view music_registry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view music_registry" ON public.music_registry FOR SELECT TO authenticated USING (true);


--
-- Name: projects Authenticated users can view projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT TO authenticated USING (true);


--
-- Name: releases Authenticated users can view releases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view releases" ON public.releases FOR SELECT TO authenticated USING (true);


--
-- Name: social_media_metrics Authenticated users can view social_media_metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view social_media_metrics" ON public.social_media_metrics FOR SELECT TO authenticated USING (true);


--
-- Name: tasks Authenticated users can view tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);


--
-- Name: tracks Authenticated users can view tracks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tracks" ON public.tracks FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: agenda_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

--
-- Name: artists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

--
-- Name: compositions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.compositions ENABLE ROW LEVEL SECURITY;

--
-- Name: contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: contributors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contributors ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: distributions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_briefings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_content ENABLE ROW LEVEL SECURITY;

--
-- Name: marketing_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: music_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.music_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: releases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;

--
-- Name: social_media_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_media_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: tracks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


