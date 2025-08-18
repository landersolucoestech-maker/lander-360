import { supabase } from "@/integrations/supabase/client";

// Criar usuário administrador backend automaticamente
async function createBackendAdmin() {
  try {
    console.log('🔧 Criando usuário administrador no backend...');
    
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {}
    });

    if (error) {
      console.error('❌ Erro ao criar admin backend:', error);
      throw error;
    }

    console.log('✅ Usuário administrador criado no backend:', data);
    
    // Verificar se foi criado com sucesso
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('full_name', 'Deyvisson Gestão 360 Andrade')
      .single();

    if (!profileError && profile) {
      console.log('✅ Perfil de admin confirmado:', profile);
      localStorage.setItem('backend_admin_created', 'true');
      
      // Recarregar para atualizar permissões
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ Falha ao criar admin backend:', error);
    return { success: false, error };
  }
}

// Executar apenas uma vez
const adminCreated = localStorage.getItem('backend_admin_created');
if (!adminCreated) {
  console.log('🚀 Iniciando criação do usuário administrador backend...');
  createBackendAdmin();
} else {
  console.log('✅ Usuário administrador backend já existe');
}

export { createBackendAdmin };