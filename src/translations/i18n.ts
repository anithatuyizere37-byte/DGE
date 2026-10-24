import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import rw from './rw.json';
import fr from './fr.json';

const resources = {
  en: { translation: en },
  rw: { translation: rw },
  fr: { translation: fr },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeAppLanguage = (lng: 'en' | 'rw' | 'fr') => {
  return i18n.changeLanguage(lng);
};

export default i18n;
