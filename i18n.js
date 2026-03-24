import i18next from 'i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';

export async function initI18n(lang = 'en') {
  await i18next.init({
    lng: lang,
    resources: {
      en: { translation: en },
      pt: { translation: pt }
    }
  });
}

export function t(key) {
  return i18next.t(key);
}

export function setLanguage(lang) {
  i18next.changeLanguage(lang);
}
