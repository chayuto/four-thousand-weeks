/**
 * Zod schemas for runtime validation
 * 
 * Critical for:
 * - Validating user data from localStorage on hydration
 * - Validating imported JSON files
 * - Ensuring Date objects are properly re-hydrated from ISO strings
 */

import { z } from 'zod';

/**
 * Hex color validation regex
 */
const HexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color');

/**
 * Era category enum
 */
export const EraCategorySchema = z.enum(['work', 'education', 'location', 'relationship', 'health', 'other']);

/**
 * Life Era schema
 * Uses z.coerce.date() to automatically parse ISO strings to Date objects
 */
export const LifeEraSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    color: HexColorSchema,
    category: EraCategorySchema,
});

/**
 * Life Event schema
 * Supports both point-in-time and period events
 */
export const LifeEventSchema = z.object({
    id: z.string().uuid(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    color: HexColorSchema.optional(),
});

/**
 * User configuration schema
 */
export const UserConfigSchema = z.object({
    birthDate: z.coerce.date(),
    lifeExpectancy: z.number().int().min(50).max(120).default(80),
    eras: z.array(LifeEraSchema).default([]),
    events: z.array(LifeEventSchema).default([]),
});

/**
 * Export data schema - used for import/export functionality
 */
export const ExportDataSchema = z.object({
    version: z.literal(1),
    exportedAt: z.coerce.date(),
    data: UserConfigSchema,
});

/**
 * Type inference from Zod schemas
 */
export type LifeEraInput = z.input<typeof LifeEraSchema>;
export type LifeEraOutput = z.output<typeof LifeEraSchema>;
export type LifeEventInput = z.input<typeof LifeEventSchema>;
export type LifeEventOutput = z.output<typeof LifeEventSchema>;
export type UserConfigInput = z.input<typeof UserConfigSchema>;
export type UserConfigOutput = z.output<typeof UserConfigSchema>;
export type ExportDataInput = z.input<typeof ExportDataSchema>;
export type ExportDataOutput = z.output<typeof ExportDataSchema>;

/**
 * Parse and validate user config data
 * Throws ZodError if validation fails
 */
export const parseUserConfig = (data: unknown): UserConfigOutput => {
    return UserConfigSchema.parse(data);
};

/**
 * Safe parse that returns result object instead of throwing
 */
export const safeParseUserConfig = (data: unknown) => {
    return UserConfigSchema.safeParse(data);
};

/**
 * Parse and validate export data
 */
export const parseExportData = (data: unknown): ExportDataOutput => {
    return ExportDataSchema.parse(data);
};

/**
 * Safe parse for export data
 */
export const safeParseExportData = (data: unknown) => {
    return ExportDataSchema.safeParse(data);
};
