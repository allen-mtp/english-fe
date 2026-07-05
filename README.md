# Starter Vite TS (FSD)

Quick guide to run the project, understand the FSD architecture, and extend it safely.

## Requirements

- Node.js 20.x (matches `engines`). If you are on Node >=21, use `nvm use 20`.
- Yarn classic 1.x or npm.

## Install & run

```sh
# install deps
yarn install

# copy env template
cp .env.example .env

# start dev (http://localhost:7081)
yarn dev

# production build (typecheck + Vite)
yarn build
```

For npm: `npm install && npm run dev` / `npm run build`.

## FSD structure

| Layer | Path | Role |
|-------|------|------|
| App | `src/app` | Shell, router, providers, global styles |
| Pages | `src/pages` | Route entrypoints (lazy-loaded) |
| Widgets | `src/widgets` | Layouts, composite sections |
| Features | `src/features` | Feature logic (e.g. auth) |
| Entities | `src/entities` | Domain models / helpers |
| Shared | `src/shared` | UI kit, hooks, lib, theme, config, mock API |

```
src/
  app/              # main.tsx entry via app/app.tsx, routes, providers
    layouts/        # RootLayout (ProgressBar, SettingsDrawer)
    routes/         # paths, hooks, sections (auth, dashboard)
    styles/         # global.css
  pages/            # dashboard/one…six, auth/jwt, error
  widgets/          # layouts/, sections/
  features/         # auth/
  entities/         # (add domain slices here)
  shared/
    ui/             # components
    hooks/ lib/ theme/ config/ assets/
    api/mock/
```

## Import aliases

- `@app/*` → `src/app/*`
- `@pages/*` → `src/pages/*`
- `@widgets/*` → `src/widgets/*`
- `@features/*` → `src/features/*`
- `@entities/*` → `src/entities/*`
- `@shared/*` → `src/shared/*`

Example:

```ts
import { routesSection } from '@app/routes/sections';
import { useScrollToTop } from '@shared/hooks/use-scroll-to-top';
import { DashboardLayout } from '@widgets/layouts/dashboard';
import { AuthProvider } from '@features/auth/context/jwt';
```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Vite dev server |
| `yarn build` | `tsc --noEmit` then Vite production build |
| `yarn typecheck` | TypeScript check only |
| `yarn lint` / `yarn lint:fix` | ESLint |
| `yarn fm:check` / `yarn fm:fix` | Prettier |

## Environment

Config: `src/shared/config/config-global.ts` reads `import.meta.env.VITE_*`.

Use prefix `VITE_` in `.env` at the project root (see `.env.example`).

## Routing (React Router)

- Register routes in `src/app/routes/sections/`.
- New page: add `src/pages/<name>/index.tsx`, then wire in `sections/dashboard.tsx` or `sections/auth.tsx`.
- Router hooks live in `src/app/routes/hooks/` (`useRouter`, `usePathname`, `useSearchParams` — Next.js-compatible API).

## Extension guidelines

- **New page:** `src/pages/...` + register in `src/app/routes/sections`.
- **New feature:** `src/features/<feature>/...` — depend on `@shared/*` only.
- **New widget:** `src/widgets/...` — props in, no direct API calls.
- **Entity:** `src/entities/<domain>/...` — reusable domain types/helpers.
- **Shared UI:** `src/shared/ui/...`.

## TypeScript note

Core app shell (`app/`, `providers`, route hooks) is typed. Legacy UI migrated from JavaScript may use `// @ts-nocheck` until props are typed per module — remove those comments gradually when editing files.
