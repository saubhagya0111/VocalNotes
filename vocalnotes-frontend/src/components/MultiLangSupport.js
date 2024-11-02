import React from 'react';
import { useTranslation } from 'react-i18next';

const MultiLangSupport = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language); // Switch language
  };

  return (
    <div>
      <h2>{t('multiLangSupport')}</h2>
      <button onClick={() => handleLanguageChange('en')}>English</button>
      <button onClick={() => handleLanguageChange('fr')}>Français</button>
    </div>
  );
};

export default MultiLangSupport;