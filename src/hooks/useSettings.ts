
import { useState, useEffect } from 'react';

export interface AppSettings {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoBackup: boolean;
  currency: 'BRL' | 'USD' | 'EUR';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  monthlyReports: boolean;
  reminderDueExpenses: boolean;
  reminderDaysBeforeDue: number;
  emailReminderDueExpenses: boolean;
  userProfile: {
    nome: string;
    empresaPrincipal: string;
  };
}

const defaultSettings: AppSettings = {
  notifications: true,
  emailAlerts: false,
  darkMode: false,
  autoBackup: true,
  currency: 'BRL',
  language: 'pt-BR',
  backupFrequency: 'daily',
  monthlyReports: false,
  reminderDueExpenses: true,
  reminderDaysBeforeDue: 3,
  emailReminderDueExpenses: false,
  userProfile: {
    nome: '',
    empresaPrincipal: 'churrasco'
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('app-settings');
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};
