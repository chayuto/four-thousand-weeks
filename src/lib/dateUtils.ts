/**
 * Date utility functions for the Life Calendar
 * 
 * Following the research document's recommendation:
 * - Use date-fns for modular, tree-shakeable date operations
 * - Encapsulate all date logic here to allow future migration to Temporal API
 * - Use the "Life Year" model where Week 0 starts on birthday
 */

import { addWeeks, differenceInWeeks, isWithinInterval, startOfDay, isAfter, isBefore, isSameDay } from 'date-fns';
import { WEEKS_PER_YEAR } from '@/types';

/**
 * Calculates the start and end date for a specific week of life.
 * Using the "Birthday Week" model for visual consistency.
 * 
 * @param birthDate The user's date of birth
 * @param weekIndex The total week index (0 - ~4160)
 * @returns Object with start and end dates for the week
 */
export const getWeekRange = (birthDate: Date, weekIndex: number) => {
    const start = addWeeks(startOfDay(birthDate), weekIndex);
    const end = addWeeks(start, 1);
    return { start, end };
};

/**
 * Calculates which week index a given date falls into.
 * 
 * @param birthDate The user's date of birth
 * @param date The date to check
 * @returns The week index (0-based)
 */
export const getWeekIndex = (birthDate: Date, date: Date): number => {
    return differenceInWeeks(startOfDay(date), startOfDay(birthDate));
};

/**
 * Converts a week index to year and week-of-year.
 * 
 * @param weekIndex The total week index
 * @returns Object with year (row) and weekOfYear (column)
 */
export const weekIndexToPosition = (weekIndex: number): { year: number; weekOfYear: number } => {
    return {
        year: Math.floor(weekIndex / WEEKS_PER_YEAR),
        weekOfYear: weekIndex % WEEKS_PER_YEAR,
    };
};

/**
 * Converts year and week-of-year to a week index.
 * 
 * @param year The year (0-based age)
 * @param weekOfYear The week within the year (0-51)
 * @returns The total week index
 */
export const positionToWeekIndex = (year: number, weekOfYear: number): number => {
    return year * WEEKS_PER_YEAR + weekOfYear;
};

/**
 * Determines if a date falls within a given week.
 * 
 * @param date The date to check
 * @param weekStart The start of the week
 * @param weekEnd The end of the week
 * @returns True if the date is within the week
 */
export const isDateInWeek = (date: Date, weekStart: Date, weekEnd: Date): boolean => {
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
};

/**
 * Checks if a week is in the past relative to today.
 * 
 * @param weekEnd The end date of the week
 * @returns True if the week has ended
 */
export const isWeekPast = (weekEnd: Date): boolean => {
    return isBefore(weekEnd, startOfDay(new Date()));
};

/**
 * Checks if today falls within a week.
 * 
 * @param weekStart The start of the week
 * @param weekEnd The end of the week
 * @returns True if today is within the week
 */
export const isCurrentWeek = (weekStart: Date, weekEnd: Date): boolean => {
    const today = startOfDay(new Date());
    return isWithinInterval(today, { start: weekStart, end: weekEnd }) ||
        isSameDay(today, weekStart) ||
        isSameDay(today, weekEnd);
};

/**
 * Checks if an era is active during a given week.
 * 
 * @param eraStart Era start date
 * @param eraEnd Era end date (undefined means ongoing)
 * @param weekStart Week start date
 * @param weekEnd Week end date
 * @returns True if the era overlaps with the week
 */
export const isEraActiveInWeek = (
    eraStart: Date,
    eraEnd: Date | undefined,
    weekStart: Date,
    weekEnd: Date
): boolean => {
    // Era hasn't started yet
    if (isAfter(eraStart, weekEnd)) {
        return false;
    }

    // Era has ended before this week
    if (eraEnd && isBefore(eraEnd, weekStart)) {
        return false;
    }

    return true;
};

/**
 * Generates an array of week indices for a given era.
 * Used for pre-computing the Week Map for O(1) lookups.
 * 
 * @param birthDate The user's date of birth
 * @param eraStart Era start date
 * @param eraEnd Era end date (undefined means ongoing to today)
 * @returns Array of week indices covered by this era
 */
export const getWeekIndicesForEra = (
    birthDate: Date,
    eraStart: Date,
    eraEnd: Date | undefined
): number[] => {
    const startIndex = Math.max(0, getWeekIndex(birthDate, eraStart));
    const endDate = eraEnd ?? new Date();
    const endIndex = getWeekIndex(birthDate, endDate);

    const indices: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
        indices.push(i);
    }

    return indices;
};
