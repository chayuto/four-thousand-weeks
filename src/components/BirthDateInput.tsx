/**
 * BirthDateInput Component
 * 
 * Simple form for entering the user's birth date to initialize the calendar.
 */

import { useState, type FormEvent } from 'react';
import { useLifeCalendarStore } from '@/store/lifeCalendarStore';

export const BirthDateInput = () => {
    const [dateValue, setDateValue] = useState('');
    const setBirthDate = useLifeCalendarStore((state) => state.setBirthDate);
    const birthDate = useLifeCalendarStore((state) => state.birthDate);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (dateValue) {
            setBirthDate(new Date(dateValue));
        }
    };

    if (birthDate) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-[300px]">
            <form onSubmit={handleSubmit} className="text-center">
                <h2 className="text-2xl font-bold mb-4">When were you born?</h2>
                <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
                    Enter your birth date to visualize your life as a grid of weeks.
                    Each cell represents one week of your approximately 4,000-week lifespan.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <input
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)]"
                        required
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg bg-[var(--cell-current)] text-black font-semibold hover:opacity-90 transition-opacity"
                    >
                        Start
                    </button>
                </div>
            </form>
        </div>
    );
};
