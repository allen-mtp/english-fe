import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import vi from './vi';

const isServer = typeof window === 'undefined';
const config = {
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
};

if (!isServer) {
  const LanguageDetector = require('i18next-browser-languagedetector').default;
  i18n.use(LanguageDetector);
  config.lng = undefined;
  config.detection = {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'lang',
  };
}

i18n.use(initReactI18next).init(config);

export default i18n;
