import { supabase } from '@/integrations/supabase/client';
import { Artist, ArtistInsert, ArtistUpdate, ArtistWithDetails } from '@/types/database';

// Query keys
export const artistsQueryKeys = {
  all: ['artists'] as const,
  lists: () => [...artistsQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...artistsQueryKeys.lists(), { filters }] as const,
  details: () => [...artistsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...artistsQueryKeys.details(), id] as const,
  search: (query: string) => [...artistsQueryKeys.all, 'search', query] as const,
  secure: () => [...artistsQueryKeys.all, 'secure'] as const,
};

export class ArtistsService {
  // Get all artists
  static async getAll(): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get artist by ID
  static async getById(id: string): Promise<Artist | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Get artist with details (including relationships)
  static async getWithDetails(id: string): Promise<ArtistWithDetails | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    // Add related data when available
    return {
      ...data,
      music_registrations: [],
      contracts: []
    };
  }

  // Create new artist
  static async create(artist: ArtistInsert): Promise<Artist> {
    const { data, error } = await supabase
      .from('artists')
      .insert(artist)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update artist
  static async update(id: string, updates: ArtistUpdate): Promise<Artist> {
    const { data, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete artist
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Search artists
  static async search(query: string): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .or(`name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Filter artists by genre - simplified since genre field doesn't exist in current schema
  static async filterByGenre(genre: string): Promise<Artist[]> {
    // Return all artists for now since genre field doesn't exist
    return this.getAll();
  }

  // Get artists count
  static async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  }
}