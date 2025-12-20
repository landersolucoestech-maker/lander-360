import { supabase } from '@/integrations/supabase/client';
import { Release, ReleaseInsert, ReleaseUpdate, ReleaseWithDetails } from '@/types/database';

export class ReleasesService {
  static async getAll(): Promise<Release[]> {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Release | null> {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getWithDetails(id: string): Promise<ReleaseWithDetails | null> {
    const release = await this.getById(id);
    if (!release) return null;
    
    return {
      ...release,
      // Add related data when available
    };
  }

  static async create(release: ReleaseInsert): Promise<Release> {
    const { data, error } = await supabase
      .from('releases')
      .insert(release)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: ReleaseUpdate): Promise<Release> {
    const { data, error } = await supabase
      .from('releases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('releases')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByArtist(artistId: string): Promise<Release[]> {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByType(type: 'single' | 'ep' | 'album' | 'compilation'): Promise<Release[]> {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('release_type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('releases')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
}