import { supabase } from "@/integrations/supabase/client";

// Executar criação do admin imediatamente
(async () => {
  console.log('🚀 Executando criação do administrador master...');
  
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: JSON.stringify({})
    });

    if (error) {
      console.error('❌ Erro ao criar admin:', error);
    } else {
      console.log('✅ Admin criado com sucesso:', data);
      // Recarregar a página para atualizar as permissões
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
})();