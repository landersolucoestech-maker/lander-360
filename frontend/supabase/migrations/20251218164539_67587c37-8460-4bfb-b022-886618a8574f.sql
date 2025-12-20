-- =============================================
-- TASK 1: SECURITY IMPROVEMENTS
-- =============================================

-- Fix function search_path for all mutable functions
CREATE OR REPLACE FUNCTION public.check_suspicious_login()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  IF NEW.attempt_count >= 3 THEN
    INSERT INTO public.audit_logs (
      action,
      table_name,
      metadata,
      created_at
    ) VALUES (
      'SUSPICIOUS_LOGIN_ATTEMPT',
      'login_attempts',
      jsonb_build_object(
        'email', NEW.email,
        'attempt_count', NEW.attempt_count,
        'locked_until', NEW.locked_until
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- =============================================
-- TASK 2: MONITORAMENTO TABLES
-- =============================================

-- Table for radio/TV fingerprint detections
CREATE TABLE IF NOT EXISTS public.radio_tv_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_registry_id UUID REFERENCES public.music_registry(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist_name TEXT,
  platform TEXT NOT NULL, -- 'radio', 'tv'
  station_channel TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  confidence_score NUMERIC(5,2),
  fingerprint_provider TEXT, -- 'acrcloud', 'gracenote', etc
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'unreported', 'disputed'
  ecad_matched BOOLEAN DEFAULT false,
  ecad_report_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table for ECAD reports
CREATE TABLE IF NOT EXISTS public.ecad_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_period TEXT NOT NULL, -- e.g., '2024-01', '2024-Q1'
  report_type TEXT DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  file_url TEXT,
  file_name TEXT,
  total_records INTEGER DEFAULT 0,
  matched_records INTEGER DEFAULT 0,
  unmatched_records INTEGER DEFAULT 0,
  divergent_records INTEGER DEFAULT 0,
  total_value NUMERIC(15,2) DEFAULT 0,
  import_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  import_error TEXT,
  imported_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table for ECAD report items (detailed records)
CREATE TABLE IF NOT EXISTS public.ecad_report_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ecad_report_id UUID NOT NULL REFERENCES public.ecad_reports(id) ON DELETE CASCADE,
  music_registry_id UUID REFERENCES public.music_registry(id) ON DELETE SET NULL,
  ecad_work_code TEXT,
  title TEXT,
  artist_name TEXT,
  execution_count INTEGER DEFAULT 0,
  execution_value NUMERIC(12,2) DEFAULT 0,
  platform TEXT,
  period TEXT,
  matched BOOLEAN DEFAULT false,
  divergence_type TEXT, -- 'missing_in_system', 'value_mismatch', 'count_mismatch'
  divergence_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for divergences between detections and ECAD
CREATE TABLE IF NOT EXISTS public.ecad_divergences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  detection_id UUID REFERENCES public.radio_tv_detections(id) ON DELETE SET NULL,
  ecad_report_item_id UUID REFERENCES public.ecad_report_items(id) ON DELETE SET NULL,
  music_registry_id UUID REFERENCES public.music_registry(id) ON DELETE SET NULL,
  divergence_type TEXT NOT NULL, -- 'not_in_ecad', 'not_detected', 'value_mismatch', 'count_mismatch'
  detected_count INTEGER,
  ecad_count INTEGER,
  detected_value NUMERIC(12,2),
  ecad_value NUMERIC(12,2),
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'disputed'
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.radio_tv_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecad_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecad_report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecad_divergences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for radio_tv_detections
CREATE POLICY "radio_tv_detections_select_admin_manager" ON public.radio_tv_detections
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "radio_tv_detections_insert_admin_manager" ON public.radio_tv_detections
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "radio_tv_detections_update_admin_manager" ON public.radio_tv_detections
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "radio_tv_detections_delete_admin" ON public.radio_tv_detections
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ecad_reports
CREATE POLICY "ecad_reports_select_admin_manager_financeiro" ON public.ecad_reports
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "ecad_reports_insert_admin_manager" ON public.ecad_reports
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_reports_update_admin_manager" ON public.ecad_reports
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_reports_delete_admin" ON public.ecad_reports
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ecad_report_items
CREATE POLICY "ecad_report_items_select_admin_manager_financeiro" ON public.ecad_report_items
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "ecad_report_items_insert_admin_manager" ON public.ecad_report_items
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_report_items_update_admin_manager" ON public.ecad_report_items
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_report_items_delete_admin" ON public.ecad_report_items
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ecad_divergences
CREATE POLICY "ecad_divergences_select_admin_manager_financeiro" ON public.ecad_divergences
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

CREATE POLICY "ecad_divergences_insert_admin_manager" ON public.ecad_divergences
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_divergences_update_admin_manager" ON public.ecad_divergences
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "ecad_divergences_delete_admin" ON public.ecad_divergences
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_radio_tv_detections_updated_at
  BEFORE UPDATE ON public.radio_tv_detections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecad_reports_updated_at
  BEFORE UPDATE ON public.ecad_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ecad_divergences_updated_at
  BEFORE UPDATE ON public.ecad_divergences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_radio_tv_detections_status ON public.radio_tv_detections(status);
CREATE INDEX IF NOT EXISTS idx_radio_tv_detections_detected_at ON public.radio_tv_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_radio_tv_detections_music_registry ON public.radio_tv_detections(music_registry_id);
CREATE INDEX IF NOT EXISTS idx_ecad_reports_period ON public.ecad_reports(report_period);
CREATE INDEX IF NOT EXISTS idx_ecad_report_items_report_id ON public.ecad_report_items(ecad_report_id);
CREATE INDEX IF NOT EXISTS idx_ecad_divergences_status ON public.ecad_divergences(status);