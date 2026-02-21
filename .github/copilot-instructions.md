# Copilot Instructions — Four Thousand Weeks

## Project Overview

A **Life Calendar** (Memento Mori) web app that visualises an 80-year lifespan as a grid of ~4,160 week cells. Users enter their birth date and see past/current/future weeks, annotate life events (point-in-time or period), and manage eras. All data is persisted client-side in `localStorage`—there is no backend.

## Tech Stack & Versions

| Tool | Version | Notes |
|---|---|---|
| **pnpm** | 9+ | **Always use `pnpm`** — never `npm` or `yarn`. Lockfile: `pnpm-lock.yaml` |
| **Node.js** | 20+ | CI uses Node 20 |
| **Vite** | 7 | With `@vitejs/plugin-react-swc` (SWC compiler) |
| **React** | 19 | Functional components only, no class components |
| **TypeScript** | ~5.9 | **Strict mode** with `noUncheckedIndexedAccess: true` |
| **Zustand** | 5 | State management with persistence middleware |
| **date-fns** | 4 | Modular date arithmetic — all date logic in `src/lib/dateUtils.ts` |
| **Zod** | 3 | Runtime validation schemas in `src/lib/schemas.ts` |
| **Tailwind CSS** | 4 | Via `@tailwindcss/vite` plugin, imported as `@import "tailwindcss"` in CSS |

## Build, Lint & Test Commands

Always run commands from the repository root with `pnpm`:

```bash
pnpm install          # Install dependencies (use --frozen-lockfile in CI)
pnpm lint             # ESLint (must pass before commit)
pnpm build            # TypeScript type-check (tsc -b) then Vite production build
pnpm dev              # Start Vite dev server
pnpm preview          # Preview production build
```

**There is no test runner configured yet.** Do not attempt to run `pnpm test`. If adding tests, install `vitest` first and add a `test` script to `package.json`.

**Validation checklist** — always run these before considering a change complete:
1. `pnpm lint` — zero warnings/errors
2. `pnpm build` — successful TypeScript compilation and Vite build

## Project Structure

```
.github/
  workflows/ci.yml          # CI: lint + type-check → build
  workflows/deploy.yml      # Deploy to GitHub Pages
  copilot-instructions.md   # This file
  instructions/             # Path-specific Copilot instructions
docs/research/              # Architecture research documents
src/
  main.tsx                  # App entry point (React 19 createRoot)
  App.tsx                   # Root component — layout, legend, routing
  index.css                 # Tailwind + CSS custom properties + grid styles
  components/
    LifeGrid.tsx            # Main grid — event delegation, keyboard nav, year labels
    WeekCell.tsx            # Memoised cell (React.memo with custom comparator)
    WeekTooltip.tsx         # Singleton tooltip (1 instance, follows mouse)
    WeekDetailRow.tsx       # Inline expansion panel below selected week row
    Header.tsx              # Title, stats, birthday edit
    BirthDateInput.tsx      # Initial date input form
    EventPanel.tsx          # Side panel for event management + import/export
    EventForm.tsx           # Add/edit event form
    EventList.tsx           # Sorted event list with edit/delete
  lib/
    dateUtils.ts            # All date-fns logic — week ranges, indices, era checks
    schemas.ts              # Zod schemas for LifeEra, LifeEvent, UserConfig, Export
    importExport.ts         # JSON export/import with Zod validation, file download
  store/
    lifeCalendarStore.ts    # Zustand store with persistence + selector hooks
  types/
    index.ts                # TypeScript interfaces (LifeEra, LifeEvent, WeekData, constants)
```

## Key Architecture Patterns

### Performance (rendering 4,000+ cells)
- **Event delegation**: Mouse/click/keyboard handlers are on the `LifeGrid` container, not on individual cells. Never add event listeners to `WeekCell`.
- **React.memo**: `WeekCell` uses a custom comparator. Keep it lightweight — no hooks or local state.
- **Singleton tooltip**: `WeekTooltip` is a single component that repositions on mouse move. Do not create per-cell tooltips.
- **Pre-computed week map**: `_recomputeWeekMap()` in the store builds a `Map<number, {eraIds, eventIds}>` for O(1) lookups. Recalculate after any data mutation.

### TypeScript Strictness
- `noUncheckedIndexedAccess: true` — every array/map index access may be `undefined`. Always use optional chaining or nullish coalescing (e.g., `arr[i]?.value ?? default`).
- `noUnusedLocals` and `noUnusedParameters` are enabled — no dead code.
- `verbatimModuleSyntax: true` — use `import type { ... }` for type-only imports.

### Path Aliases
Configured in both `tsconfig.app.json` and `vite.config.ts`:
- `@/*` → `./src/*`
- `@/lib/*`, `@/store/*`, `@/components/*`, `@/types/*`

Always use path aliases instead of relative imports (e.g., `import { getWeekRange } from '@/lib/dateUtils'`).

### State Management (Zustand)
- Store: `src/store/lifeCalendarStore.ts`
- **Selector hooks** for granular subscriptions: `useBirthDate()`, `useEras()`, `useEvents()`, `useHoveredWeek()`, `useSelectedWeek()`, etc.
- Persistence to `localStorage` with custom storage adapter that auto-hydrates ISO date strings back to `Date` objects.
- After mutating eras or events, always call `_recomputeWeekMap()`.

### Date Logic
- All date calculations are in `src/lib/dateUtils.ts` — do not use `date-fns` directly in components.
- Uses the "Birthday Week" model: Week 0 starts on the user's birth date. Each year row = 52 weeks.
- Key functions: `getWeekRange()`, `getWeekIndex()`, `weekIndexToPosition()`, `isWeekPast()`, `isCurrentWeek()`, `isEraActiveInWeek()`.

### CSS & Styling
- Global styles in `src/index.css` using CSS custom properties (e.g., `--cell-past`, `--cell-current`).
- Tailwind CSS 4 utility classes in JSX for layout and spacing.
- Custom CSS classes for grid (`.life-grid`, `.week-cell`, `.week-detail-row`).
- Dark mode is default; light mode via `prefers-color-scheme: light` media query.
- Print styles: `.no-print` class hides UI elements, background colours are preserved.

## CI Pipeline

GitHub Actions (`.github/workflows/ci.yml`):
1. **lint-and-typecheck** job: `pnpm lint` then `pnpm exec tsc -b`
2. **build** job (depends on lint): `pnpm build`

Both run on `ubuntu-latest` with Node 20 and pnpm 9.

## Common Pitfalls

- **Do not use `npm` or `yarn`** — this project uses `pnpm` exclusively.
- **Do not add event handlers to `WeekCell`** — use event delegation on `LifeGrid`.
- **Do not create multiple tooltip instances** — use the singleton `WeekTooltip`.
- **Always handle `undefined`** from indexed access due to `noUncheckedIndexedAccess`.
- **Import types with `import type`** — required by `verbatimModuleSyntax`.
- **Use path aliases** (`@/lib/...`) instead of relative paths (`../../lib/...`).
- **Keep `WeekCell` pure** — no hooks, no side effects, no local state. It receives data via props only.

## Future Extension Points

- **Test framework**: Add `vitest` + `@testing-library/react` when tests are needed. Configure in `vite.config.ts`.
- **Eras UI**: Era management UI (add/edit/delete) is defined in types but not yet built in components.
- **Temporal API**: Date logic is isolated in `dateUtils.ts` for future migration from date-fns to the Temporal API.
- **Accessibility**: Grid has basic ARIA (`role="grid"`, `role="gridcell"`, keyboard navigation). Expand with `aria-selected`, `aria-describedby`.
