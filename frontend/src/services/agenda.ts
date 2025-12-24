import { supabase } from '@/integrations/supabase/client';

export class AgendaService {
  static async getAll() {
    const { data, error } = await supabase
      .from('agenda_events')
      .select(`
        *,
        artists:artist_id(id, name, full_name)
      `)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(event: { title: string; start_date: string; description?: string; location?: string; event_type?: string; artist_id?: string }) {
    const { data, error } = await supabase
      .from('agenda_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<{ title: string; start_date: string; description?: string; location?: string; event_type?: string; artist_id?: string }>) {
    const { data, error } = await supabase
      .from('agenda_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getByArtist(artistId: string) {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('artist_id', artistId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUpcoming() {
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