import { supabase } from '@/integrations/supabase/client';

export async function createAdminDirectly() {
  try {
    console.log('Chamando edge function para criar admin...');
    
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: {}
    });

    if (error) {
      console.error('Erro ao criar admin:', error);
      return { success: false, error };
    }

    console.log('Admin criado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return { success: false, error };
  }
}

// Auto-executar quando em desenvolvimento
if (import.meta.env.DEV) {
  console.log('Ambiente de desenvolvimento detectado, criando admin...');
  createAdminDirectly().then(result => {
    if (result.success) {
      console.log('✅ Admin criado/atualizado com sucesso!');
      console.log('📧 Email: deyvisson.lander@gmail.com');
      console.log('🔐 Senha: Admin@123456');
    } else {
      console.error('❌ Falha ao criar admin:', result.error);
    }
  });
}