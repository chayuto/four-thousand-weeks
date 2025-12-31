/**
 * Import/Export utilities for Life Calendar data
 * 
 * Provides JSON export/import with Zod validation
 */

import { safeParseExportData, type UserConfigOutput } from './schemas';

/**
 * Persisted state structure (matches Zustand partialize)
 */
interface PersistedState {
    birthDate: Date | null;
    lifeExpectancy: number;
    eras: unknown[];
    events: unknown[];
}

/**
 * Result of import operation
 */
interface ImportResult {
    success: boolean;
    data?: UserConfigOutput;
    error?: string;
}

/**
 * Export calendar data to JSON string
 * @param state The persisted state from Zustand store
 * @returns Formatted JSON string ready for download
 */
export const exportCalendarData = (state: PersistedState): string => {
    const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: {
            birthDate: state.birthDate,
            lifeExpectancy: state.lifeExpectancy,
            eras: state.eras,
            events: state.events,
        },
    };
    return JSON.stringify(exportData, null, 2);
};

/**
 * Import calendar data from JSON string
 * @param json The JSON string to parse and validate
 * @returns ImportResult with success status and either data or error
 */
export const importCalendarData = (json: string): ImportResult => {
    try {
        const parsed = JSON.parse(json);
        const result = safeParseExportData(parsed);

        if (!result.success) {
            // Format Zod errors into readable message
            const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            return {
                success: false,
                error: `Validation failed:\n${errors.join('\n')}`,
            };
        }

        return {
            success: true,
            data: result.data.data,
        };
    } catch (error) {
        if (error instanceof SyntaxError) {
            return {
                success: false,
                error: 'Invalid JSON format. Please check the file contents.',
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
};

/**
 * Trigger a file download in the browser
 * @param content The file content
 * @param filename The filename for download
 * @param mimeType The MIME type of the file
 */
export const downloadFile = (content: string, filename: string, mimeType = 'application/json'): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Read a file as text
 * @param file The File object to read
 * @returns Promise resolving to file contents as string
 */
export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};
