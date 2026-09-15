import { useId, useRef, useState } from 'react'

import { useT } from '@/i18n/useT'

import { useDismiss } from './useDismiss'

export function InfoPopover() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const popId = useId()

  useDismiss({ open, setOpen, container: wrap, trigger: button })

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
