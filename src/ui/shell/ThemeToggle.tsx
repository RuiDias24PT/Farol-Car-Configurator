import { useT } from '@/i18n/useT'

import { useTheme } from './useTheme'

const GLYPH = { auto: '◐', light: '☀', dark: '☾' } as const

export function ThemeToggle() {
  const t = useT()
  const { theme, cycleTheme } = useTheme()
  const label = `${t.ui.theme}: ${t.ui.themes[theme]}`

  return (
    <button
      className="icon-btn"
      type="button"
      aria-label={label}
      title={label}
      onClick={cycleTheme}
    >
      <span aria-hidden="true">{GLYPH[theme]}</span>
    </button>
  )
}
