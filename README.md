# Four Thousand Weeks

> "How we spend our days is, of course, how we spend our lives." — Annie Dillard

A **Life Calendar** (Memento Mori) visualization that displays your entire lifespan as a grid of weeks. Each cell represents one week of the approximately 4,000 weeks in an 80-year life.

![Life Calendar Demo](https://via.placeholder.com/800x400?text=Life+Calendar+Preview)

## Concept

This application visualizes the finite nature of human life to encourage mindful living. Inspired by the Stoic concept of "Memento Mori" (remember that you will die), it provides a stark visual representation of time passing.

- **~4,160 weeks** in an 80-year lifespan
- **52 columns** (weeks per year)
- **80 rows** (years of life)

## Tech Stack

This project follows the architectural recommendations from our [research document](./research/React%20+%20Vite%20+%20TypeScript%20Implementation%20Research.md):

| Technology | Purpose |
|------------|---------|
| **Vite + SWC** | Fast build tooling with Rust-based compilation |
| **React 19** | UI library with modern concurrent features |
| **TypeScript** | Strict type safety with `noUncheckedIndexedAccess` |
| **Zustand** | Lightweight state management with granular subscriptions |
| **date-fns** | Modular date arithmetic (tree-shakeable) |
| **Zod** | Runtime validation for data integrity |
| **Tailwind CSS** | Utility-first CSS with performance focus |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── LifeGrid.tsx    # Main grid container (event delegation)
│   ├── WeekCell.tsx    # Memoized cell component
│   ├── WeekTooltip.tsx # Singleton tooltip (1 instance only)
│   ├── Header.tsx      # Stats and navigation
│   └── BirthDateInput.tsx
├── lib/                 # Utility modules
│   ├── dateUtils.ts    # Temporal calculations (date-fns wrapper)
│   └── schemas.ts      # Zod validation schemas
├── store/              # State management
│   └── lifeCalendarStore.ts  # Zustand with persistence
├── types/              # TypeScript definitions
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css           # Tailwind + CSS design system
```

## Performance Architecture

This application renders **4,000+ interactive elements**. Key optimizations:

1. **Native CSS Grid** with `contain: strict` for layout containment
2. **React.memo** on WeekCell to prevent unnecessary re-renders
3. **Event Delegation** - single listener on grid container, not 4000 listeners
4. **Singleton Tooltip** - one tooltip component that moves, not 4000 instances
5. **Pre-computed Week Map** - O(1) lookups for era/event data

## Print Support

The calendar is designed to be printed as a physical artifact:

- Press `Ctrl/Cmd + P` or use the print button
- Background colors are preserved (`print-color-adjust: exact`)
- UI elements are hidden in print mode (`.no-print`)
- Year rows won't break across pages (`break-inside: avoid`)

## Data Model

### Eras (Time Ranges)
Overlapping life periods like "College", "Living in NYC", "First Job".

### Events (Point-in-Time)
Specific moments like graduations, weddings, or milestones.

Data is persisted to `localStorage` with automatic Date object hydration.

## Customization

CSS variables in `src/index.css`:

```css
:root {
  --cell-past: #3f3f46;      /* Lived weeks */
  --cell-current: #fbbf24;   /* Current week */
  --cell-future: #27272a;    /* Future weeks */
  
  /* Era category colors */
  --era-work: #3b82f6;
  --era-education: #8b5cf6;
  --era-location: #10b981;
  --era-relationship: #f43f5e;
}
```

## Further Reading

- [Original Research Document](./research/React%20+%20Vite%20+%20TypeScript%20Implementation%20Research.md)
- [Wait But Why: Your Life in Weeks](https://waitbutwhy.com/2014/05/life-weeks.html)
- [Oliver Burkeman: Four Thousand Weeks](https://www.oliverburkeman.com/fourthousandweeks)

## License

MIT
