import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Try to fetch initial language from localStorage, default to English ('en')
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('rvn_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (lang) => {
    const target = lang === 'hi' ? 'hi' : 'en';
    setLanguageState(target);
    localStorage.setItem('rvn_lang', target);
  };

  // Translation helper function
  const t = (key, replacements = {}) => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || key;

    // Apply replacements if key contains placeholders like {units}
    Object.keys(replacements).forEach((placeholder) => {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
