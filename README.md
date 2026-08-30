# LogiFlow — Frontend

Angular app for the LogiFlow TMS (vehicle assignment, routing, grouping, predictive maintenance).

Sits next to [`logiflow-backend`](../logiflow-backend). Stack: **Angular 22**, **Tailwind CSS 4**, **pnpm**, **Ultracite + Biome**, **Vitest**.

## Setup

1. Node.js **24.15+** (or 22.22.3+). This repo pins Node **24.20.0** via `.npmrc` (`use-node-version`) so `pnpm` can download it even if your global Node is older.
2. [pnpm](https://pnpm.io/) 11+

```bash
cd logiflow-frontend
pnpm install
pnpm start
```

Open http://localhost:4200. The app reloads on file changes.

`pnpm start` (not a global `ng serve`) is the reliable command: it uses the workspace Node version.

## Scripts

| Command        | What it does                                      |
| -------------- | ------------------------------------------------- |
| `pnpm start`   | Dev server at http://localhost:4200               |
| `pnpm build`   | Production build → `dist/`                        |
| `pnpm test`    | Unit tests (Vitest)                               |
| `pnpm check`   | Lint + format check (Ultracite / Biome)           |
| `pnpm fix`     | Auto-fix lint and format                          |
| `pnpm exec ng generate component name` | Scaffold a component            |

## Styling

Tailwind **v4** (CSS-first). No `tailwind.config.js`.

- Import: `@import "tailwindcss";` in `src/styles.css`
- PostCSS: `.postcssrc.json` with `@tailwindcss/postcss`
- Put utilities on templates: `class="text-3xl font-bold"`

## Lint and format

Ultracite wraps Biome. Prettier and ESLint are not used.

- Save in Cursor/VS Code to format (Biome extension)
- HTML interpolations (`{{ title() }}`) are allowed via `html.parser.interpolation` in `biome.jsonc`

Install recommended extensions from `.vscode/extensions.json` (Angular Language Service, Biome, Tailwind IntelliSense).

## Tests

```bash
pnpm exec ng test --watch=false
```

Watch mode (default in a TTY): `pnpm test`.

## Node / CLI mismatch

Angular 22 CLI rejects Node **24.13.x**. If `ng` fails with a Node version error, use `pnpm` scripts so `.npmrc` supplies 24.20.0, or upgrade Node to 24.15+.
