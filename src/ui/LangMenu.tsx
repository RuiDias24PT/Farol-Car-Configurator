import { LANGS } from '@/i18n'
import { useLang, useT } from '@/i18n/useT'

export function LangMenu() {
  const t = useT()
  const { lang, setLang } = useLang()

  const cycle = () => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length])

  return (
    <button
      className="lang-btn"
      type="button"
      aria-label={`${t.ui.language}: ${t.name}`}
      onClick={cycle}
    >
      <span className="lang-tag">{t.tag}</span>
      <span className="lang-caret" aria-hidden="true">
        ▾
      </span>
    </button>
  )
}
