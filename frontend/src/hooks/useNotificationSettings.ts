import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  newContracts: boolean;
  contractsExpiring: boolean;
  newReleases: boolean;
  financialReports: boolean;
  marketingCampaigns: boolean;
  weeklyReminders: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bellNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  newContracts: false,
  contractsExpiring: true,
  newReleases: true,
  financialReports: true,
  marketingCampaigns: true,
  weeklyReminders: false,
  emailNotifications: true,
  smsNotifications: false,
  bellNotifications: true,
};

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (key: keyof NotificationSettings, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    
    const settingsLabels: Record<keyof NotificationSettings, string> = {
      newContracts: 'Novos Contratos',
      contractsExpiring: 'Contratos Vencendo',
      newReleases: 'Novos Lançamentos',
      financialReports: 'Relatórios Financeiros',
      marketingCampaigns: 'Campanhas de Marketing',
      weeklyReminders: 'Lembretes Semanais',
      emailNotifications: 'Notificações por E-mail',
      smsNotifications: 'Notificações por SMS',
      bellNotifications: 'Notificações no Sistema',
    };
    
    toast({
      title: "Notificação atualizada",
      description: `${settingsLabels[key]} ${value ? 'ativada' : 'desativada'}.`,
    });
  };

  const toggleNewContracts = () => {
    updateSettings('newContracts', !settings.newContracts);
  };

  const toggleContractsExpiring = () => {
    updateSettings('contractsExpiring', !settings.contractsExpiring);
  };

  const toggleNewReleases = () => {
    updateSettings('newReleases', !settings.newReleases);
  };

  const toggleFinancialReports = () => {
    updateSettings('financialReports', !settings.financialReports);
  };

  const toggleMarketingCampaigns = () => {
    updateSettings('marketingCampaigns', !settings.marketingCampaigns);
  };

  const toggleWeeklyReminders = () => {
    updateSettings('weeklyReminders', !settings.weeklyReminders);
  };

  const toggleEmailNotifications = () => {
    updateSettings('emailNotifications', !settings.emailNotifications);
  };

  const toggleSmsNotifications = () => {
    updateSettings('smsNotifications', !settings.smsNotifications);
  };

  const toggleBellNotifications = () => {
    updateSettings('bellNotifications', !settings.bellNotifications);
  };

  return {
    settings,
    isLoading,
    toggleNewContracts,
    toggleContractsExpiring,
    toggleNewReleases,
    toggleFinancialReports,
    toggleMarketingCampaigns,
    toggleWeeklyReminders,
    toggleEmailNotifications,
    toggleSmsNotifications,
    toggleBellNotifications,
  };
};