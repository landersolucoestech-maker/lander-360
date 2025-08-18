import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AgendaEvent = Database['public']['Tables']['agenda_events']['Row'];
type AgendaEventInsert = Database['public']['Tables']['agenda_events']['Insert'];
type AgendaEventUpdate = Database['public']['Tables']['agenda_events']['Update'];

export class AgendaService {
  static async getAll(): Promise<AgendaEvent[]> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<AgendaEvent | null> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(event: AgendaEventInsert): Promise<AgendaEvent> {
    const { data, error } = await supabase
      .from('agenda_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: AgendaEventUpdate): Promise<AgendaEvent> {
    const { data, error } = await supabase
      .from('agenda_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByDateRange(startDate: string, endDate: string): Promise<AgendaEvent[]> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getByArtist(artistId: string): Promise<AgendaEvent[]> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('artist_id', artistId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getByProject(projectId: string): Promise<AgendaEvent[]> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUpcoming(): Promise<AgendaEvent[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .gte('start_date', now)
      .order('start_date', { ascending: true })
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}