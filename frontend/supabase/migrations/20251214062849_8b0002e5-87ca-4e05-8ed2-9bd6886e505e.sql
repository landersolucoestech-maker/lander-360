-- Create table for imported royalty reports metadata
CREATE TABLE public.royalty_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor TEXT NOT NULL CHECK (distributor IN ('onerpm', 'distrokid')),
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  record_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  report_month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for ONErpm Statement data
CREATE TABLE public.royalty_onerpm_statement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  faixa TEXT,
  artista TEXT,
  isrc TEXT,
  territorio TEXT,
  streams INTEGER DEFAULT 0,
  receitas NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Summary data
CREATE TABLE public.royalty_onerpm_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  title TEXT,
  album_channel TEXT,
  artists TEXT,
  product_type TEXT,
  parent_id TEXT,
  item_id TEXT,
  sales_type TEXT,
  quantity INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details Summary
CREATE TABLE public.royalty_onerpm_details_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  source TEXT,
  transaction_month TEXT,
  currency TEXT DEFAULT 'USD',
  catalog_revenue NUMERIC(15,6) DEFAULT 0,
  share_in NUMERIC(10,4) DEFAULT 0,
  share_out NUMERIC(10,4) DEFAULT 0,
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details Masters
CREATE TABLE public.royalty_onerpm_details_masters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  album_title TEXT,
  track_title TEXT,
  artists TEXT,
  label TEXT,
  upc TEXT,
  isrc TEXT,
  product_type TEXT,
  store TEXT,
  territory TEXT,
  sale_type TEXT,
  transaction_month TEXT,
  accounted_date TEXT,
  original_currency TEXT,
  gross_original NUMERIC(15,6) DEFAULT 0,
  exchange_rate NUMERIC(15,6) DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  gross NUMERIC(15,6) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  avg_unit_gross NUMERIC(15,6) DEFAULT 0,
  share_percent NUMERIC(10,4) DEFAULT 0,
  fees NUMERIC(15,6) DEFAULT 0,
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details YouTube
CREATE TABLE public.royalty_onerpm_details_youtube (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  video_title TEXT,
  channel_name TEXT,
  channel_id TEXT,
  video_id TEXT,
  store TEXT,
  territory TEXT,
  sale_type TEXT,
  transaction_month TEXT,
  accounted_date TEXT,
  original_currency TEXT,
  gross_original NUMERIC(15,6) DEFAULT 0,
  exchange_rate NUMERIC(15,6) DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  gross NUMERIC(15,6) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  avg_unit_gross NUMERIC(15,6) DEFAULT 0,
  share_percent NUMERIC(10,4) DEFAULT 0,
  fees NUMERIC(15,6) DEFAULT 0,
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details Publishing
CREATE TABLE public.royalty_onerpm_details_publishing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  song_title TEXT,
  writers TEXT,
  performers TEXT,
  custom_id TEXT,
  iswc TEXT,
  isrc TEXT,
  revenue_source TEXT,
  territory TEXT,
  transaction_month TEXT,
  accounted_date TEXT,
  owned_share NUMERIC(10,4) DEFAULT 0,
  original_currency TEXT,
  gross_original NUMERIC(15,6) DEFAULT 0,
  exchange_rate NUMERIC(15,6) DEFAULT 1,
  currency TEXT DEFAULT 'USD',
  gross NUMERIC(15,6) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  avg_unit_gross NUMERIC(15,6) DEFAULT 0,
  share_percent NUMERIC(10,4) DEFAULT 0,
  fees NUMERIC(15,6) DEFAULT 0,
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details Share In/Out
CREATE TABLE public.royalty_onerpm_details_share (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  title TEXT,
  artists TEXT,
  product_type TEXT,
  item_id TEXT,
  parent_id TEXT,
  store TEXT,
  territory TEXT,
  sale_type TEXT,
  transaction_month TEXT,
  accounted_date TEXT,
  payer_name TEXT,
  receiver_name TEXT,
  share_type TEXT,
  share_percent NUMERIC(10,4) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  quantity INTEGER DEFAULT 0,
  net NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ONErpm Details Commissions
CREATE TABLE public.royalty_onerpm_details_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  title TEXT,
  transaction_month TEXT,
  accounted_date TEXT,
  currency TEXT DEFAULT 'USD',
  revenue NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for DistroKid data
CREATE TABLE public.royalty_distrokid (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.royalty_reports(id) ON DELETE CASCADE,
  inserted TEXT,
  reported TEXT,
  sale_month TEXT,
  store TEXT,
  artist TEXT,
  title TEXT,
  quantity INTEGER DEFAULT 0,
  asset_type TEXT,
  splits TEXT,
  country_of_sale TEXT,
  earnings_usd NUMERIC(15,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_statement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_youtube ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_publishing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_share ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_onerpm_details_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.royalty_distrokid ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin/manager access
CREATE POLICY "Admin and manager can manage royalty_reports"
ON public.royalty_reports FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_statement"
ON public.royalty_onerpm_statement FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_summary"
ON public.royalty_onerpm_summary FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_summary"
ON public.royalty_onerpm_details_summary FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_masters"
ON public.royalty_onerpm_details_masters FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_youtube"
ON public.royalty_onerpm_details_youtube FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_publishing"
ON public.royalty_onerpm_details_publishing FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_share"
ON public.royalty_onerpm_details_share FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_onerpm_details_commissions"
ON public.royalty_onerpm_details_commissions FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));

CREATE POLICY "Admin and manager can manage royalty_distrokid"
ON public.royalty_distrokid FOR ALL
USING ((auth.role() = 'authenticated') AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')));