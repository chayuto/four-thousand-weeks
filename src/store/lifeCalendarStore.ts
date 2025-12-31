/**
 * Zustand store for Life Calendar state management
 * 
 * Following the research recommendations:
 * - Uses Zustand for granular subscriptions (avoids re-render cascade)
 * - Includes persistence middleware with custom hydration for Date objects
 * - Provides transient access for utility functions
 */

import { create } from 'zustand';
import { persist, type StateStorage, createJSONStorage } from 'zustand/middleware';
import type { LifeEra, LifeEvent, WeekData } from '@/types';
import { WEEKS_PER_YEAR, DEFAULT_LIFE_EXPECTANCY } from '@/types';
import { getWeekRange, getWeekIndex, weekIndexToPosition, isWeekPast, isCurrentWeek, isEraActiveInWeek } from '@/lib/dateUtils';
import { exportCalendarData, importCalendarData, downloadFile } from '@/lib/importExport';

interface LifeCalendarState {
    // User configuration
    birthDate: Date | null;
    lifeExpectancy: number;
    eras: LifeEra[];
    events: LifeEvent[];

    // Computed data (pre-calculated for O(1) lookups)
    weekMap: Map<number, { eraIds: string[]; eventIds: string[] }>;

    // UI state
    hoveredWeekIndex: number | null;
    selectedWeekIndex: number | null;

    // Actions
    setBirthDate: (date: Date) => void;
    setLifeExpectancy: (years: number) => void;
    addEra: (era: LifeEra) => void;
    updateEra: (id: string, updates: Partial<LifeEra>) => void;
    removeEra: (id: string) => void;
    addEvent: (event: LifeEvent) => void;
    updateEvent: (id: string, updates: Partial<LifeEvent>) => void;
    removeEvent: (id: string) => void;
    setHoveredWeek: (index: number | null) => void;
    setSelectedWeek: (index: number | null) => void;

    // Import/Export actions
    exportData: () => void;
    importData: (json: string) => { success: boolean; error?: string };
    clearAllData: () => void;

    // Computed getters
    getWeekData: (weekIndex: number) => WeekData | null;
    getTotalWeeks: () => number;

    // Internal
    _recomputeWeekMap: () => void;
}

/**
 * Custom storage adapter that handles Date object hydration
 */
const customStorage: StateStorage = {
    getItem: (name: string): string | null => {
        const raw = localStorage.getItem(name);
        if (!raw) return null;

        // Parse with reviver to convert ISO date strings back to Date objects
        try {
            const parsed = JSON.parse(raw, (_key: string, value: unknown) => {
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
                return value;
            });
            return JSON.stringify(parsed);
        } catch {
            return raw;
        }
    },
    setItem: (name: string, value: string): void => {
        localStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
        localStorage.removeItem(name);
    },
};

