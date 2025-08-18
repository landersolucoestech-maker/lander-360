import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MusicRegistry = Database['public']['Tables']['music_registry']['Row'];
type MusicRegistryInsert = Database['public']['Tables']['music_registry']['Insert'];
type MusicRegistryUpdate = Database['public']['Tables']['music_registry']['Update'];

export class MusicRegistryService {
  static async getAll(): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<MusicRegistry | null> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(music: MusicRegistryInsert): Promise<MusicRegistry> {
    const { data, error } = await supabase
      .from('music_registry')
      .insert(music)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: MusicRegistryUpdate): Promise<MusicRegistry> {
    const { data, error } = await supabase
      .from('music_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('music_registry')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByArtist(artistId: string): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .eq('artist_id', artistId)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByGenre(genre: string): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .eq('genre', genre)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async search(query: string): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .or(`title.ilike.%${query}%,isrc.ilike.%${query}%,iswc.ilike.%${query}%`)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByComposer(composer: string): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .contains('composers', [composer])
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByProducer(producer: string): Promise<MusicRegistry[]> {
    const { data, error } = await supabase
      .from('music_registry')
      .select('*')
      .contains('producers', [producer])
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}