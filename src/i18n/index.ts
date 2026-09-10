import { de } from './de'
import { en } from './en'
import { pt } from './pt'
import type { Locale } from './pt'

export type {
  BodyChange,
  BodyRef,
  Locale,
  PackageOnBody,
  PackageOnWheel,
  WheelChange,
  WheelOnBody,
} from './pt'
export { formatBlocked, formatNote } from './notes'

export const LANGS = ['pt', 'en', 'de'] as const
export type Lang = (typeof LANGS)[number]

export const LOCALES: Record<Lang, Locale> = { pt, en, de }

export function isLang(value: unknown): value is Lang {
  return value === 'pt' || value === 'en' || value === 'de'
}

/** The stored choice, or null if there is none, it is unknown, or storage throws
 *  (Safari private mode). Never lets a storage exception reach the caller. */
export function readStoredLang(): Lang | null {
  try {
    const stored = localStorage.getItem('farol.lang')
    return isLang(stored) ? stored : null
  } catch {
    return null
  }
}

export function detectLang(): Lang {
  const stored = readStoredLang()
  if (stored) return stored

  const prefs =
    typeof navigator === 'undefined'
      ? []
      : (navigator.languages ?? [navigator.language]).filter(Boolean)

  for (const pref of prefs) {
    const base = pref.slice(0, 2).toLowerCase()
    if (isLang(base)) return base
  }

  return 'pt'
}
