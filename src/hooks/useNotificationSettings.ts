import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  newContracts: boolean;
  contractsExpiring: boolean;
  newReleases: boolean;
  financialReports: boolean;
  marketingCampaigns: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  newContracts: false,
  contractsExpiring: true,
  newReleases: true,
  financialReports: true,
  marketingCampaigns: true,
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
        setSettings(JSON.parse(savedSettings));
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
    
    const settingsLabels = {
      newContracts: 'Novos Contratos',
      contractsExpiring: 'Contratos Vencendo',
      newReleases: 'Novos Lançamentos',
      financialReports: 'Relatórios Financeiros',
      marketingCampaigns: 'Campanhas de Marketing',
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

  return {
    settings,
    isLoading,
    toggleNewContracts,
    toggleContractsExpiring,
    toggleNewReleases,
    toggleFinancialReports,
    toggleMarketingCampaigns,
  };
};