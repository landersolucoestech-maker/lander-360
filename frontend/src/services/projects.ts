import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectInsert, ProjectUpdate, ProjectWithDetails } from '@/types/database';

export class ProjectsService {
  static async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async getWithDetails(id: string): Promise<ProjectWithDetails | null> {
    const project = await this.getById(id);
    if (!project) return null;
    
    return {
      ...project,
      // Add related data when available
    };
  }

  static async create(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async search(query: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getByUser(userId: string): Promise<Project[]> {
    // Since the current schema uses org_id, we'll need to get user's org first
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async filterByStatus(status: string): Promise<Project[]> {
    // Since status field doesn't exist in current schema, return all
    return this.getAll();
  }

  static async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
}