-- ===========================================
-- PERFORMANCE: Índices para consultas frequentes
-- ===========================================

-- Índices para dashboard e contagens
CREATE INDEX IF NOT EXISTS idx_music_registry_created_at ON public.music_registry(created_at);
CREATE INDEX IF NOT EXISTS idx_music_registry_status ON public.music_registry(status);
CREATE INDEX IF NOT EXISTS idx_phonograms_created_at ON public.phonograms(created_at);
CREATE INDEX IF NOT EXISTS idx_phonograms_status ON public.phonograms(status);
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON public.releases(created_at);
CREATE INDEX IF NOT EXISTS idx_releases_status ON public.releases(status);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON public.releases(release_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_effective_to ON public.contracts(effective_to);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON public.financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_agenda_events_start_date ON public.agenda_events(start_date);
CREATE INDEX IF NOT EXISTS idx_agenda_events_artist_id ON public.agenda_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);
CREATE INDEX IF NOT EXISTS idx_artists_contract_status ON public.artists(contract_status);

-- Índice composto para relatórios financeiros mensais
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date_type ON public.financial_transactions(date, type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date_status ON public.financial_transactions(date, status);

-- ===========================================
-- TABELA: system_alerts (Alertas automáticos)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- contract_expiry, obra_pending, release_pending, financial_alert
  severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT, -- contract, obra, release, financial
  entity_id UUID,
  entity_name TEXT,
  days_until_due INTEGER,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: admin and manager can see all, users see their own
CREATE POLICY "system_alerts_select_admin_manager" ON public.system_alerts
  FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    user_id = auth.uid()
  );

CREATE POLICY "system_alerts_insert_system" ON public.system_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "system_alerts_update_own" ON public.system_alerts
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR 
    user_id = auth.uid()
  );

CREATE POLICY "system_alerts_delete_admin" ON public.system_alerts
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ===========================================
-- TABELA: scheduled_notifications (Notificações agendadas)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL, -- contract_expiry, event_reminder, release_reminder
  entity_type TEXT NOT NULL, -- contract, agenda_event, release
  entity_id UUID NOT NULL,
  recipient_type TEXT NOT NULL, -- artist, manager, label, user
  recipient_id UUID,
  recipient_phone TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  channels TEXT[] DEFAULT ARRAY['email', 'whatsapp'], -- email, sms, whatsapp
  message_template TEXT NOT NULL,
  message_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_notifications_select_admin" ON public.scheduled_notifications
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "scheduled_notifications_insert_system" ON public.scheduled_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "scheduled_notifications_update_admin" ON public.scheduled_notifications
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "scheduled_notifications_delete_admin" ON public.scheduled_notifications
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for scheduled notifications
CREATE INDEX idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_entity ON public.scheduled_notifications(entity_type, entity_id);

-- ===========================================
-- TABELA: automated_reports (Relatórios automatizados)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- financial_monthly, royalties, artist_statement
  report_name TEXT NOT NULL,
  frequency TEXT NOT NULL, -- daily, weekly, monthly, quarterly
  last_generated_at TIMESTAMP WITH TIME ZONE,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  recipients JSONB DEFAULT '[]', -- [{email, name, role}]
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automated_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automated_reports_select" ON public.automated_reports
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "automated_reports_manage_admin" ON public.automated_reports
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ===========================================
-- FUNÇÃO: Gerar alertas de contratos vencendo
-- ===========================================

CREATE OR REPLACE FUNCTION public.generate_contract_expiry_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contract_record RECORD;
  days_remaining INTEGER;
  alert_severity TEXT;
  alert_exists BOOLEAN;
