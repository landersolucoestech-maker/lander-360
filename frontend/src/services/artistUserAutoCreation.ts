import { supabase } from '@/integrations/supabase/client';
import { defaultRolePermissions } from '@/lib/permissions';

/**
 * Serviço para criar automaticamente usuário quando contrato de artista é marcado como vigente
 */
export class ArtistUserAutoCreationService {
  
  /**
   * Verifica se o artista já possui um usuário vinculado
   */
  static async artistHasUser(artistId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_artists')
      .select('user_id')
      .eq('artist_id', artistId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar usuário do artista:', error);
      return false;
    }
    
    return !!data?.user_id;
  }

  /**
   * Busca dados do artista
   */
  static async getArtistData(artistId: string): Promise<{ email: string; name: string; stage_name?: string } | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('email, name, stage_name')
      .eq('id', artistId)
      .single();
    
    if (error || !data?.email) {
      console.error('Erro ao buscar dados do artista:', error);
      return null;
    }
    
    return data;
  }

  /**
   * Verifica se já existe um usuário com este email
   */
  static async userExistsByEmail(email: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar email:', error);
      return null;
    }
    
    return data?.id || null;
  }

  /**
   * Cria usuário automaticamente para o artista e envia email de reset de senha
   */
  static async createUserForArtist(artistId: string): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // 1. Verificar se o artista já tem usuário
      const hasUser = await this.artistHasUser(artistId);
      if (hasUser) {
        return { success: true, message: 'Artista já possui usuário vinculado' };
      }

      // 2. Buscar dados do artista
      const artistData = await this.getArtistData(artistId);
      if (!artistData || !artistData.email) {
        return { success: false, message: 'Artista não possui email cadastrado' };
      }

      // 3. Verificar se já existe usuário com este email
      const existingUserId = await this.userExistsByEmail(artistData.email);
      
      if (existingUserId) {
        // Usuário existe, apenas vincular ao artista
        const { error: linkError } = await supabase
          .from('user_artists')
          .insert({
            user_id: existingUserId,
            artist_id: artistId,
            access_level: 'owner'
          });
        
        if (linkError) {
          console.error('Erro ao vincular usuário existente:', linkError);
          return { success: false, message: 'Erro ao vincular usuário existente ao artista' };
        }
        
        return { success: true, message: 'Usuário existente vinculado ao artista', userId: existingUserId };
      }

      // 4. Criar novo usuário via Supabase Auth
      // Gerar senha temporária segura
      const tempPassword = this.generateSecurePassword();
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: artistData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: artistData.name || artistData.stage_name || 'Artista',
            role: 'artista'
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Erro ao criar usuário:', authError);
        return { success: false, message: `Erro ao criar usuário: ${authError?.message || 'Erro desconhecido'}` };
      }

      const userId = authData.user.id;

      // 5. Atualizar/criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: artistData.email,
          full_name: artistData.name || artistData.stage_name || 'Artista',
          role_display: 'Artista',
          status: 'active',
          permissions: defaultRolePermissions.artista,
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      }

      // 6. Adicionar role de artista
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'artista'
        });

      if (roleError) {
        console.error('Erro ao adicionar role:', roleError);
      }

      // 7. Vincular usuário ao artista
      const { error: linkError } = await supabase
        .from('user_artists')
        .insert({
          user_id: userId,
          artist_id: artistId,
          access_level: 'owner'
        });

      if (linkError) {
        console.error('Erro ao vincular usuário ao artista:', linkError);
      }

      // 8. Enviar email de reset de senha
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(artistData.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });

      if (resetError) {
        console.error('Erro ao enviar email de reset:', resetError);
        return { 
          success: true, 
          message: 'Usuário criado, mas houve erro ao enviar email. O artista pode usar "Esqueci minha senha" para criar sua senha.',
          userId 
        };
      }

      return { 
        success: true, 
        message: `Usuário criado com sucesso! Um email foi enviado para ${artistData.email} para definir a senha.`,
        userId 
      };

    } catch (error) {
      console.error('Erro ao criar usuário para artista:', error);
      return { success: false, message: 'Erro inesperado ao criar usuário' };
    }
  }

  /**
   * Processa contrato quando marcado como vigente (assinado)
   * Deve ser chamado quando o status do contrato muda para 'assinado'
   */
  static async processContractActivation(contractId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Buscar dados do contrato
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .select('artist_id, status, client_type')
        .eq('id', contractId)
        .single();

      if (contractError || !contract) {
        return { success: false, message: 'Contrato não encontrado' };
      }

      // 2. Verificar se é contrato de artista e está assinado
      if (contract.status !== 'assinado') {
        return { success: false, message: 'Contrato não está com status assinado' };
      }

      if (!contract.artist_id) {
        return { success: false, message: 'Contrato não está vinculado a um artista' };
      }

      // 3. Criar usuário para o artista
      const result = await this.createUserForArtist(contract.artist_id);
      return result;

    } catch (error) {
      console.error('Erro ao processar ativação do contrato:', error);
      return { success: false, message: 'Erro ao processar ativação do contrato' };
    }
  }

  /**
   * Gera senha segura temporária
   */
  private static generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
