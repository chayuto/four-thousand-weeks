/**
 * Header Component
 * 
 * Application header with title, stats, and actions.
 */

import { useBirthDate, useLifeExpectancy } from '@/store/lifeCalendarStore';
import { differenceInWeeks } from 'date-fns';
import { WEEKS_PER_YEAR } from '@/types';

export const Header = () => {
    const birthDate = useBirthDate();
    const lifeExpectancy = useLifeExpectancy();

    // Calculate stats
    const today = new Date();
    const weeksLived = birthDate ? differenceInWeeks(today, birthDate) : 0;
    const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentLived = birthDate ? ((weeksLived / totalWeeks) * 100).toFixed(1) : 0;

    return (
        <header className="py-6 border-b border-[var(--color-border)] no-print">
            <div className="container">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="title">Four Thousand Weeks</h1>
                        <p className="subtitle">Your life in weeks • Memento Mori</p>
                    </div>

                    {birthDate && (
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[var(--cell-past)]">{weeksLived.toLocaleString()}</div>
                                <div className="text-[var(--color-text-muted)]">weeks lived</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[var(--cell-current)]">{weeksRemaining.toLocaleString()}</div>
                                <div className="text-[var(--color-text-muted)]">weeks remaining</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{percentLived}%</div>
                                <div className="text-[var(--color-text-muted)]">of {lifeExpectancy} years</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
