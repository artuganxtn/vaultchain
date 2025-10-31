import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'ar' | 'tr';
type Translations = { [key: string]: string };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // FIX: Update t function signature to accept an options object for interpolation and a defaultValue.
  t: (key: string, options?: { defaultValue?: string; [key: string]: any }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/translations/${language}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Could not load translations:", error);
        // Fallback to empty translations on error
        setTranslations({});
      }
    };

    fetchTranslations();
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // FIX: Update t function implementation to handle interpolation and the options object.
  const t = useCallback((key: string, options?: { defaultValue?: string; [key: string]: any }): string => {
    // Start with the key as a fallback. This helps developers spot missing translations.
    let translated = Object.prototype.hasOwnProperty.call(translations, key)
      ? translations[key]
      : options?.defaultValue ?? key;

    if (options) {
      for (const [optionKey, value] of Object.entries(options)) {
        if (optionKey !== 'defaultValue') {
          // A simple interpolation for "{key}" format.
          const regex = new RegExp(`{${optionKey}}`, 'g');
          translated = translated.replace(regex, String(value));
        }
      }
    }
    
    return translated;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};