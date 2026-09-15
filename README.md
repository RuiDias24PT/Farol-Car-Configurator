# Farol - A car configurator

A configurator for a fictional car brand. Pick a body, powertrain, colour,
wheels and packages; the car updates in 3D, the price follows, and the whole
configuration lives in a shareable link.

**Live:** https://farol-car-configurator.vercel.app

<!-- TODO: GIF of a full configuration, including a correction note -->

The interesting part is not the UI. It is the rule that **every combination on
screen is buildable**. Whether it came from a click, a hand-edited URL or a
link shared months ago.

---

## The constraint engine

Some choices exclude others. Aero wheels need an electrified powertrain, 21"
wheels need a body that takes them, and a tow package needs a body that can
tow. The prices and the rules are small; the hard part is keeping them in one
place.

All of it is one pure function in `src/domain/constraints.ts`:

```
reconcile(config) -> { config, notes }
```

It moves anything invalid to the nearest valid value and returns a note for
each correction. Every path into state goes through it. Every reducer action,
and every link opened from the address bar. There is no second copy of the
rules in a component.

| # | Rule | Correction |
|---|---|---|
| 1 | Wheels need electrification, powertrain isn't | wheels → `sport20` |
| 2 | Wheels need a big-wheel body, body isn't one | wheels → `sport20` |
| 3 | Selected wheels block a package | package removed |
| 4 | Package needs towing, body can't tow | package removed |

Adding a package is the one place the engine resolves _upward_: the user asked
for the package, so the package wins and the body or wheels change instead.

## The URL is the state

```
#/{body}/{powertrain}/{colour}/{wheels}/{packages|-}/{step}
#/serra/ev/carmine/multi21/assist,sound/wheels
```

- Opening a link parses the hash and runs it through `reconcile`. An impossible
  link corrects itself and says what changed; a malformed one falls back field
  by field. Neither throws.
- The step is carried by id, not by index, so adding a step later doesn't
  repoint every link already shared.
- Packages are sorted, so the same car always yields the same URL.
- Step changes `pushState`, so the back button walks the funnel; corrections
  `replaceState`.
- The share link is built from state, not read from `location.href`.
- `useUrlSync` is the only file that touches `history` or `location`.

## i18n

Portuguese, English and German.

- Locales are typed as `typeof pt`: a key added to Portuguese and forgotten in
  German is a compile error.
- Messages are functions that take parameters, never concatenated fragments.
  Portuguese needs article agreement: _na_ Serra, _no_ Solar. So a message
  receives the whole body reference, not just its name.
- Money and numbers go through `Intl.NumberFormat` for the active locale, with
  grouping forced so `1 850 €` doesn't render as `1850 €` next to `46 900 €`.
- Power is shown as cv, hp or PS depending on the language.

## 3D stage

Procedural, built with three.js

- One set of ~15 numbers per body (`geo`) drives both the 3D car and the 2D SVG
  silhouettes on the body cards.
- The powertrain changes the model: grille, exhausts, fuel cap or charge flap.
- Body, wheels and powertrain trigger a rebuild; colour and theme update the
  existing materials.
- Light and dark themes use different studio environment maps, not just a
  different background.
- Geometries, materials and listeners are disposed on unmount. Without WebGL
  the stage hides itself and the configurator still works.

## Accessibility

- The whole funnel can be completed with the keyboard alone.
- Blocked options stay focusable and explain why they're unavailable.
- Correction notes are announced (`role="status"`), and dismissing one keeps
  focus in the panel.
- The price tween, camera moves and auto-rotation respect
  `prefers-reduced-motion`.

---

## Project structure

```
src/
  catalog/   ids, prices and geometry
  domain/    pure logic: constraints, pricing, URL, specs
  state/     reducer + context, URL sync
  i18n/      pt / en / de, note formatting
  scene/     three.js scene, no React
  ui/        shell, stage, funnel steps
```

`domain/` and `scene/` don't import React. The catalogue folder is not called
`config`: in this app, `Config` means the car the user has chosen.

## Running it

Requires Node 24 (see `.nvmrc`).

```
npm install
npm run dev          # Vite dev server
npm test             # Vitest
npm run lint
npm run typecheck
npm run build        # production build
```

CI runs typecheck, lint, tests and a Prettier check on every push.

## Stack

React 19 · TypeScript · Vite · three.js · Vitest + Testing Library. No state
library: `useReducer` and context are enough for one config object.

---

Farol is fictional. No real manufacturer's names, models or assets are used.
