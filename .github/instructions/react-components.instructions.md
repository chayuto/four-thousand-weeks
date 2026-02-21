---
applyTo: "src/components/**/*.tsx"
---

# React Component Guidelines

- Use **functional components** with arrow function exports (e.g., `export const MyComponent = () => { ... }`).
- Wrap performance-critical components in `React.memo` with a custom comparator when props contain objects or arrays.
- **Never add event listeners to `WeekCell`** — all mouse/click/keyboard events are delegated via `LifeGrid`.
- Use Zustand **selector hooks** (`useBirthDate()`, `useEvents()`, etc.) for granular subscriptions — do not destructure the entire store.
- Use `import type { ... }` for type-only imports (enforced by `verbatimModuleSyntax`).
- Apply Tailwind CSS utility classes for layout. Use CSS custom properties (e.g., `var(--cell-current)`) for theme colours.
- Add `className="no-print"` to UI controls that should be hidden when printing.
- Date formatting in components: use `format()` from `date-fns` directly. Date *calculations* should go through `@/lib/dateUtils`.
