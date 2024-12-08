// @flow
import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import config from './config';

const i18nextConfig = {
  fallbackLng: 'en', // this will lead an extra request for en translation file for each namespace
  defaultNS: 'Common', // this defines which namespace to use when no namespace is provided (to withTranslation, etc.)
  ns: ['Common'], // this is the preloaded namespace when page first loads.
  fallbackNS: 'Common',
  load: 'languageOnly', // setting to 'languageOnly' will avoid loading 'en' when current language is 'en-US'.
  preload: ['en'], // array of languages to preload. Important on serverside to assert translations are loaded before rendering views.
  cleanCode: true, // language will be lowercased EN --> en while leaving full locales like en-US
  debug: process.env.NODE_ENV !== 'production',
  keySeparator: false, // we do not use keys in form messages.welcome
  nonExplicitWhitelist: true, // if true will pass eg. en-US if finding en in whitelist
  whitelist: ['en', 'th'], // array of allowed languages, default value is `false`
  backend: {
    // for all available options read the backend's repository readme file
    loadPath: (lng, ns) => {
      let path = `/locales/${lng}/${ns}.json`;

      // in built code, i18n filenames contains hash.
      // in dev mode, they are just placed at 'public/locales'.
      if (window.I18N_FOLDER_PATH_MAPPING) {
        path = window.I18N_FOLDER_PATH_MAPPING[`${lng}/${ns}`] || path;
      }

      return `${config.PUBLIC_URL}${path}`;
    },
    crossDomain: true,
  },
  detection: {
    order: ['cookie', 'navigator'],
  },
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init(i18nextConfig);

export default i18n;
