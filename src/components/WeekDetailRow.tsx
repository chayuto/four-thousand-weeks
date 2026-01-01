/**
 * WeekDetailRow Component
 * 
 * Inline expansion panel that appears below the selected week's row.
 * Shows week information and a compact event form.
 */

import { useState, type FormEvent } from 'react';
import { useLifeCalendarStore } from '@/store/lifeCalendarStore';
import { format } from 'date-fns';
import type { WeekData } from '@/types';

interface WeekDetailRowProps {
    weekData: WeekData;
    onClose: () => void;
}

export const WeekDetailRow = ({ weekData, onClose }: WeekDetailRowProps) => {
    const addEvent = useLifeCalendarStore((state) => state.addEvent);
    const events = useLifeCalendarStore((state) => state.events);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Get events for this week
    const weekEvents = events.filter(e => weekData.events.includes(e.id));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        addEvent({
            id: crypto.randomUUID(),
            title: title.trim(),
            date: weekData.startDate,
            description: description.trim() || undefined,
        });

        setTitle('');
        setDescription('');
        setIsFormVisible(false);
    };

    const getWeekStatus = () => {
        if (weekData.isCurrentWeek) return 'Current week';
        if (weekData.isPast) return 'Lived';
        return 'Future';
    };

    return (
        <div className="week-detail-row">
            <div className="week-detail-content">
                {/* Header */}
                <div className="week-detail-header">
                    <div>
                        <h3 className="week-detail-title">
                            Year {weekData.year + 1}, Week {weekData.weekOfYear + 1}
                        </h3>
                        <p className="week-detail-date">
                            {format(weekData.startDate, 'MMM d, yyyy')} – {format(weekData.endDate, 'MMM d, yyyy')}
                            <span className="week-detail-status"> • {getWeekStatus()}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="week-detail-close"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Existing events in this week */}
                {weekEvents.length > 0 && (
                    <div className="week-detail-events">
                        <h4 className="week-detail-section-title">Events in this week</h4>
                        {weekEvents.map(event => (
                            <div key={event.id} className="week-detail-event">
                                <span
                                    className="week-detail-event-dot"
                                    style={{ backgroundColor: event.color || 'var(--cell-current)' }}
                                />
                                <span>{event.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add event section */}
                {!isFormVisible ? (
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="week-detail-add-btn"
                    >
                        + Add event to this week
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="week-detail-form">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Event title"
                            className="week-detail-input"
                            autoFocus
                            required
                        />
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="week-detail-input"
                        />
                        <div className="week-detail-form-actions">
                            <button type="submit" className="week-detail-submit">
                                Add Event
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFormVisible(false)}
                                className="week-detail-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
