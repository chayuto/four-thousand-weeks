/**
 * WeekCell Component
 * 
 * A lightweight, memoized component for rendering a single week in the grid.
 * Following research recommendations:
 * - Keep extremely simple (just a div with background color)
 * - Use React.memo to prevent unnecessary re-renders
 * - No individual event listeners (handled via event delegation at Grid level)
 */

import { memo, type CSSProperties } from 'react';
import type { WeekData, LifeEra } from '@/types';

interface WeekCellProps {
    weekIndex: number;
    weekData: WeekData | null;
    eras: Map<string, LifeEra>;
}

/**
 * Generates a CSS gradient string for overlapping eras.
 * Uses diagonal stripes to visualize multiple eras in one cell.
 */
const generateEraGradient = (eraColors: string[]): string => {
    if (eraColors.length === 0) return '';
    if (eraColors.length === 1) return eraColors[0] ?? '';

    // Create diagonal stripe pattern for overlap
    const segmentPercent = 100 / eraColors.length;
    const gradientStops = eraColors.map((color, index) => {
        const start = index * segmentPercent;
        const end = (index + 1) * segmentPercent;
        return `${color} ${start}%, ${color} ${end}%`;
    }).join(', ');

    return `linear-gradient(135deg, ${gradientStops})`;
};

/**
 * Determines the base class for the week cell based on its state.
 */
const getCellClassName = (weekData: WeekData | null): string => {
    const classes = ['week-cell'];

    if (!weekData) {
        classes.push('future');
        return classes.join(' ');
    }

    if (weekData.isCurrentWeek) {
        classes.push('current');
    } else if (weekData.isPast) {
        classes.push('past');
    } else {
        classes.push('future');
    }

    if (weekData.events.length > 0) {
        classes.push('has-event');
    }

    return classes.join(' ');
};

const WeekCellComponent = ({ weekIndex, weekData, eras }: WeekCellProps) => {
    // Get era colors for this week
    const eraColors: string[] = [];
    if (weekData?.activeEras) {
        for (const eraId of weekData.activeEras) {
            const era = eras.get(eraId);
            if (era) {
                eraColors.push(era.color);
            }
        }
    }

    // Build inline styles for era colors
    const style: CSSProperties = {};
    if (eraColors.length > 0) {
        const background = generateEraGradient(eraColors);
        style.background = background;
    }

    return (
        <div
            className={getCellClassName(weekData)}
            data-week-index={weekIndex}
            data-year={weekData?.year}
            data-week-of-year={weekData?.weekOfYear}
            style={style}
            role="gridcell"
            aria-label={
                weekData
                    ? `Week ${weekData.weekOfYear + 1} of year ${weekData.year + 1}${weekData.isCurrentWeek ? ' (current week)' : ''}`
                    : `Week ${weekIndex}`
            }
            tabIndex={-1}
        />
    );
};

/**
 * Memoized WeekCell to prevent re-renders when parent updates.
 * Only re-renders if weekIndex or weekData changes.
 */
export const WeekCell = memo(WeekCellComponent, (prevProps, nextProps) => {
    // Deep comparison for performance
    if (prevProps.weekIndex !== nextProps.weekIndex) return false;
    if (prevProps.weekData?.isPast !== nextProps.weekData?.isPast) return false;
    if (prevProps.weekData?.isCurrentWeek !== nextProps.weekData?.isCurrentWeek) return false;
    if (prevProps.weekData?.activeEras.length !== nextProps.weekData?.activeEras.length) return false;
    if (prevProps.weekData?.events.length !== nextProps.weekData?.events.length) return false;
    return true;
});

WeekCell.displayName = 'WeekCell';
