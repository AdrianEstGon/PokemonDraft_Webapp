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

### Recomendación

La recomendación de pick se basa **únicamente** en los valores *Strong against* /
*Weak against* de uniteapi (win % del pick contra cada enemigo). No hay bonus de tier
ni límites de rol. Aparece en tu turno de pick, una vez que haya **al menos un enemigo
elegido** (es un counter-pick: necesita saber contra quién).

### Cómo cargar los datos reales de uniteapi

uniteapi está tras Cloudflare, que bloquea con dureza el scraping desde servidores/CI.
La vía **fiable** es tu propio navegador (que ya pasó el challenge):

1. Abre <https://uniteapi.dev/en/counters>, pestaña **General**, filtro **All**, y baja
   hasta el final para cargar todas las filas.
2. Abre la consola (F12 → Console), pega el contenido de
   [scripts/browser-scrape.js](scripts/browser-scrape.js) y Enter.
3. Se descarga `counters.json`. Cópialo a `public/counters.json`, commitea y despliega.

Alternativa automatizable (best-effort, puede fallar por Cloudflare en CI):

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
