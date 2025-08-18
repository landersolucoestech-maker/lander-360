import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  sector?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  created_at: string;
  last_login?: string;
  avatar_url?: string;
}

// Função para calcular permissões baseadas nas roles
const calculatePermissions = (roles: string[]): string[] => {
  const permissionsByRole: { [key: string]: string[] } = {
    'master': ['Acesso Total', 'Administração Completa', 'Gestão de Usuários', 'Gestão Financeira', 'Gestão de Artistas', 'Gestão de Contratos', 'Gestão de Projetos', 'Gestão de Marketing'],
    'admin': ['Administração Completa', 'Gestão de Usuários', 'Gestão Financeira', 'Gestão de Artistas', 'Gestão de Contratos'],
    'manager': ['Gestão de Projetos', 'Gestão de Artistas', 'Visualizar Relatórios', 'Gestão de Marketing'],
    'producer': ['Produção Musical', 'Gestão de Releases', 'Registro de Músicas'],
    'artist': ['Visualizar Perfil', 'Agenda Pessoal', 'Visualizar Contratos'],
    'viewer': ['Visualização Limitada']
  };

  const allPermissions = new Set<string>();
  roles.forEach(role => {
    const permissions = permissionsByRole[role] || [];
    permissions.forEach(permission => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
};

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get real user data from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar usuários",
          variant: "destructive"
        });
        return;
      }

      // Convert profiles to User format - exclude backend admin from normal user list
      const users: User[] = profiles?.filter(profile => 
        // Only show users that were created through the interface (not the backend admin)
        profile.full_name !== 'Deyvisson Gestão 360 Andrade' || profile.role_display !== 'Administrador (Master)'
      ).map(profile => ({
        id: profile.id,
        email: profile.id, // We don't store email in profiles table
        full_name: profile.full_name || 'Usuário',
        phone: profile.phone,
        sector: profile.sector || 'N/A',
        roles: profile.roles || [profile.role_display || 'Membro'],
        permissions: calculatePermissions(profile.roles || [profile.role_display || 'viewer']),
        isActive: profile.is_active ?? true,
        created_at: profile.created_at,
        avatar_url: profile.avatar_url
      })) || [];

      setUsers(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: string;
    permissions: string[];
  }) => {
    try {
      setLoading(true);

      // Use the Edge Function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          phone: userData.phone || '',
          role: userData.role,
          permissions: userData.permissions
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar usuário: " + (error.message || 'Erro desconhecido'),
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });

      await fetchUsers();
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: {
    full_name: string;
    phone?: string;
    sector?: string;
    role: string;
    permissions: string[];
  }) => {
    try {
      setLoading(true);

      // Update user profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          role_display: userData.role
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setLoading(true);

      // Check current status first
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newStatus = !currentProfile.is_active;
      
      // Toggle user active status
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({ 
        title: 'Sucesso', 
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!` 
      });
      
      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do usuário.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);

      // Create admin client for user deletion
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário excluído permanentemente com sucesso!',
      });

      await fetchUsers();
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir usuário permanentemente.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    refetch: fetchUsers,
  };
}