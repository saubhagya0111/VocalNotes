import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';

// Define the translations for each language
const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(initReactI18next)  // Passes i18n down to React components
  .init({
    resources,
    lng: 'en',  // Default language
    fallbackLng: 'en',  // Fallback language if the selected language is not available
    interpolation: {
      escapeValue: false,  // React already handles escaping by default
    },
  });

export default i18n;