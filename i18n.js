import i18next from 'i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';

export async function initI18n(lang = 'en') {
  try {
    await i18next.init({
      lng: lang,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        pt: { translation: pt }
      }
    });
  } catch (err) {
    console.error("I18n failed to initialize:", err);
  }
}

export function t(key) {
  return i18next.t(key);
}

export function setLanguage(lang) {
  i18next.changeLanguage(lang);
}
