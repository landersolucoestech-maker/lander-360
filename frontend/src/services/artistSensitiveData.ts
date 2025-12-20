import { supabase } from '@/integrations/supabase/client';

export interface ArtistSensitiveData {
  id: string;
  artist_id: string;
  cpf_cnpj: string | null;
  rg: string | null;
  full_address: string | null;
  bank: string | null;
  agency: string | null;
  account: string | null;
  pix_key: string | null;
  account_holder: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistSensitiveDataInsert {
  artist_id: string;
  cpf_cnpj?: string | null;
  rg?: string | null;
  full_address?: string | null;
  bank?: string | null;
  agency?: string | null;
  account?: string | null;
  pix_key?: string | null;
  account_holder?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ArtistSensitiveDataUpdate {
  cpf_cnpj?: string | null;
  rg?: string | null;
  full_address?: string | null;
  bank?: string | null;
  agency?: string | null;
  account?: string | null;
  pix_key?: string | null;
  account_holder?: string | null;
  phone?: string | null;
  email?: string | null;
}

export class ArtistSensitiveDataService {
  // Get sensitive data by artist ID (admin only)
  static async getByArtistId(artistId: string): Promise<ArtistSensitiveData | null> {
    const { data, error } = await supabase
      .from('artist_sensitive_data')
      .select('*')
      .eq('artist_id', artistId)
      .maybeSingle();

    if (error) {
      // If access denied due to RLS, return null silently
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        console.warn('Access denied to sensitive data - user may not have admin role');
        return null;
      }
      throw error;
    }
    return data;
  }

  // Create or update sensitive data for an artist (admin only)
  static async upsert(artistId: string, data: ArtistSensitiveDataUpdate): Promise<ArtistSensitiveData | null> {
    // First check if record exists
    const existing = await this.getByArtistId(artistId);
    
    if (existing) {
      // Update existing record
      const { data: updated, error } = await supabase
        .from('artist_sensitive_data')
        .update(data)
        .eq('artist_id', artistId)
        .select()
        .single();

      if (error) {
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.warn('Access denied to update sensitive data');
          return null;
        }
        throw error;
      }
      return updated;
    } else {
      // Insert new record
      const { data: inserted, error } = await supabase
        .from('artist_sensitive_data')
        .insert({ artist_id: artistId, ...data })
        .select()
        .single();

      if (error) {
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          console.warn('Access denied to insert sensitive data');
          return null;
        }
        throw error;
      }
      return inserted;
    }
  }

  // Delete sensitive data for an artist (admin only)
  static async delete(artistId: string): Promise<void> {
    const { error } = await supabase
      .from('artist_sensitive_data')
      .delete()
      .eq('artist_id', artistId);

    if (error && error.code !== '42501') {
      throw error;
    }
  }

  // Check if current user has access to sensitive data
  static async hasAccess(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('artist_sensitive_data')
        .select('id')
        .limit(1);
      
      // If no error, user has access
      return !error;
    } catch {
      return false;
    }
  }
}
