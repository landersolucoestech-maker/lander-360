import { supabase } from '@/integrations/supabase/client';

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  template_type: string;
  description: string | null;
  header_html: string | null;
  footer_html: string | null;
  clauses: ContractClause[];
  default_fields: Record<string, any>;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ContractTemplateInsert {
  name: string;
  template_type: string;
  description?: string;
  header_html?: string;
  footer_html?: string;
  clauses?: ContractClause[];
  default_fields?: Record<string, any>;
  is_active?: boolean;
}

export interface ContractTemplateUpdate extends Partial<ContractTemplateInsert> {
  version?: number;
}

export class ContractTemplatesService {
  static async getAll(): Promise<ContractTemplate[]> {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .order('template_type', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      clauses: Array.isArray(item.clauses) ? item.clauses : JSON.parse(item.clauses as string || '[]'),
      default_fields: typeof item.default_fields === 'object' ? item.default_fields : JSON.parse(item.default_fields as string || '{}')
    })) as ContractTemplate[];
  }

  static async getById(id: string): Promise<ContractTemplate | null> {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      clauses: Array.isArray(data.clauses) ? data.clauses : JSON.parse(data.clauses as string || '[]'),
      default_fields: typeof data.default_fields === 'object' ? data.default_fields : JSON.parse(data.default_fields as string || '{}')
    } as ContractTemplate;
  }

  static async getByType(templateType: string): Promise<ContractTemplate | null> {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      clauses: Array.isArray(data.clauses) ? data.clauses : JSON.parse(data.clauses as string || '[]'),
      default_fields: typeof data.default_fields === 'object' ? data.default_fields : JSON.parse(data.default_fields as string || '{}')
    } as ContractTemplate;
  }

  static async create(template: ContractTemplateInsert): Promise<ContractTemplate> {
    const insertData = {
      name: template.name,
      template_type: template.template_type,
      description: template.description,
      header_html: template.header_html,
      footer_html: template.footer_html,
      clauses: JSON.stringify(template.clauses || []),
      default_fields: JSON.stringify(template.default_fields || {}),
      is_active: template.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('contract_templates')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      clauses: typeof data.clauses === 'string' ? JSON.parse(data.clauses) : (Array.isArray(data.clauses) ? data.clauses : []),
      default_fields: typeof data.default_fields === 'string' ? JSON.parse(data.default_fields) : (data.default_fields || {})
    } as unknown as ContractTemplate;
  }

  static async update(id: string, updates: ContractTemplateUpdate): Promise<ContractTemplate> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.template_type !== undefined) updateData.template_type = updates.template_type;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.header_html !== undefined) updateData.header_html = updates.header_html;
    if (updates.footer_html !== undefined) updateData.footer_html = updates.footer_html;
    if (updates.clauses !== undefined) updateData.clauses = JSON.stringify(updates.clauses);
    if (updates.default_fields !== undefined) updateData.default_fields = JSON.stringify(updates.default_fields);
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    if (updates.version !== undefined) updateData.version = updates.version;

    const { data, error } = await supabase
      .from('contract_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      clauses: typeof data.clauses === 'string' ? JSON.parse(data.clauses) : (Array.isArray(data.clauses) ? data.clauses : []),
      default_fields: typeof data.default_fields === 'string' ? JSON.parse(data.default_fields) : (data.default_fields || {})
    } as unknown as ContractTemplate;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contract_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
