import { useState, useEffect, useCallback } from 'react';

const SESSION_SETTINGS_KEY = 'lander360-session-settings';

export interface SessionSettings {
  timeoutMinutes: number;
  warningMinutes: number;
}

const DEFAULT_SETTINGS: SessionSettings = {
  timeoutMinutes: 30,
  warningMinutes: 5,
};

const TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 480, label: '8 horas' },
];

export function useSessionSettings() {
  const [settings, setSettings] = useState<SessionSettings>(() => {
    const stored = localStorage.getItem(SESSION_SETTINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(SESSION_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateTimeoutMinutes = useCallback((minutes: number) => {
    setSettings(prev => ({
      ...prev,
      timeoutMinutes: minutes,
      warningMinutes: Math.min(prev.warningMinutes, Math.floor(minutes / 2)),
    }));
  }, []);

  const updateWarningMinutes = useCallback((minutes: number) => {
    setSettings(prev => ({
      ...prev,
      warningMinutes: Math.min(minutes, prev.timeoutMinutes - 1),
    }));
  }, []);

  return {
    settings,
    updateTimeoutMinutes,
    updateWarningMinutes,
    TIMEOUT_OPTIONS,
  };
}

// Export function to get settings synchronously (for use in hooks)
export function getSessionSettings(): SessionSettings {
  const stored = localStorage.getItem(SESSION_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}
