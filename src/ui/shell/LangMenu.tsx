import { useId, useRef, useState } from 'react'

import { LANGS, LOCALES } from '@/i18n'
import type { Lang } from '@/i18n'
import { useLang, useT } from '@/i18n/useT'

import { Flag } from './Flag'
import { useDismiss } from './useDismiss'

export function LangMenu() {
  const t = useT()
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useDismiss({ open, setOpen, container: wrap, trigger: button })

  function choose(next: Lang) {
    setOpen(false)
    // The option being clicked is about to unmount; without this, focus falls to <body>.
    button.current?.focus()
    if (next !== lang) setLang(next)
  }

  return (
    <span className="info-wrap" ref={wrap}>
      <button
        ref={button}
        className="lang-btn"
        type="button"
        aria-label={`${t.ui.language}: ${t.name}`}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((was) => !was)}
      >
        <Flag lang={lang} />
        <span className="lang-tag">{t.tag}</span>
        <span className="lang-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul className="info-pop lang-pop" id={menuId}>
          {LANGS.map((code) => (
            <li key={code}>
              <button
                className="lang-opt"
                type="button"
                aria-current={code === lang ? 'true' : undefined}
                onClick={() => choose(code)}
              >
                <Flag lang={code} />
                <span lang={code}>{LOCALES[code].name}</span>
                <span className="lang-opt-tag" aria-hidden="true">
                  {LOCALES[code].tag}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}
