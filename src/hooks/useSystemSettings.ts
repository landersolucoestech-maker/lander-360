import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  autoBackup: boolean;
  timezone: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
  autoBackup: true,
  timezone: 'America/Sao_Paulo',
};

export const useSystemSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading system settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));
    
    toast({
      title: "Configurações atualizadas",
      description: "As configurações do sistema foram salvas com sucesso.",
    });
  };

  const toggleAutoBackup = () => {
    updateSettings({ autoBackup: !settings.autoBackup });
  };

  const updateTimezone = (timezone: string) => {
    updateSettings({ timezone });
  };

  return {
    settings,
    isLoading,
    toggleAutoBackup,
    updateTimezone,
  };
};