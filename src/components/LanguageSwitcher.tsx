import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      title="Switch Language"
    >
      <Globe className="h-5 w-5" />
      <span className="text-sm font-medium uppercase">{i18n.language === 'en' ? 'BN' : 'EN'}</span>
    </button>
  );
}
