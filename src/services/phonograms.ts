import { supabase } from '@/integrations/supabase/client';

export interface Phonogram {
  id: string;
  title: string;
  work_id?: string | null;
  isrc?: string | null;
  artist_id?: string | null;
  recording_date?: string | null;
  recording_studio?: string | null;
  recording_location?: string | null;
  duration?: number | null;
  genre?: string | null;
  language?: string | null;
  version_type?: string | null;
  is_remix?: boolean | null;
  remix_artist?: string | null;
  master_owner?: string | null;
  label?: string | null;
  status?: string | null;
  participants?: any[] | null;
  audio_url?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type PhonogramInsert = Omit<Phonogram, 'id' | 'created_at' | 'updated_at'>;
export type PhonogramUpdate = Partial<PhonogramInsert>;

export class PhonogramService {
  static async getAll(): Promise<Phonogram[]> {
    const { data, error } = await supabase
      .from('phonograms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Phonogram[];
  }

  static async getById(id: string): Promise<Phonogram | null> {
    const { data, error } = await supabase
      .from('phonograms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Phonogram | null;
  }

  static async create(phonogram: PhonogramInsert): Promise<Phonogram> {
    const { data, error } = await supabase
      .from('phonograms')
      .insert(phonogram as any)
      .select()
      .single();

    if (error) throw error;
    return data as Phonogram;
  }

  static async update(id: string, updates: PhonogramUpdate): Promise<Phonogram> {
    const { data, error } = await supabase
      .from('phonograms')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Phonogram;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('phonograms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByArtist(artistId: string): Promise<Phonogram[]> {
    const { data, error } = await supabase
      .from('phonograms')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Phonogram[];
  }

  static async getByWork(workId: string): Promise<Phonogram[]> {
    const { data, error } = await supabase
      .from('phonograms')
      .select('*')
      .eq('work_id', workId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Phonogram[];
  }
}
