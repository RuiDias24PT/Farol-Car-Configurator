import { useLang, useT } from '@/i18n/useT'
import { formatEUR, total } from '@/state/pricing'
import { useConfig } from '@/state/useStore'

import { useTween } from './useTween'

export function PriceBar() {
  const config = useConfig()
  const t = useT()
  const { intl } = useLang()

  const target = total(config)
  const shown = useTween(target)

  return (
    <div className="price-figure">
      <div className="price-label">{t.ui.priceLabel}</div>
      {/* The rolling digits are for the eye only; a screen reader gets the
          settled figure instead of every in-between frame. */}
      <div className="price-num" aria-hidden="true">
        {formatEUR(shown, intl)}
      </div>
      <span className="visually-hidden">{formatEUR(target, intl)}</span>
    </div>
  )
}