export const useLifeCalendarStore = create<LifeCalendarState>()(
    persist(
        (set, get) => ({
            // Initial state
            birthDate: null,
            lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
            eras: [],
            events: [],
            weekMap: new Map(),
            hoveredWeekIndex: null,
            selectedWeekIndex: null,

            // Actions
            setBirthDate: (date) => {
                set({ birthDate: date });
                get()._recomputeWeekMap();
            },

            setLifeExpectancy: (years) => {
                set({ lifeExpectancy: years });
                get()._recomputeWeekMap();
            },

            addEra: (era) => {
                set((state) => ({ eras: [...state.eras, era] }));
                get()._recomputeWeekMap();
            },

            updateEra: (id, updates) => {
                set((state) => ({
                    eras: state.eras.map((era) => (era.id === id ? { ...era, ...updates } : era)),
                }));
                get()._recomputeWeekMap();
            },

            removeEra: (id) => {
                set((state) => ({ eras: state.eras.filter((era) => era.id !== id) }));
                get()._recomputeWeekMap();
            },

            addEvent: (event) => {
                set((state) => ({ events: [...state.events, event] }));
                get()._recomputeWeekMap();
            },

            updateEvent: (id, updates) => {
                set((state) => ({
                    events: state.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
                }));
                get()._recomputeWeekMap();
            },

            removeEvent: (id) => {
                set((state) => ({ events: state.events.filter((event) => event.id !== id) }));
                get()._recomputeWeekMap();
            },

            setHoveredWeek: (index) => set({ hoveredWeekIndex: index }),
            setSelectedWeek: (index) => set({ selectedWeekIndex: index }),

            // Import/Export actions
            exportData: () => {
                const { birthDate, lifeExpectancy, eras, events } = get();
                const json = exportCalendarData({ birthDate, lifeExpectancy, eras, events });
                const filename = `life-calendar-${new Date().toISOString().split('T')[0]}.json`;
                downloadFile(json, filename);
            },

            importData: (json) => {
                const result = importCalendarData(json);
                if (result.success && result.data) {
                    set({
                        birthDate: result.data.birthDate,
                        lifeExpectancy: result.data.lifeExpectancy,
                        eras: result.data.eras,
                        events: result.data.events,
                    });
                    get()._recomputeWeekMap();
                    return { success: true };
                }
                return { success: false, error: result.error };
            },

            clearAllData: () => {
                set({
                    birthDate: null,
                    lifeExpectancy: DEFAULT_LIFE_EXPECTANCY,
                    eras: [],
                    events: [],
                    weekMap: new Map(),
                });
            },

            // Computed getters
            getWeekData: (weekIndex) => {
                const { birthDate, lifeExpectancy, weekMap } = get();
                if (!birthDate) return null;

                const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;
                if (weekIndex < 0 || weekIndex >= totalWeeks) return null;

                const { year, weekOfYear } = weekIndexToPosition(weekIndex);
                const { start, end } = getWeekRange(birthDate, weekIndex);
                const weekData = weekMap.get(weekIndex);

                return {
                    index: weekIndex,
                    year,
                    weekOfYear,
                    startDate: start,
                    endDate: end,
                    isPast: isWeekPast(end),
                    isCurrentWeek: isCurrentWeek(start, end),
                    activeEras: weekData?.eraIds ?? [],
                    events: weekData?.eventIds ?? [],
                };
            },

            getTotalWeeks: () => {
                const { lifeExpectancy } = get();
                return lifeExpectancy * WEEKS_PER_YEAR;
            },

            // Pre-compute week map for O(1) lookups during rendering
            _recomputeWeekMap: () => {
                const { birthDate, lifeExpectancy, eras, events } = get();
                if (!birthDate) {
                    set({ weekMap: new Map() });
                    return;
                }

                const newMap = new Map<number, { eraIds: string[]; eventIds: string[] }>();
                const totalWeeks = lifeExpectancy * WEEKS_PER_YEAR;

                // Process eras
                for (const era of eras) {
                    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
                        const { start, end } = getWeekRange(birthDate, weekIndex);

                        if (isEraActiveInWeek(era.startDate, era.endDate, start, end)) {
                            const existing = newMap.get(weekIndex) ?? { eraIds: [], eventIds: [] };
                            existing.eraIds.push(era.id);
                            newMap.set(weekIndex, existing);
                        }
                    }
                }

                // Process events (handle both point-in-time and period events)
                for (const event of events) {
                    if (event.endDate) {
                        // Period event: spans multiple weeks
                        const startIndex = Math.max(0, getWeekIndex(birthDate, event.date));
                        const endIndex = Math.min(totalWeeks - 1, getWeekIndex(birthDate, event.endDate));
                        for (let weekIndex = startIndex; weekIndex <= endIndex; weekIndex++) {
                            const existing = newMap.get(weekIndex) ?? { eraIds: [], eventIds: [] };
                            if (!existing.eventIds.includes(event.id)) {
                                existing.eventIds.push(event.id);
                            }
                            newMap.set(weekIndex, existing);
                        }
                    } else {
                        // Point-in-time event: single week
                        const weekIndex = getWeekIndex(birthDate, event.date);
                        if (weekIndex >= 0 && weekIndex < totalWeeks) {
                            const existing = newMap.get(weekIndex) ?? { eraIds: [], eventIds: [] };
                            existing.eventIds.push(event.id);
                            newMap.set(weekIndex, existing);
                        }
                    }
                }

                set({ weekMap: newMap });
            },
        }),
        {
            name: 'life-calendar-storage',
            storage: createJSONStorage(() => customStorage),
            partialize: (state) => ({
                birthDate: state.birthDate,
                lifeExpectancy: state.lifeExpectancy,
                eras: state.eras,
                events: state.events,
            }),
            onRehydrateStorage: () => (state) => {
                // Recompute week map after hydration
                state?._recomputeWeekMap();
            },
        }
    )
);

/**
 * Selector hooks for granular subscriptions
 * Only re-render when the specific slice changes
 */
export const useBirthDate = () => useLifeCalendarStore((state) => state.birthDate);
export const useLifeExpectancy = () => useLifeCalendarStore((state) => state.lifeExpectancy);
export const useEras = () => useLifeCalendarStore((state) => state.eras);
export const useEvents = () => useLifeCalendarStore((state) => state.events);
export const useHoveredWeek = () => useLifeCalendarStore((state) => state.hoveredWeekIndex);
export const useSelectedWeek = () => useLifeCalendarStore((state) => state.selectedWeekIndex);
