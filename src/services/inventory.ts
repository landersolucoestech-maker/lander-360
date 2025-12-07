import { supabase } from '@/integrations/supabase/client';

export class InventoryService {
  static async getAll() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(inventory: { 
    name: string; 
    description?: string; 
    quantity?: number; 
    category?: string; 
    location?: string;
    status?: string;
    sector?: string;
    responsible?: string;
    purchase_location?: string;
    invoice_number?: string;
    entry_date?: string;
    unit_value?: number;
    observations?: string;
  }) {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventory)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<{ 
    name: string; 
    description?: string; 
    quantity?: number; 
    category?: string; 
    location?: string;
    status?: string;
    sector?: string;
    responsible?: string;
    purchase_location?: string;
    invoice_number?: string;
    entry_date?: string;
    unit_value?: number;
    observations?: string;
  }>) {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}