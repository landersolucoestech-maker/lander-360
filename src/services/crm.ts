import { supabase } from '@/integrations/supabase/client';

export class CrmService {
  static async getAll() {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(contact: { 
    name: string; 
    email?: string; 
    phone?: string; 
    company?: string; 
    contact_type?: string;
    position?: string;
    document?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    notes?: string;
    status?: string;
    priority?: string;
    next_action?: string;
    artist_name?: string;
    image_url?: string;
    interactions?: any[];
  }) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<{ 
    name: string; 
    email?: string; 
    phone?: string; 
    company?: string; 
    contact_type?: string;
    position?: string;
    document?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    notes?: string;
    status?: string;
    priority?: string;
    next_action?: string;
    artist_name?: string;
    image_url?: string;
    interactions?: any[];
  }>) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByType(contactType: string) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('contact_type', contactType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async search(query: string) {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}