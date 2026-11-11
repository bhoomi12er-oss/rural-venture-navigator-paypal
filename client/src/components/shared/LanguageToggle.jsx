import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageToggle = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-neutralGray text-brand-dark rounded-full shadow-sm hover:border-brand-primary hover:bg-brand-primaryLight transition-all duration-200 text-sm font-semibold active:scale-95 ${className}`}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-brand-primary" />
      <span>{t('language')}</span>
    </button>
  );
};
