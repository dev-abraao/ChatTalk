'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  preferredLanguage: string;
  setPreferredLanguage: (language: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [preferredLanguage, setPreferredLanguageState] = useState('en');
  const [isClient, setIsClient] = useState(false);

  // Marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar preferências do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return;
    
    const savedLanguage = localStorage.getItem('preferredTranslationLanguage');
    
    if (savedLanguage) {
      setPreferredLanguageState(savedLanguage);
    }
  }, [isClient]);

  const setPreferredLanguage = (language: string) => {
    setPreferredLanguageState(language);
    if (isClient) {
      localStorage.setItem('preferredTranslationLanguage', language);
    }
  };

  return (
    <TranslationContext.Provider value={{
      preferredLanguage,
      setPreferredLanguage,
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
