import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { detectLang, LOCALES } from './index'
import type { Lang } from './index'
import { LangContext } from './useT'
import type { LangContextValue } from './useT'

interface LangProviderProps {
  children: ReactNode
  initialLang?: Lang
}

export function LangProvider({ children, initialLang }: LangProviderProps) {
  const [lang, setLangState] = useState<Lang>(() => initialLang ?? detectLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem('farol.lang', next)
    } catch {
      // Private mode / storage disabled: the choice just won't persist.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      locale: LOCALES[lang],
      intl: LOCALES[lang].intl,
      setLang,
    }),
    [lang, setLang],
  )

  return <LangContext value={value}>{children}</LangContext>
}
