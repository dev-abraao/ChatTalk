'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TranslationContextType {
  preferredLanguage: string;
  autoTranslate: boolean;
  setPreferredLanguage: (language: string) => void;
  setAutoTranslate: (enabled: boolean) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [preferredLanguage, setPreferredLanguageState] = useState('en');
  const [autoTranslate, setAutoTranslateState] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar preferências do localStorage apenas no cliente
  useEffect(() => {
    if (!isClient) return;
    
    const savedLanguage = localStorage.getItem('preferredTranslationLanguage');
    const savedAutoTranslate = localStorage.getItem('autoTranslate');
    
    if (savedLanguage) {
      setPreferredLanguageState(savedLanguage);
    }
    
    if (savedAutoTranslate) {
      setAutoTranslateState(savedAutoTranslate === 'true');
    }
  }, [isClient]);

  const setPreferredLanguage = (language: string) => {
    setPreferredLanguageState(language);
    if (isClient) {
      localStorage.setItem('preferredTranslationLanguage', language);
    }
  };

  const setAutoTranslate = (enabled: boolean) => {
    setAutoTranslateState(enabled);
    if (isClient) {
      localStorage.setItem('autoTranslate', enabled.toString());
    }
  };

  return (
    <TranslationContext.Provider value={{
      preferredLanguage,
      autoTranslate,
      setPreferredLanguage,
      setAutoTranslate,
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
