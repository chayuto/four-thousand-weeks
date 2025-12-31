/**
 * Type definitions for the Life Calendar application
 * 
 * Following the research document's data model:
 * - Events: Point-in-time occurrences (e.g., "Got Married", "Graduated")
 * - Eras: Ranges of time (e.g., "High School", "Living in London")
 */

export type EraCategory = 'work' | 'education' | 'location' | 'relationship' | 'health' | 'other';

/**
 * Represents a range of time in the user's life
 * Eras can overlap (e.g., "Living in London" while "Working at TechCorp")
 */
export interface LifeEra {
    id: string;
    title: string;
    startDate: Date;
    endDate?: Date; // Optional for ongoing eras
    color: string; // Hex color (e.g., "#FF5733")
    category: EraCategory;
}

/**
 * Represents a life event - can be point-in-time or a period (range)
 * - Point-in-time: only `date` is set (e.g., "Graduated University")
 * - Period: both `date` and `endDate` are set (e.g., "Summer Internship")
 */
export interface LifeEvent {
    id: string;
    date: Date;
    endDate?: Date; // Optional: makes this a period event
    title: string;
    description?: string;
    color?: string; // Optional hex color (defaults to accent)
}

/**
 * User configuration and data
 */
export interface UserConfig {
    birthDate: Date;
    lifeExpectancy: number; // In years (default: 80)
    eras: LifeEra[];
    events: LifeEvent[];
}

/**
 * Represents a single week in the grid
 * Pre-computed for O(1) lookup during rendering
 */
export interface WeekData {
    index: number; // 0-4160 (approximately)
    year: number; // 0-80 (age/row)
    weekOfYear: number; // 0-51 (column)
    startDate: Date;
    endDate: Date;
    isPast: boolean;
    isCurrentWeek: boolean;
    activeEras: string[]; // IDs of overlapping eras
    events: string[]; // IDs of events in this week
}

/**
 * Grid dimensions constants
 * Using the "Life Year" model: 52 columns per row, approximately 80 rows
 */
export const WEEKS_PER_YEAR = 52;
export const DEFAULT_LIFE_EXPECTANCY = 80;
export const TOTAL_WEEKS = WEEKS_PER_YEAR * DEFAULT_LIFE_EXPECTANCY; // 4,160
