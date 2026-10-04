import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services';
import type { PublicSettings } from '@/types';

interface SettingsContextType {
  settings: PublicSettings;
  isLoading: boolean;
}

const defaultSettings: PublicSettings = {
  company_name: 'Autohus Kvik',
  company_address: 'Gammel Køge Landevej 477, 2650 Hvidovre',
  company_phone: '+45 50 29 08 74',
  company_emergency_phone: '+45 50 29 08 74',
  company_email: 'kontakt@autohusetkvik.dk',
  seo_title_suffix: '| Autohus Kvik – Hvidovre',
  seo_default_description: 'Autohus Kvik i Hvidovre tilbyder brugte biler, bilkøb, byttebiler, finansiering og eget værksted.',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: contentService.getPublicSettings,
    staleTime: 5 * 60 * 1000, // 5 minutter cache
  });

  return (
    <SettingsContext.Provider value={{ settings: { ...defaultSettings, ...(data && typeof data === 'object' ? data : {}) }, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