BEGIN
  -- Loop through active contracts with end dates
  FOR contract_record IN
    SELECT 
      c.id,
      c.title,
      c.end_date,
      c.effective_to,
      c.artist_id,
      a.name as artist_name,
      a.stage_name
    FROM contracts c
    LEFT JOIN artists a ON c.artist_id = a.id
    WHERE c.status IN ('ativo', 'active', 'assinado', 'signed')
      AND (c.end_date IS NOT NULL OR c.effective_to IS NOT NULL)
  LOOP
    -- Calculate days remaining
    days_remaining := LEAST(
      COALESCE((contract_record.end_date::date - CURRENT_DATE), 999),
      COALESCE((contract_record.effective_to::date - CURRENT_DATE), 999)
    );
    
    -- Only process if within 90 days
    IF days_remaining > 0 AND days_remaining <= 90 THEN
      -- Determine severity
      IF days_remaining <= 30 THEN
        alert_severity := 'critical';
      ELSIF days_remaining <= 60 THEN
        alert_severity := 'warning';
      ELSE
        alert_severity := 'info';
      END IF;
      
      -- Check if alert already exists for this contract
      SELECT EXISTS(
        SELECT 1 FROM system_alerts
        WHERE entity_id = contract_record.id
          AND alert_type = 'contract_expiry'
          AND resolved_at IS NULL
          AND is_dismissed = false
      ) INTO alert_exists;
      
      IF NOT alert_exists THEN
        INSERT INTO system_alerts (
          alert_type, severity, title, message,
          entity_type, entity_id, entity_name, days_until_due
        ) VALUES (
          'contract_expiry',
          alert_severity,
          'Contrato Vencendo',
          format('O contrato "%s" com %s vence em %s dias.',
            contract_record.title,
            COALESCE(contract_record.stage_name, contract_record.artist_name, 'Artista'),
            days_remaining
          ),
          'contract',
          contract_record.id,
          contract_record.title,
          days_remaining
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ===========================================
-- FUNÇÃO: Gerar alertas de obras pendentes
-- ===========================================

CREATE OR REPLACE FUNCTION public.generate_obra_pending_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  obra_record RECORD;
  days_pending INTEGER;
  alert_exists BOOLEAN;
BEGIN
  FOR obra_record IN
    SELECT 
      m.id,
      m.title,
      m.status,
      m.created_at,
      a.name as artist_name,
      a.stage_name
    FROM music_registry m
    LEFT JOIN artists a ON m.artist_id = a.id
    WHERE m.status IN ('pendente', 'pending', 'em_analise', 'in_review')
  LOOP
    days_pending := CURRENT_DATE - obra_record.created_at::date;
    
    -- Alert if pending for more than 7 days
    IF days_pending >= 7 THEN
      SELECT EXISTS(
        SELECT 1 FROM system_alerts
        WHERE entity_id = obra_record.id
          AND alert_type = 'obra_pending'
          AND resolved_at IS NULL
          AND is_dismissed = false
      ) INTO alert_exists;
      
      IF NOT alert_exists THEN
        INSERT INTO system_alerts (
          alert_type, severity, title, message,
          entity_type, entity_id, entity_name, days_until_due
        ) VALUES (
          'obra_pending',
          CASE WHEN days_pending >= 30 THEN 'critical' WHEN days_pending >= 14 THEN 'warning' ELSE 'info' END,
          'Obra Pendente de Registro',
          format('A obra "%s" de %s está pendente há %s dias.',
            obra_record.title,
            COALESCE(obra_record.stage_name, obra_record.artist_name, 'Artista'),
            days_pending
          ),
          'obra',
          obra_record.id,
          obra_record.title,
          days_pending
        );
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- ===========================================
-- FUNÇÃO: Gerar alertas de lançamentos sem data
-- ===========================================

CREATE OR REPLACE FUNCTION public.generate_release_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  release_record RECORD;
  alert_exists BOOLEAN;
BEGIN
  FOR release_record IN
    SELECT 
      r.id,
      r.title,
      r.status,
      r.release_date,
      r.created_at,
      a.name as artist_name,
      a.stage_name
    FROM releases r
    LEFT JOIN artists a ON r.artist_id = a.id
    WHERE (r.release_date IS NULL AND r.status NOT IN ('cancelado', 'cancelled', 'lançado', 'released'))
       OR (r.status IN ('em_analise', 'pending', 'planning') AND r.release_date IS NOT NULL 
           AND r.release_date::date <= CURRENT_DATE + INTERVAL '7 days')
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM system_alerts
      WHERE entity_id = release_record.id
        AND alert_type = 'release_pending'
        AND resolved_at IS NULL
        AND is_dismissed = false
    ) INTO alert_exists;
    
    IF NOT alert_exists THEN
      INSERT INTO system_alerts (
        alert_type, severity, title, message,
        entity_type, entity_id, entity_name
      ) VALUES (
        'release_pending',
        CASE 
          WHEN release_record.release_date IS NULL THEN 'warning'
          WHEN release_record.release_date::date <= CURRENT_DATE THEN 'critical'
          ELSE 'info'
        END,
        CASE 
          WHEN release_record.release_date IS NULL THEN 'Lançamento Sem Data'
          ELSE 'Lançamento Próximo'
        END,
        CASE 
          WHEN release_record.release_date IS NULL THEN 
            format('O lançamento "%s" de %s não possui data definida.',
              release_record.title,
              COALESCE(release_record.stage_name, release_record.artist_name, 'Artista'))
          ELSE
            format('O lançamento "%s" de %s está programado para %s.',
              release_record.title,
              COALESCE(release_record.stage_name, release_record.artist_name, 'Artista'),
              to_char(release_record.release_date, 'DD/MM/YYYY'))
        END,
        'release',
        release_record.id,
        release_record.title
      );
    END IF;
  END LOOP;
