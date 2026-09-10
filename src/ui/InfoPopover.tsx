import { useEffect, useId, useRef, useState } from 'react'

import { useT } from '@/i18n/useT'

export function InfoPopover() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const popId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span className="info-wrap" ref={wrap}>
      <button
        ref={button}
        className="icon-btn"
        type="button"
        aria-label={t.ui.info}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((was) => !was)}
      >
        <span aria-hidden="true">i</span>
      </button>

      {open && (
        <div className="info-pop" id={popId}>
          {t.legal.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </span>
  )
}
