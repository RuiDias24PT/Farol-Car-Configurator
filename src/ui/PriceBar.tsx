import { useLang, useT } from '@/i18n/useT'
import { formatEUR, total } from '@/state/pricing'
import { useConfig } from '@/state/useStore'

export function PriceBar() {
  const config = useConfig()
  const t = useT()
  const { intl } = useLang()

  return (
    <div className="price-figure">
      <div className="price-label">{t.ui.priceLabel}</div>
      <div className="price-num">{formatEUR(total(config), intl)}</div>
    </div>
  )
}
