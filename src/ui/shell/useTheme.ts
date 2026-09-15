import { useCallback, useEffect, useState } from 'react'

export type Theme = 'auto' | 'light' | 'dark'

const KEY = 'farol.theme'
const ORDER: readonly Theme[] = ['auto', 'light', 'dark']

function isTheme(value: string | null): value is Theme {
  return value === 'auto' || value === 'light' || value === 'dark'
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY)
    return isTheme(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}

export function useTheme(): { theme: Theme; cycleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
    setTheme(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage blocked: the theme still switches, it just won't persist.
    }
  }, [theme])

  return { theme, cycleTheme }
}
