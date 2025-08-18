import { supabase } from "@/integrations/supabase/client";

// Função para criar o usuário administrador master
export async function createMasterAdmin() {
  try {
    console.log('Criando usuário administrador master...');
    
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: JSON.stringify({
        email: 'deyvisson.gestao360@gmail.com',
        full_name: 'Deyvisson Gestão 360 Andrade',
        phone: '(33)99917-9552'
      })
    });

    if (error) {
      console.error('Erro ao criar usuário master:', error);
      return { success: false, error };
    }

    console.log('Usuário master criado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return { success: false, error };
  }
}

// Executar automaticamente em desenvolvimento
if (typeof window !== 'undefined') {
  (window as any).createMasterAdmin = createMasterAdmin;
  
  // Executar automaticamente
  createMasterAdmin().then(result => {
    if (result.success) {
      console.log('✅ Usuário Master criado:', result.data);
    } else {
      console.error('❌ Erro ao criar usuário Master:', result.error);
    }
  });
}