/**
 * EventList Component
 * 
 * Displays a list of all events with edit/delete actions.
 * Sorted by date.
 */

import { useState } from 'react';
import { useEvents, useLifeCalendarStore } from '@/store/lifeCalendarStore';
import { format } from 'date-fns';
import { EventForm } from './EventForm';
import type { LifeEvent } from '@/types';

export const EventList = () => {
    const events = useEvents();
    const removeEvent = useLifeCalendarStore((state) => state.removeEvent);
    const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
                <p>No events yet.</p>
                <p className="text-sm mt-1">Add your first life event above.</p>
            </div>
        );
    }

    if (editingEvent) {
        return (
            <div>
                <h4 className="font-medium mb-3">Edit Event</h4>
                <EventForm
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {sortedEvents.map((event) => (
                <div
                    key={event.id}
                    className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] group"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                {event.color && (
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: event.color }}
                                    />
                                )}
                                <span className="font-medium truncate">{event.title}</span>
                                {event.endDate && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                                        Period
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {format(event.date, 'MMM d, yyyy')}
                                {event.endDate && ` – ${format(event.endDate, 'MMM d, yyyy')}`}
                            </div>
                            {event.description && (
                                <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
                                    {event.description}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditingEvent(event)}
                                className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
                                aria-label="Edit event"
                            >
                                <EditIcon />
                            </button>
                            <button
                                onClick={() => removeEvent(event.id)}
                                className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                                aria-label="Delete event"
                            >
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
