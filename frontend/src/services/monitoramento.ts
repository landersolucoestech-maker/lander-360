import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface RadioTvDetection {
  id: string;
  music_registry_id?: string | null;
  artist_id?: string | null;
  title: string;
  artist_name?: string | null;
  platform: string;
  station_channel?: string | null;
  detected_at: string;
  duration_seconds?: number | null;
  confidence_score?: number | null;
  fingerprint_provider?: string | null;
  status: string;
  ecad_matched: boolean;
  ecad_report_id?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
}

export interface EcadReport {
  id: string;
  report_period: string;
  report_type: string;
  file_url?: string | null;
  file_name?: string | null;
  total_records: number;
  matched_records: number;
  unmatched_records: number;
  divergent_records: number;
  total_value: number;
  import_status: string;
  import_error?: string | null;
  imported_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EcadReportItem {
  id: string;
  ecad_report_id: string;
  music_registry_id?: string | null;
  ecad_work_code?: string | null;
  title?: string | null;
  artist_name?: string | null;
  execution_count: number;
  execution_value: number;
  platform?: string | null;
  period?: string | null;
  matched: boolean;
  divergence_type?: string | null;
  divergence_notes?: string | null;
  created_at: string;
}

export interface EcadDivergence {
  id: string;
  detection_id?: string | null;
  ecad_report_item_id?: string | null;
  music_registry_id?: string | null;
  divergence_type: string;
  detected_count?: number | null;
  ecad_count?: number | null;
  detected_value?: number | null;
  ecad_value?: number | null;
  status: string;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  updated_at: string;
}

export class MonitoramentoService {
  // Radio/TV Detections
  static async getDetections(): Promise<RadioTvDetection[]> {
    const { data, error } = await supabase
      .from('radio_tv_detections')
      .select('*')
      .order('detected_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getDetectionsByDate(date: string): Promise<RadioTvDetection[]> {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    
    const { data, error } = await supabase
      .from('radio_tv_detections')
      .select('*')
      .gte('detected_at', startOfDay)
      .lte('detected_at', endOfDay)
      .order('detected_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createDetection(detection: Omit<Partial<RadioTvDetection>, 'id' | 'created_at' | 'updated_at'>): Promise<RadioTvDetection> {
    const { data, error } = await supabase
      .from('radio_tv_detections')
      .insert(detection as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as RadioTvDetection;
  }

  static async updateDetection(id: string, updates: Partial<RadioTvDetection>): Promise<RadioTvDetection> {
    const { data, error } = await supabase
      .from('radio_tv_detections')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as RadioTvDetection;
  }

  static async deleteDetection(id: string): Promise<void> {
    const { error } = await supabase
      .from('radio_tv_detections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ECAD Reports
  static async getEcadReports(): Promise<EcadReport[]> {
    const { data, error } = await supabase
      .from('ecad_reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createEcadReport(report: Omit<Partial<EcadReport>, 'id' | 'created_at' | 'updated_at'>): Promise<EcadReport> {
    const { data, error } = await supabase
      .from('ecad_reports')
      .insert(report as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as EcadReport;
  }

  static async updateEcadReport(id: string, updates: Partial<EcadReport>): Promise<EcadReport> {
    const { data, error } = await supabase
      .from('ecad_reports')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as EcadReport;
  }

  static async deleteEcadReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('ecad_reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // ECAD Report Items
  static async getEcadReportItems(reportId: string): Promise<EcadReportItem[]> {
    const { data, error } = await supabase
      .from('ecad_report_items')
      .select('*')
      .eq('ecad_report_id', reportId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createEcadReportItem(item: Omit<Partial<EcadReportItem>, 'id' | 'created_at'>): Promise<EcadReportItem> {
    const { data, error } = await supabase
      .from('ecad_report_items')
      .insert(item as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as EcadReportItem;
  }

  // ECAD Divergences
  static async getDivergences(): Promise<EcadDivergence[]> {
    const { data, error } = await supabase
      .from('ecad_divergences')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getOpenDivergences(): Promise<EcadDivergence[]> {
    const { data, error } = await supabase
      .from('ecad_divergences')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createDivergence(divergence: Omit<Partial<EcadDivergence>, 'id' | 'created_at' | 'updated_at'>): Promise<EcadDivergence> {
    const { data, error } = await supabase
      .from('ecad_divergences')
      .insert(divergence as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as EcadDivergence;
  }

  static async updateDivergence(id: string, updates: Partial<EcadDivergence>): Promise<EcadDivergence> {
    const { data, error } = await supabase
      .from('ecad_divergences')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as EcadDivergence;
  }

  // Stats
  static async getDetectionStats(): Promise<{
    totalToday: number;
    pending: number;
    unreported: number;
    verified: number;
    matchRate: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const detections = await this.getDetectionsByDate(today);
    
    const pending = detections.filter(d => d.status === 'pending').length;
    const unreported = detections.filter(d => d.status === 'unreported').length;
    const verified = detections.filter(d => d.status === 'verified').length;
    const matchRate = detections.length > 0 ? (verified / detections.length) * 100 : 0;
    
    return {
      totalToday: detections.length,
      pending,
      unreported,
      verified,
      matchRate
    };
  }
}
