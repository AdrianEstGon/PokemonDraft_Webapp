# Pokémon Unite Drafter

## Counter data (automated, daily)

Pick recommendations are driven by Pokémon match-up percentages. There is **no
manual configuration** anymore — the old admin "Settings" counter editor was removed.

- **Live source:** [uniteapi.dev/en/counters](https://uniteapi.dev/en/counters). The
  site is behind Cloudflare, so it can't be fetched directly from the browser; a
  headless browser scrapes it on a schedule instead.
- **Pipeline:** `.github/workflows/update-counters.yml` runs every day at 06:00 UTC
  (and on-demand from the Actions tab). It runs `npm run scrape:counters`
  ([scripts/scrape-counters.mjs](scripts/scrape-counters.mjs), Playwright) and commits
  [public/counters.json](public/counters.json) when it changes.
- **The app** loads `counters.json` as a static file (same-origin, no CORS) via
  [src/services/CounterService.tsx](src/services/CounterService.tsx) and builds
  recommendations in [src/pages/draft/DraftAdvisor.ts](src/pages/draft/DraftAdvisor.ts).
  Names are joined to the backend roster by a normalised key, so spelling differences
  are harmless. The draft screen shows a chip with the data's source and date.
- **Fallback seed:** `npm run seed:counters`
  ([scripts/gen-seed.mjs](scripts/gen-seed.mjs)) regenerates a role-based heuristic
  `counters.json` (`source: "seed"`). The scraper **never** overwrites the file with a
  partial result, so the app keeps working if a scrape fails.

### First-run note

The scraper's selectors are best-effort (the live HTML couldn't be inspected up front).
Run it once headed to watch it and adjust the selectors in `scrape-counters.mjs` if the
site's markup differs:

```bash
npm install -D playwright && npx playwright install chromium
HEADLESS=0 npm run scrape:counters
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
