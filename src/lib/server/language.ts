import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

const LANGUAGE_KEY = 'nimbi-language'

// Get language from cookie on server - defaults to 'en'
export const getServerLanguage = createServerFn({ method: 'GET' }).handler(
  async (): Promise<'en' | 'el'> => {
    try {
      const lang = getCookie(LANGUAGE_KEY)
      if (lang === 'el' || lang === 'en') {
        return lang
      }
      return 'en'
    } catch {
      return 'en'
    }
  }
)
