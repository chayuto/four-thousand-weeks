/**
 * Header Component
 * 
 * Application header with title, stats, and actions.
 * Includes birthday editing functionality.
 */

import { useState, type FormEvent } from 'react';
import { useBirthDate, useLifeExpectancy, useLifeCalendarStore } from '@/store/lifeCalendarStore';
import { differenceInWeeks, format } from 'date-fns';
import { WEEKS_PER_YEAR } from '@/types';

export const Header = () => {
    const birthDate = useBirthDate();
    const lifeExpectancy = useLifeExpectancy();
    const setBirthDate = useLifeCalendarStore((state) => state.setBirthDate);

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    // Calculate stats
    const today = new Date();
    const weeksLived = birthDate ? differenceInWeeks(today, birthDate) : 0;
    const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    const percentLived = birthDate ? ((weeksLived / totalWeeks) * 100).toFixed(1) : 0;

    const handleStartEdit = () => {
        if (birthDate) {
            setEditValue(format(birthDate, 'yyyy-MM-dd'));
        }
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditValue('');
    };

    const handleSaveEdit = (e: FormEvent) => {
        e.preventDefault();
        if (editValue) {
            setBirthDate(new Date(editValue));
            setIsEditing(false);
            setEditValue('');
        }
    };

    return (
        <header className="py-6 border-b border-[var(--color-border)] no-print">
            <div className="container">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="title">Four Thousand Weeks</h1>
                        <div className="flex items-center gap-2">
                            <p className="subtitle">Your life in weeks • Memento Mori</p>
                            {birthDate && !isEditing && (
                                <button
                                    onClick={handleStartEdit}
                                    className="p-1 rounded hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                    aria-label="Change birthday"
                                    title="Change birthday"
                                >
                                    <EditIcon />
                                </button>
                            )}
                        </div>
                        {isEditing && (
                            <form onSubmit={handleSaveEdit} className="mt-2 flex items-center gap-2">
                                <label className="text-sm text-[var(--color-text-secondary)]">Birthday:</label>
                                <input
                                    type="date"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)]"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-1 rounded bg-[var(--cell-current)] text-black text-sm font-medium hover:opacity-90"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-sm hover:bg-[var(--color-surface-elevated)]"
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
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

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
