/**
 * LifeGrid Component
 * 
 * The main grid container that renders all 4,000+ week cells.
 * Renders by year rows with inline expansion for selected weeks.
 */

import { useCallback, useMemo, useRef, useEffect, type MouseEvent, type KeyboardEvent, type ReactElement } from 'react';
import { WeekCell } from './WeekCell';
import { WeekDetailRow } from './WeekDetailRow';
import { useLifeCalendarStore, useEras, useEvents, useBirthDate, useLifeExpectancy, useSelectedWeek } from '@/store/lifeCalendarStore';
import { WEEKS_PER_YEAR } from '@/types';
import type { LifeEra, LifeEvent } from '@/types';

export const LifeGrid = () => {
    const birthDate = useBirthDate();
    const lifeExpectancy = useLifeExpectancy();
    const eras = useEras();
    const events = useEvents();
    const getWeekData = useLifeCalendarStore((state) => state.getWeekData);
    const setHoveredWeek = useLifeCalendarStore((state) => state.setHoveredWeek);
    const setSelectedWeek = useLifeCalendarStore((state) => state.setSelectedWeek);
    const selectedWeekIndex = useSelectedWeek();

    // Calculate which year row the selected week is in
    const selectedYear = selectedWeekIndex !== null
        ? Math.floor(selectedWeekIndex / WEEKS_PER_YEAR)
        : null;

    // Pre-compute era lookup map once
    const eraMap = useMemo(() => {
        const map = new Map<string, LifeEra>();
        for (const era of eras) {
            map.set(era.id, era);
        }
        return map;
    }, [eras]);

    // Pre-compute event lookup map once
    const eventMap = useMemo(() => {
        const map = new Map<string, LifeEvent>();
        for (const event of events) {
            map.set(event.id, event);
        }
        return map;
    }, [events]);

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
            const clickedIndex = parseInt(weekIndex, 10);
            // Toggle selection: click same week to close, different week to switch
            if (clickedIndex === selectedWeekIndex) {
                setSelectedWeek(null);
            } else {
                setSelectedWeek(clickedIndex);
            }
        }
    }, [setSelectedWeek, selectedWeekIndex]);

    const handleCloseDetail = useCallback(() => {
        setSelectedWeek(null);
    }, [setSelectedWeek]);

    // Ref for grid container
    const gridRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current week on mount
    useEffect(() => {
        if (birthDate && gridRef.current) {
            // Small delay to ensure grid is rendered
            const timer = setTimeout(() => {
                const currentWeekCell = gridRef.current?.querySelector('.week-cell.current');
                if (currentWeekCell) {
                    currentWeekCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [birthDate]);

    // Keyboard navigation handler
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const weekIndex = target.getAttribute('data-week-index');

        if (weekIndex === null) return;

        const currentIndex = parseInt(weekIndex, 10);
        let nextIndex: number | null = null;
        const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;

        switch (event.key) {
            case 'ArrowRight':
                nextIndex = Math.min(currentIndex + 1, totalWeeks - 1);
                event.preventDefault();
                break;
            case 'ArrowLeft':
                nextIndex = Math.max(currentIndex - 1, 0);
                event.preventDefault();
                break;
            case 'ArrowDown':
                nextIndex = Math.min(currentIndex + WEEKS_PER_YEAR, totalWeeks - 1);
                event.preventDefault();
                break;
            case 'ArrowUp':
                nextIndex = Math.max(currentIndex - WEEKS_PER_YEAR, 0);
                event.preventDefault();
                break;
            case 'Enter':
            case ' ':
                // Toggle selection on Enter/Space
                if (currentIndex === selectedWeekIndex) {
                    setSelectedWeek(null);
                } else {
                    setSelectedWeek(currentIndex);
                }
                event.preventDefault();
                return;
            case 'Escape':
                setSelectedWeek(null);
                event.preventDefault();
                return;
        }

        // Focus the next cell
        if (nextIndex !== null && gridRef.current) {
            const nextCell = gridRef.current.querySelector(`[data-week-index="${nextIndex}"]`) as HTMLElement;
            if (nextCell) {
                nextCell.focus();
            }
        }
    }, [lifeExpectancy, selectedWeekIndex, setSelectedWeek]);

    // Generate week cells organized by year rows with potential expansion
    const gridContent = useMemo(() => {
        if (!birthDate) return null;

        const content: ReactElement[] = [];

        for (let year = 0; year < lifeExpectancy; year++) {
            // Add year label at start of each row (show label at decade intervals)
            if (year % 10 === 0) {
                content.push(
                    <div key={`label-${year}`} className="year-label">
                        {year}
                    </div>
                );
            } else {
                content.push(
                    <div key={`label-${year}`} className="year-label-empty" />
                );
            }

            // Render all 52 weeks for this year
            for (let weekOfYear = 0; weekOfYear < WEEKS_PER_YEAR; weekOfYear++) {
                const weekIndex = year * WEEKS_PER_YEAR + weekOfYear;
                const weekData = getWeekData(weekIndex);
                content.push(
                    <WeekCell
                        key={weekIndex}
                        weekIndex={weekIndex}
                        weekData={weekData}
                        eras={eraMap}
                        events={eventMap}
                        isSelected={weekIndex === selectedWeekIndex}
                    />
                );
            }

            // If this year contains the selected week, insert expansion row after it
            if (selectedYear === year && selectedWeekIndex !== null) {
                const selectedWeekData = getWeekData(selectedWeekIndex);
                if (selectedWeekData) {
                    content.push(
                        <WeekDetailRow
                            key={`detail-${year}`}
                            weekData={selectedWeekData}
                            onClose={handleCloseDetail}
                        />
                    );
                }
            }
        }

        return content;
    }, [birthDate, lifeExpectancy, getWeekData, eraMap, eventMap, selectedWeekIndex, selectedYear, handleCloseDetail]);

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
            ref={gridRef}
            className="life-grid"
            role="grid"
            aria-label={`Life calendar grid showing ${lifeExpectancy * WEEKS_PER_YEAR} weeks`}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            {gridContent}
        </div>
    );
};

