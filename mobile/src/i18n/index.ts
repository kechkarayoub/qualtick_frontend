/**
 * Internationalization (i18n) Configuration for React Native
 * 
 * Sets up i18next with:
 * - React Native language detection
 * - Local JSON resource loading
 * - React integration
 * - Fallback languages
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';

// Import translation resources
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enSettings from './locales/en/settings.json';
import enMessages from './locales/en/messages.json';
import enDashboard from './locales/en/dashboard.json';
import enHome from './locales/en/home.json';
import enWebsockets from './locales/en/websockets.json';
import enProfile from './locales/en/profile.json';
import enCountries from './locales/en/countries.json';
import enErrors from './locales/en/errors.json';
import enNavigation from './locales/en/navigation.json';
import enLanguage from './locales/en/language.json';
import enTerms from './locales/en/terms.json';
import enAboutUs from './locales/en/aboutUs.json';
import enContact from './locales/en/contact.json';
import enCookiesPolicy from './locales/en/cookiesPolicy.json';
import enFeatures from './locales/en/features.json';
import enHelpCenter from './locales/en/helpCenter.json';
import enPrivacyPolicy from './locales/en/privacyPolicy.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frSettings from './locales/fr/settings.json';
import frMessages from './locales/fr/messages.json';
import frDashboard from './locales/fr/dashboard.json';
import frHome from './locales/fr/home.json';
import frWebsockets from './locales/fr/websockets.json';
import frProfile from './locales/fr/profile.json';
import frCountries from './locales/fr/countries.json';
import frErrors from './locales/fr/errors.json';
import frNavigation from './locales/fr/navigation.json';
import frLanguage from './locales/fr/language.json';
import frTerms from './locales/fr/terms.json';
import frAboutUs from './locales/fr/aboutUs.json';
import frContact from './locales/fr/contact.json';
import frCookiesPolicy from './locales/fr/cookiesPolicy.json';
import frFeatures from './locales/fr/features.json';
import frHelpCenter from './locales/fr/helpCenter.json';
import frPrivacyPolicy from './locales/fr/privacyPolicy.json';

import arCommon from './locales/ar/common.json';
import arAuth from './locales/ar/auth.json';
import arSettings from './locales/ar/settings.json';
import arMessages from './locales/ar/messages.json';
import arDashboard from './locales/ar/dashboard.json';
import arHome from './locales/ar/home.json';
import arWebsockets from './locales/ar/websockets.json';
import arProfile from './locales/ar/profile.json';
import arCountries from './locales/ar/countries.json';
import arErrors from './locales/ar/errors.json';
import arNavigation from './locales/ar/navigation.json';
import arLanguage from './locales/ar/language.json';
import arTerms from './locales/ar/terms.json';
import arAboutUs from './locales/ar/aboutUs.json';
import arContact from './locales/ar/contact.json';
import arCookiesPolicy from './locales/ar/cookiesPolicy.json';
import arFeatures from './locales/ar/features.json';
import arHelpCenter from './locales/ar/helpCenter.json';
import arPrivacyPolicy from './locales/ar/privacyPolicy.json';

const isDevelopment = __DEV__;

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    settings: enSettings,
  messages: enMessages,
  dashboard: enDashboard,
  home: enHome,
  websockets: enWebsockets,
    profile: enProfile,
    countries: enCountries,
    errors: enErrors,
    navigation: enNavigation,
    language: enLanguage,
    terms: enTerms,
    aboutUs: enAboutUs,
    contact: enContact,
    cookiesPolicy: enCookiesPolicy,
    features: enFeatures,
    helpCenter: enHelpCenter,
    privacyPolicy: enPrivacyPolicy,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    settings: frSettings,
  messages: frMessages,
  dashboard: frDashboard,
  home: frHome,
  websockets: frWebsockets,
    profile: frProfile,
    countries: frCountries,
    errors: frErrors,
    navigation: frNavigation,
    language: frLanguage,
    terms: frTerms,
    aboutUs: frAboutUs,
    contact: frContact,
    cookiesPolicy: frCookiesPolicy,
    features: frFeatures,
    helpCenter: frHelpCenter,
    privacyPolicy: frPrivacyPolicy,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    settings: arSettings,
  messages: arMessages,
  dashboard: arDashboard,
  home: arHome,
  websockets: arWebsockets,
    profile: arProfile,
    countries: arCountries,
    errors: arErrors,
    navigation: arNavigation,
    language: arLanguage,
    terms: arTerms,
    aboutUs: arAboutUs,
    contact: arContact,
    cookiesPolicy: arCookiesPolicy,
    features: arFeatures,
    helpCenter: arHelpCenter,
    privacyPolicy: arPrivacyPolicy,
  },
};

// Custom language detector using react-native-localize
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    try {
      const locales = getLocales();
      const deviceLanguage = locales[0]?.languageCode || 'en';
      
      // Map supported languages
      const supportedLanguages = ['en', 'fr', 'ar'];
      const detectedLanguage = supportedLanguages.includes(deviceLanguage) 
        ? deviceLanguage 
        : 'en';
      
      callback(detectedLanguage);
    } catch (error) {
      console.warn('Language detection failed:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // Debug mode
    debug: isDevelopment,

    // Fallback language
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'fr', 'ar'],

    // Resources
    resources,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
      format: (value, format) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      },
    },

    // Namespace and key options
    defaultNS: 'common',
    ns: ['common', 'auth', 'countries', 'dashboard', 'home', 'messages', 'settings', 'profile', 'errors', 'navigation', 'language', 'websockets', 'terms', 'aboutUs', 'contact', 'cookiesPolicy', 'features', 'helpCenter', 'privacyPolicy'],

    // Key separator
    keySeparator: '.',
    nsSeparator: ':',

    // React specific options
    react: {
      useSuspense: false,
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Performance
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
  });

export default i18n;
