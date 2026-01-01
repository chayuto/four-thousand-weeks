/**
 * Four Thousand Weeks - Life Calendar Application
 * 
 * A visualization of a human lifespan as a grid of weeks.
 * "Memento Mori" - Remember that you will die.
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { BirthDateInput } from './components/BirthDateInput';
import { LifeGrid } from './components/LifeGrid';
import { WeekTooltip } from './components/WeekTooltip';
import { EventPanel } from './components/EventPanel';
import { useBirthDate, useEvents } from './store/lifeCalendarStore';

function App() {
  const birthDate = useBirthDate();
  const events = useEvents();
  const [isEventPanelOpen, setIsEventPanelOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main className="container py-8">
        {!birthDate ? (
          <BirthDateInput />
        ) : (
          <>
            {/* Legend and Actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
              <div className="flex flex-wrap gap-4 text-sm">
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
              <button
                onClick={() => setIsEventPanelOpen(true)}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors text-sm font-medium"
              >
                Manage Events
              </button>
            </div>

            {/* Empty state hint - show when no events */}
            {events.length === 0 && !hintDismissed && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--cell-current)]/10 border border-[var(--cell-current)]/20 flex items-center justify-between gap-4 no-print">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  💡 <strong>Tip:</strong> Click any week to add your first life event
                </p>
                <button
                  onClick={() => setHintDismissed(true)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm"
                  aria-label="Dismiss hint"
                >
                  ✕
                </button>
              </div>
            )}

            {/* The Grid */}
            <LifeGrid />
          </>
        )}
      </main>

      {/* Singleton Tooltip */}
      <WeekTooltip />

      {/* Event Management Panel - for bulk event management */}
      <EventPanel
        isOpen={isEventPanelOpen}
        onClose={() => setIsEventPanelOpen(false)}
      />

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
