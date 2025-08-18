import { supabase } from '@/integrations/supabase/client';

// Script para criar usuário administrador
export async function createAdminUser() {
  try {
    // Chamar a Edge Function para criar o usuário
    // SECURITY: Remove hardcoded credentials - use environment variables or secure input
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {
        email: 'admin@example.com', // Change this to your actual admin email
        password: '', // This will be generated securely by the function
        full_name: 'Administrador Sistema',
        phone: ''
      }
    });

    if (error) {
      console.error('Erro ao criar usuário administrador:', error);
      return { success: false, error };
    }

    console.log('Usuário administrador criado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return { success: false, error };
  }
}

// Executar o script
if (import.meta.env.DEV) {
  // Execute this in the browser console: window.createAdminUser()
  (window as any).createAdminUser = createAdminUser;
}