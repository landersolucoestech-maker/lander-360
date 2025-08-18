import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type CrmContact = Database['public']['Tables']['crm_contacts']['Row'];
type CrmContactInsert = Database['public']['Tables']['crm_contacts']['Insert'];
type CrmContactUpdate = Database['public']['Tables']['crm_contacts']['Update'];

export class CrmService {
  static async getAll(): Promise<CrmContact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<CrmContact | null> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(contact: CrmContactInsert): Promise<CrmContact> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: CrmContactUpdate): Promise<CrmContact> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('crm_contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByType(contactType: string): Promise<CrmContact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('contact_type', contactType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByStatus(status: string): Promise<CrmContact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async search(query: string): Promise<CrmContact[]> {
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}