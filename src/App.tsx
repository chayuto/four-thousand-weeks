/**
 * Four Thousand Weeks - Life Calendar Application
 * 
 * A visualization of a human lifespan as a grid of weeks.
 * "Memento Mori" - Remember that you will die.
 */

import { Header } from './components/Header';
import { BirthDateInput } from './components/BirthDateInput';
import { LifeGrid } from './components/LifeGrid';
import { WeekTooltip } from './components/WeekTooltip';
import { useBirthDate } from './store/lifeCalendarStore';

function App() {
  const birthDate = useBirthDate();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main className="container py-8">
        {!birthDate ? (
          <BirthDateInput />
        ) : (
          <>
            {/* Legend */}
            <div className="mb-6 flex flex-wrap gap-4 text-sm no-print">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[var(--cell-past)]" />
                <span>Weeks lived</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[var(--cell-current)]" />
                <span>Current week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[var(--cell-future)]" />
                <span>Future weeks</span>
              </div>
            </div>

            {/* The Grid */}
            <LifeGrid />
          </>
        )}
      </main>

      {/* Singleton Tooltip */}
      <WeekTooltip />

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[var(--color-text-muted)] no-print">
        <p>
          "How we spend our days is, of course, how we spend our lives." — Annie Dillard
        </p>
      </footer>
    </div>
  );
}

export default App;
