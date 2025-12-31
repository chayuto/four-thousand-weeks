/**
 * LifeGrid Component
 * 
 * The main grid container that renders all 4,000+ week cells.
 * Following research recommendations:
 * - Uses CSS Grid with 52 columns
 * - Implements event delegation (single listener on container)
 * - Pre-computes era lookup map for O(1) access
 */

import { useCallback, useMemo, type MouseEvent, type ReactElement } from 'react';
import { WeekCell } from './WeekCell';
import { useLifeCalendarStore, useEras, useBirthDate, useLifeExpectancy } from '@/store/lifeCalendarStore';
import { WEEKS_PER_YEAR } from '@/types';
import type { LifeEra } from '@/types';

export const LifeGrid = () => {
    const birthDate = useBirthDate();
    const lifeExpectancy = useLifeExpectancy();
    const eras = useEras();
    const getWeekData = useLifeCalendarStore((state) => state.getWeekData);
    const setHoveredWeek = useLifeCalendarStore((state) => state.setHoveredWeek);
    const setSelectedWeek = useLifeCalendarStore((state) => state.setSelectedWeek);

    // Pre-compute era lookup map once
    const eraMap = useMemo(() => {
        const map = new Map<string, LifeEra>();
        for (const era of eras) {
            map.set(era.id, era);
        }
        return map;
    }, [eras]);

    // Calculate total weeks
    const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;

    // Event delegation handlers (singleton pattern)
    const handleMouseOver = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const weekIndex = target.getAttribute('data-week-index');
        if (weekIndex !== null) {
            setHoveredWeek(parseInt(weekIndex, 10));
        }
    }, [setHoveredWeek]);

    const handleMouseLeave = useCallback(() => {
        setHoveredWeek(null);
    }, [setHoveredWeek]);

    const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const weekIndex = target.getAttribute('data-week-index');
        if (weekIndex !== null) {
            setSelectedWeek(parseInt(weekIndex, 10));
        }
    }, [setSelectedWeek]);

    // Generate week cells
    const weekCells = useMemo(() => {
        if (!birthDate) return null;

        const cells: ReactElement[] = [];

        for (let i = 0; i < totalWeeks; i++) {
            const weekData = getWeekData(i);
            cells.push(
                <WeekCell
                    key={i}
                    weekIndex={i}
                    weekData={weekData}
                    eras={eraMap}
                />
            );
        }

        return cells;
    }, [birthDate, totalWeeks, getWeekData, eraMap]);

    if (!birthDate) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to Four Thousand Weeks</h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Enter your birth date to visualize your life.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="life-grid"
            role="grid"
            aria-label={`Life calendar grid showing ${totalWeeks} weeks`}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {weekCells}
        </div>
    );
};
