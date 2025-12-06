import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SecurityAuditAction = 
  | 'session_timeout_changed'
  | 'password_changed'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'session_terminated'
  | 'all_sessions_terminated'
  | 'theme_changed'
  | 'backup_setting_changed';

export type SecuritySettingType = 
  | 'session_timeout'
  | 'password'
  | '2fa'
  | 'session_management'
  | 'theme'
  | 'backup';

interface AuditLogEntry {
  action: SecurityAuditAction;
  settingType: SecuritySettingType;
  oldValue?: string;
  newValue?: string;
}

export function useSecurityAuditLog() {
  const { user } = useAuth();

  const logSecurityChange = useCallback(async (entry: AuditLogEntry) => {
    if (!user) return;

    try {
      await supabase.from('security_audit_logs').insert({
        user_id: user.id,
        action: entry.action,
        setting_type: entry.settingType,
        old_value: entry.oldValue,
        new_value: entry.newValue,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Error logging security change:', error);
    }
  }, [user]);

  return { logSecurityChange };
}

// Helper to get human-readable labels
export function getAuditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    session_timeout_changed: 'Tempo de expiração de sessão alterado',
    password_changed: 'Senha alterada',
    '2fa_enabled': 'Autenticação 2FA ativada',
    '2fa_disabled': 'Autenticação 2FA desativada',
    session_terminated: 'Sessão encerrada remotamente',
    all_sessions_terminated: 'Todas as sessões encerradas',
    theme_changed: 'Tema alterado',
    backup_setting_changed: 'Configuração de backup alterada',
  };
  return labels[action] || action;
}

export function getSettingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    session_timeout: 'Tempo de Sessão',
    password: 'Senha',
    '2fa': 'Autenticação 2FA',
    session_management: 'Gerenciamento de Sessões',
    theme: 'Aparência',
    backup: 'Backup',
  };
  return labels[type] || type;
}
