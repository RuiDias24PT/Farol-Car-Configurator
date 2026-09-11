import { useEffect, useId, useState } from 'react'

import type { Locale } from '@/i18n'
import { useLang, useT } from '@/i18n/useT'
import { formatEUR, lines, total } from '@/state/pricing'
import type { PriceLine } from '@/state/pricing'
import { shareUrlFor } from '@/state/useUrlSync'
import { useConfig } from '@/state/useStore'

import './Summary.css'

function labelFor(t: Locale, line: PriceLine): string {
  switch (line.source) {
    case 'body':
      return `${t.bodies[line.id].name} ${t.bodies[line.id].kind}`
    case 'powertrain':
      return t.powertrains[line.id].label
    case 'colour':
      return t.colours[line.id].label
    case 'wheels':
      return t.wheels[line.id].label
    case 'package':
      return t.packages[line.id].label
  }
}

export function Summary() {
  const config = useConfig()
  const t = useT()
  const { intl } = useLang()

  // Same rows the total is summed from, so the list and the figure below it
  // cannot disagree.
  const rows = lines(config)

  return (
    <div className="summary">
      <dl className="sum-list">
        {rows.map((line) => (
          <div className="sum-row" key={`${line.source}:${line.id}`}>
            <dt>{labelFor(t, line)}</dt>
            <dd>
              {line.source === 'body'
                ? formatEUR(line.price, intl)
                : line.price === 0
                  ? t.ui.included
                  : `+${formatEUR(line.price, intl)}`}
            </dd>
          </div>
        ))}
      </dl>

      <div className="sum-total">
        <span>{t.ui.total}</span>
        <b>{formatEUR(total(config), intl)}</b>
      </div>

      <ShareLink url={shareUrlFor(config)} />
    </div>
  )
}

function ShareLink({ url }: { url: string }) {
  const t = useT()
  const inputId = useId()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // No clipboard (insecure origin, denied permission): the link is still in
      // the field, selectable by hand, so failing quietly loses nothing.
    }
  }

  return (
    <div className="share">
      <p>{t.ui.shareText}</p>
      <div className="share-row">
        <label className="visually-hidden" htmlFor={inputId}>
          {t.ui.shareLink}
        </label>
        <input
          id={inputId}
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
        />
        <button className="ghost" type="button" onClick={copy}>
          {copied ? t.ui.copied : t.ui.copy}
        </button>
      </div>
    </div>
  )
}
