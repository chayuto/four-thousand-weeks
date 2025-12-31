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
 * Represents a single point-in-time event
 */
export interface LifeEvent {
    id: string;
    date: Date;
    title: string;
    icon?: string;
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
