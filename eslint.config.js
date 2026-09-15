import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

const REACT = ['react', 'react/*', 'react-dom', 'react-dom/*']
const THREE = ['three', 'three/*']

// A later block replaces a rule's options instead of merging them, so every
// layer restates the `../` ban — otherwise a relative path walks round the
// alias patterns below.
const layer = (group, message) => [
  'error',
  {
    patterns: [
      {
        regex: '^\\.\\./',
        message: 'Import across folders through the @/ alias.',
      },
      ...(group.length ? [{ group, message }] : []),
    ],
  },
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': layer([], '') },
  },
  {
    files: ['src/catalog/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': layer(
        ['@/*'],
        'catalog is the bottom layer and imports nothing from the app.',
      ),
    },
  },
  {
    // The copilot tools and the server route reuse this code, so it cannot
    // depend on React, three.js or any layer that does.
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': layer(
        [
          ...REACT,
          ...THREE,
          '@/i18n',
          '@/i18n/*',
          '@/scene/*',
          '@/state/*',
          '@/ui/*',
          '@/App',
        ],
        'domain is pure TypeScript: no React, three.js, i18n, state, scene or ui.',
      ),
    },
  },
  {
    files: ['src/scene/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': layer(
        [...REACT, '@/i18n', '@/i18n/*', '@/state/*', '@/ui/*', '@/App'],
        'scene is plain three.js; React bindings belong in ui/stage.',
      ),
    },
  },
])
