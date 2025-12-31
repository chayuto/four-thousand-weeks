/**
 * WeekTooltip Component
 * 
 * A singleton tooltip that follows the hovered week.
 * Following research recommendations:
 * - Only ONE tooltip component in the entire app (not 4,000)
 * - Positioned based on hovered week coordinates
 * - Uses event delegation via global state
 */

import { useEffect, useState, useRef } from 'react';
import { useLifeCalendarStore, useHoveredWeek, useEras, useEvents } from '@/store/lifeCalendarStore';
import { format } from 'date-fns';

export const WeekTooltip = () => {
    const hoveredWeekIndex = useHoveredWeek();
    const getWeekData = useLifeCalendarStore((state) => state.getWeekData);
    const eras = useEras();
    const events = useEvents();

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Track mouse position for tooltip placement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX + 15, y: e.clientY + 15 });
        };

        if (hoveredWeekIndex !== null) {
            document.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [hoveredWeekIndex]);

    if (hoveredWeekIndex === null) return null;

    const weekData = getWeekData(hoveredWeekIndex);
    if (!weekData) return null;

    // Get era and event details
    const activeEras = weekData.activeEras
        .map((id) => eras.find((era) => era.id === id))
        .filter(Boolean);

    const weekEvents = weekData.events
        .map((id) => events.find((event) => event.id === id))
        .filter(Boolean);

    return (
        <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none no-print"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translateY(-100%)',
            }}
        >
            <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl p-3 min-w-[200px]">
                {/* Week header */}
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                        Year {weekData.year + 1}, Week {weekData.weekOfYear + 1}
                    </span>
                    {weekData.isCurrentWeek && (
                        <span className="text-xs bg-[var(--cell-current)] text-black px-2 py-0.5 rounded-full">
                            Now
                        </span>
                    )}
                </div>

                {/* Date range */}
                <div className="text-sm text-[var(--color-text-secondary)] mb-2">
                    {format(weekData.startDate, 'MMM d, yyyy')} – {format(weekData.endDate, 'MMM d, yyyy')}
                </div>

                {/* Status */}
                <div className="text-sm">
                    {weekData.isPast ? (
                        <span className="text-[var(--color-text-muted)]">Lived</span>
                    ) : weekData.isCurrentWeek ? (
                        <span className="text-[var(--cell-current)]">Current week</span>
                    ) : (
                        <span className="text-[var(--color-text-muted)]">Future</span>
                    )}
                </div>

                {/* Active eras */}
                {activeEras.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Active Eras</div>
                        {activeEras.map((era) => era && (
                            <div key={era.id} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: era.color }}
                                />
                                <span>{era.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Events */}
                {weekEvents.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Events</div>
                        {weekEvents.map((event) => event && (
                            <div key={event.id} className="flex items-center gap-2 text-sm">
                                <span>•</span>
                                <span>{event.title}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
