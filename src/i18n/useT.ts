import { createContext, useContext } from 'react'

import type { Lang, Locale } from './index'

export interface LangContextValue {
  lang: Lang
  locale: Locale
  intl: string
  setLang: (next: Lang) => void
}

export const LangContext = createContext<LangContextValue | null>(null)

function useLangContext(): LangContextValue {
  const value = useContext(LangContext)
  if (!value) {
    throw new Error('useT: no <LangProvider> above this component')
  }
  return value
}

export function useT(): Locale {
  return useLangContext().locale
}

export function useLang(): LangContextValue {
  return useLangContext()
}