END;
$$;

-- ===========================================
-- FUNÇÃO: Agendar notificações de contrato
-- ===========================================

CREATE OR REPLACE FUNCTION public.schedule_contract_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contract_record RECORD;
  days_before INTEGER;
  notification_exists BOOLEAN;
BEGIN
  -- Schedule notifications for contracts expiring in 90, 60, 30 days
  FOR days_before IN SELECT unnest(ARRAY[90, 60, 30])
  LOOP
    FOR contract_record IN
      SELECT 
        c.id,
        c.title,
        c.end_date,
        c.effective_to,
        c.artist_id,
        a.name as artist_name,
        a.stage_name,
        a.phone as artist_phone,
        a.email as artist_email,
        a.manager_name,
        a.manager_phone,
        a.manager_email
      FROM contracts c
      LEFT JOIN artists a ON c.artist_id = a.id
      WHERE c.status IN ('ativo', 'active', 'assinado', 'signed')
        AND (
          (c.end_date IS NOT NULL AND c.end_date::date = CURRENT_DATE + (days_before || ' days')::interval)
          OR (c.effective_to IS NOT NULL AND c.effective_to::date = CURRENT_DATE + (days_before || ' days')::interval)
        )
    LOOP
      -- Check if notification already scheduled
      SELECT EXISTS(
        SELECT 1 FROM scheduled_notifications
        WHERE entity_id = contract_record.id
          AND notification_type = 'contract_expiry'
          AND scheduled_for::date = CURRENT_DATE
          AND status = 'pending'
      ) INTO notification_exists;
      
      IF NOT notification_exists THEN
        -- Schedule for artist
        IF contract_record.artist_phone IS NOT NULL OR contract_record.artist_email IS NOT NULL THEN
          INSERT INTO scheduled_notifications (
            notification_type, entity_type, entity_id,
            recipient_type, recipient_id, recipient_phone, recipient_email, recipient_name,
            scheduled_for, message_template, message_data
          ) VALUES (
            'contract_expiry', 'contract', contract_record.id,
            'artist', contract_record.artist_id, 
            contract_record.artist_phone, contract_record.artist_email,
            COALESCE(contract_record.stage_name, contract_record.artist_name),
            now(),
            'contract_expiry_reminder',
            jsonb_build_object(
              'contract_title', contract_record.title,
              'days_remaining', days_before,
              'artist_name', COALESCE(contract_record.stage_name, contract_record.artist_name)
            )
          );
        END IF;
        
        -- Schedule for manager
        IF contract_record.manager_phone IS NOT NULL OR contract_record.manager_email IS NOT NULL THEN
          INSERT INTO scheduled_notifications (
            notification_type, entity_type, entity_id,
            recipient_type, recipient_phone, recipient_email, recipient_name,
            scheduled_for, message_template, message_data
          ) VALUES (
            'contract_expiry', 'contract', contract_record.id,
            'manager',
            contract_record.manager_phone, contract_record.manager_email,
            contract_record.manager_name,
            now(),
            'contract_expiry_manager',
            jsonb_build_object(
              'contract_title', contract_record.title,
              'days_remaining', days_before,
              'artist_name', COALESCE(contract_record.stage_name, contract_record.artist_name)
            )
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- ===========================================
-- TRIGGER: Atualizar timestamp
-- ===========================================

CREATE OR REPLACE TRIGGER update_system_alerts_updated_at
  BEFORE UPDATE ON public.system_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_automated_reports_updated_at
  BEFORE UPDATE ON public.automated_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();