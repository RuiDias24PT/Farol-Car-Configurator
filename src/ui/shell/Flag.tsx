import type { ReactElement } from 'react'

import type { Lang } from '@/i18n'

// Keyed by Lang, so shipping a fourth locale doesn't compile until it has a
// flag. Inline SVG: no image requests, and it scales with the CSS box.
// No <defs>/ids on purpose — the active flag renders twice while the menu is
// open (trigger and option), and duplicate ids would collide.
const SHAPES: Record<Lang, ReactElement> = {
  pt: (
    <>
      <rect width="21" height="15" fill="#046A38" />
      <rect x="8.4" width="12.6" height="15" fill="#DA291C" />
      <circle cx="8.4" cy="7.5" r="3.3" fill="#FFE900" />
      <circle
        cx="8.4"
        cy="7.5"
        r="1.8"
        fill="#fff"
        stroke="#DA291C"
        strokeWidth="0.7"
      />
    </>
  ),
  en: (
    <>
      <rect width="21" height="15" fill="#012169" />
      <path d="M0 0L21 15M21 0L0 15" stroke="#fff" strokeWidth="3" />
      <path d="M0 0L21 15M21 0L0 15" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M10.5 0V15M0 7.5H21" stroke="#fff" strokeWidth="5" />
      <path d="M10.5 0V15M0 7.5H21" stroke="#C8102E" strokeWidth="3" />
    </>
  ),
  de: (
    <>
      <rect width="21" height="5" fill="#000" />
      <rect y="5" width="21" height="5" fill="#DD0000" />
      <rect y="10" width="21" height="5" fill="#FFCE00" />
    </>
  ),
}

/** Decorative: always rendered next to the language's name, which carries the meaning. */
export function Flag({ lang }: { lang: Lang }) {
  return (
    <span className="lang-flag" aria-hidden="true">
      <svg viewBox="0 0 21 15" preserveAspectRatio="none">
        {SHAPES[lang]}
      </svg>
    </span>
  )
}
