---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Guidelines

- **Strict mode is enabled** — `strict: true` with `noUncheckedIndexedAccess: true`.
- Every array index or `Map.get()` call may return `undefined`. Always use optional chaining (`?.`) or nullish coalescing (`??`).
- Use `import type { ... }` for type-only imports — required by `verbatimModuleSyntax: true`.
- No unused locals or parameters — `noUnusedLocals` and `noUnusedParameters` are enabled.
- Use path aliases: `@/lib/*`, `@/store/*`, `@/components/*`, `@/types/*` instead of relative paths.
- Target is `ES2022` — modern syntax like optional chaining, nullish coalescing, and `Object.hasOwn()` is available.
- Interfaces for data models are in `src/types/index.ts`. Zod schemas mirror these in `src/lib/schemas.ts`.
