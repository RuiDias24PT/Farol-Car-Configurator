import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { Note } from '@/state/constraints'

import { de } from './de'
import { en } from './en'
import {
  detectLang,
  formatBlocked,
  formatNote,
  isLang,
  LANGS,
  LOCALES,
} from './index'
import { pt } from './pt'

function shapePaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [`${prefix}:fn`]
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => shapePaths(item, `${prefix}[${i}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([key, child]) =>
        shapePaths(child, prefix ? `${prefix}.${key}` : key),
      )
  }
  return [`${prefix}:${typeof value}`]
}

describe('locale shape', () => {
  it('en has the exact shape of pt', () => {
    expect(shapePaths(en)).toEqual(shapePaths(pt))
  })

  it('de has the exact shape of pt', () => {
    expect(shapePaths(de)).toEqual(shapePaths(pt))
  })

  it('LOCALES is keyed by every shipped language', () => {
    expect(Object.keys(LOCALES).sort()).toEqual([...LANGS].sort())
  })
})

// --- constraint messages -----------------------------------------------------

const SAMPLE_NOTES: readonly Note[] = [
  { code: 'wheelsNeedElectrified', wheels: 'aero19', powertrain: 'ice', to: 'sport20' },
  { code: 'wheelsNeedBigBody', wheels: 'multi21', body: 'bairro', to: 'sport20' },
  { code: 'packageBlockedByWheels', pkg: 'tow', wheels: 'multi21' },
  { code: 'packageNeedsTowBody', pkg: 'tow', body: 'solar' },
  { code: 'bodySwappedForPackage', pkg: 'tow', from: 'solar', to: 'serra' },
  { code: 'wheelsSwappedForPackage', pkg: 'tow', from: 'multi21', to: 'sport20' },
]

describe('formatNote', () => {
  for (const locale of Object.values(LOCALES)) {
    for (const note of SAMPLE_NOTES) {
      it(`${locale.tag}: ${note.code} is a resolved, non-empty sentence`, () => {
        const text = formatNote(locale, note)
        expect(text.length).toBeGreaterThan(0)
        expect(text).not.toContain('undefined')
        expect(text).not.toContain('[object Object]')
      })
    }
  }

  it('every code produces a distinct string', () => {
    const seen = new Set(SAMPLE_NOTES.map((note) => formatNote(pt, note)))
    expect(seen.size).toBe(SAMPLE_NOTES.length)
  })

  it('switching locale changes the words', () => {
    const note = SAMPLE_NOTES[0]
    expect(formatNote(pt, note)).not.toBe(formatNote(en, note))
    expect(formatNote(en, note)).not.toBe(formatNote(de, note))
  })

  it('contracts the Portuguese preposition and article: "na Serra"', () => {
    const text = formatNote(pt, {
      code: 'packageNeedsTowBody',
      pkg: 'winter',
      body: 'serra',
    })
    expect(text).toContain('na Serra')
    expect(text).not.toContain('em a')
  })

  it('picks the article per body when swapping (SPEC §2 example)', () => {
    const text = formatNote(pt, {
      code: 'bodySwappedForPackage',
      pkg: 'tow',
      from: 'solar',
      to: 'serra',
    })
    expect(text).toBe(
      'O Solar não homologa reboque — passei para a Serra, que puxa até 2 000 kg.',
    )
  })
})

describe('formatBlocked', () => {
  it('is a present-tense reason, not a correction', () => {
    const text = formatBlocked(pt, {
      code: 'wheelsNeedElectrified',
      wheels: 'aero19',
      powertrain: 'ice',
      to: 'sport20',
    })
    expect(text).toBe('Só em versões electrificadas')
    expect(text).not.toContain('passei')
  })

  it('names the body it is blocked on', () => {
    expect(
      formatBlocked(pt, { code: 'packageNeedsTowBody', pkg: 'tow', body: 'solar' }),
    ).toContain('no Solar')
  })

  it('falls back to the full sentence for a swap note that cannot reach it', () => {
    const swap: Note = {
      code: 'bodySwappedForPackage',
      pkg: 'tow',
      from: 'solar',
      to: 'serra',
    }
    expect(formatBlocked(pt, swap)).toBe(formatNote(pt, swap))
  })
})

// --- language detection -----------------------------------------------------

describe('isLang', () => {
  it('accepts only shipped codes', () => {
    expect(isLang('pt')).toBe(true)
    expect(isLang('de')).toBe(true)
    expect(isLang('fr')).toBe(false)
    expect(isLang(null)).toBe(false)
    expect(isLang(undefined)).toBe(false)
  })
})

describe('detectLang', () => {
  let languages: readonly string[] = []

  beforeAll(() => {
    Object.defineProperty(window.navigator, 'languages', {
      configurable: true,
      get: () => languages,
    })
  })

  beforeEach(() => {
    localStorage.clear()
    languages = []
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('prefers a valid stored choice over the browser', () => {
    localStorage.setItem('farol.lang', 'de')
    languages = ['en-GB', 'en']
    expect(detectLang()).toBe('de')
  })

  it('ignores an unknown stored choice', () => {
    localStorage.setItem('farol.lang', 'fr')
    languages = ['en-US', 'en']
    expect(detectLang()).toBe('en')
  })

  it('takes the first supported navigator language by its base', () => {
    languages = ['fr-FR', 'de-DE', 'en']
    expect(detectLang()).toBe('de')
  })

  it('defaults to pt when nothing matches', () => {
    languages = ['fr-FR', 'es-ES']
    expect(detectLang()).toBe('pt')
  })
})
