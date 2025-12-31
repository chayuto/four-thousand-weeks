/**
 * EventForm Component
 * 
 * Form for adding and editing life events.
 * Supports both point-in-time and period events.
 */

import { useState, type FormEvent } from 'react';
import { useLifeCalendarStore } from '@/store/lifeCalendarStore';
import type { LifeEvent } from '@/types';

interface EventFormProps {
    event?: LifeEvent; // If provided, we're editing
    onClose?: () => void;
}

const DEFAULT_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
];

export const EventForm = ({ event, onClose }: EventFormProps) => {
    const addEvent = useLifeCalendarStore((state) => state.addEvent);
    const updateEvent = useLifeCalendarStore((state) => state.updateEvent);

    const [title, setTitle] = useState(event?.title ?? '');
    const [date, setDate] = useState(
        event?.date ? formatDateForInput(event.date) : ''
    );
    const [isPeriod, setIsPeriod] = useState(!!event?.endDate);
    const [endDate, setEndDate] = useState(
        event?.endDate ? formatDateForInput(event.endDate) : ''
    );
    const [description, setDescription] = useState(event?.description ?? '');
    const [color, setColor] = useState(event?.color ?? '');

    const isEditing = !!event;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !date) return;

        const eventData: LifeEvent = {
            id: event?.id ?? crypto.randomUUID(),
            title: title.trim(),
            date: new Date(date),
            endDate: isPeriod && endDate ? new Date(endDate) : undefined,
            description: description.trim() || undefined,
            color: color || undefined,
        };

        if (isEditing) {
            updateEvent(event.id, eventData);
        } else {
            addEvent(eventData);
        }

        // Reset form
        setTitle('');
        setDate('');
        setIsPeriod(false);
        setEndDate('');
        setDescription('');
        setColor('');

        onClose?.();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label htmlFor="event-title" className="block text-sm font-medium mb-1">
                    Title
                </label>
                <input
                    id="event-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Graduated University"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)]"
                    required
                />
            </div>

            {/* Date */}
            <div>
                <label htmlFor="event-date" className="block text-sm font-medium mb-1">
                    {isPeriod ? 'Start Date' : 'Date'}
                </label>
                <input
                    id="event-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)]"
                    required
                />
            </div>

            {/* Period Toggle */}
            <div className="flex items-center gap-2">
                <input
                    id="is-period"
                    type="checkbox"
                    checked={isPeriod}
                    onChange={(e) => setIsPeriod(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-surface)]"
                />
                <label htmlFor="is-period" className="text-sm">
                    This is a period (spans multiple weeks)
                </label>
            </div>

            {/* End Date (if period) */}
            {isPeriod && (
                <div>
                    <label htmlFor="event-end-date" className="block text-sm font-medium mb-1">
                        End Date
                    </label>
                    <input
                        id="event-end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={date}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)]"
                        required={isPeriod}
                    />
                </div>
            )}

            {/* Description */}
            <div>
                <label htmlFor="event-description" className="block text-sm font-medium mb-1">
                    Description (optional)
                </label>
                <textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this event..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cell-current)] resize-none"
                />
            </div>

            {/* Color Picker */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Color (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(color === c ? '' : c)}
                            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                            style={{
                                backgroundColor: c,
                                borderColor: color === c ? 'var(--color-text-primary)' : 'transparent',
                            }}
                            aria-label={`Select color ${c}`}
                        />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--cell-current)] text-black font-medium hover:opacity-90 transition-opacity"
                >
                    {isEditing ? 'Update' : 'Add Event'}
                </button>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

/**
 * Format a Date object for input[type="date"]
 */
function formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
}
