import React, { createContext, useContext, useMemo, useState } from 'react';
import en from '../locales/en';
import es from '../locales/es';

export type Translations = Record<string, string>;

const translationsMap: Record<string, Translations> = {
  en,
  es,
};

type LanguageContextValue = {
  language: string;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const t = useMemo(() => {
    return (key: string) => {
      const current = translationsMap[language] || translationsMap['en'];
      return current?.[key] ?? key;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
