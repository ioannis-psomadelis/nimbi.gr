import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Cookies from 'js-cookie'
import { translations } from './translations'

const LANGUAGE_KEY = 'nimbi-language'

// Get initial language from various sources
// Priority: document data attr > cookie > default 'en'
function getInitialLanguage(): 'en' | 'el' {
  if (typeof document !== 'undefined') {
    // First check data attribute (set by inline script before React loads)
    const dataLang = document.documentElement.dataset.lang
    if (dataLang === 'el' || dataLang === 'en') {
      return dataLang
    }
    // Fallback to cookie directly (for client-side navigation)
    const cookieLang = Cookies.get(LANGUAGE_KEY)
    if (cookieLang === 'el' || cookieLang === 'en') {
      return cookieLang
    }
  }
  return 'en'
}

// Initialize with detected language
i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

// Sync language from cookies after hydration (called once on client)
// Also migrates from localStorage to cookies for existing users
export const syncLanguageFromStorage = () => {
  if (typeof document !== 'undefined') {
    let lang = Cookies.get(LANGUAGE_KEY)

    // Migrate from localStorage if no cookie exists
    if (!lang && typeof localStorage !== 'undefined') {
      const localLang = localStorage.getItem(LANGUAGE_KEY)
      if (localLang === 'el' || localLang === 'en') {
        lang = localLang
        Cookies.set(LANGUAGE_KEY, lang, { expires: 365 })
        localStorage.removeItem(LANGUAGE_KEY) // Clean up old storage
      }
    }

    if (lang === 'el' || lang === 'en') {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang)
      }
    }
  }
}

export const changeLanguage = (lang: 'en' | 'el') => {
  i18n.changeLanguage(lang)
  if (typeof document !== 'undefined') {
    Cookies.set(LANGUAGE_KEY, lang, { expires: 365 })
  }
}

export default i18n
