/**
 * EventPanel Component
 * 
 * Sidebar panel containing event management UI.
 * Includes EventForm, EventList, and Import/Export buttons.
 */

import { useState, useRef, useEffect } from 'react';
import { EventForm } from './EventForm';
import { EventList } from './EventList';
import { useLifeCalendarStore, useEvents } from '@/store/lifeCalendarStore';
import { readFileAsText } from '@/lib/importExport';

interface EventPanelProps {
    isOpen: boolean;
    onClose: () => void;
    prefilledDate?: Date;
}

export const EventPanel = ({ isOpen, onClose, prefilledDate }: EventPanelProps) => {
    const events = useEvents();
    const exportData = useLifeCalendarStore((state) => state.exportData);
    const importData = useLifeCalendarStore((state) => state.importData);

    const [showForm, setShowForm] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-show form when prefilledDate is provided (from week click)
    useEffect(() => {
        if (prefilledDate) {
            setShowForm(true);
        }
    }, [prefilledDate]);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const json = await readFileAsText(file);
            const result = importData(json);
            if (!result.success) {
                setImportError(result.error ?? 'Import failed');
            } else {
                setImportError(null);
            }
        } catch {
            setImportError('Failed to read file');
        }

        // Reset input
        e.target.value = '';
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 no-print"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-background)] border-l border-[var(--color-border)] z-50 flex flex-col no-print">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <h2 className="text-lg font-semibold">Events</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-[var(--color-surface)] transition-colors"
                        aria-label="Close panel"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Add Event Section */}
                    <div className="mb-6">
                        {showForm ? (
                            <div>
                                <h3 className="font-medium mb-3">Add New Event</h3>
                                <EventForm
                                    onClose={() => setShowForm(false)}
                                    defaultDate={prefilledDate}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--cell-current)] hover:text-[var(--cell-current)] transition-colors text-[var(--color-text-secondary)]"
                            >
                                + Add Event
                            </button>
                        )}
                    </div>

                    {/* Events List */}
                    <div className="mb-6">
                        <h3 className="font-medium mb-3">
                            Your Events ({events.length})
                        </h3>
                        <EventList />
                    </div>
                </div>

                {/* Footer - Import/Export */}
                <div className="p-4 border-t border-[var(--color-border)] space-y-3">
                    {importError && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {importError}
                            <button
                                onClick={() => setImportError(null)}
                                className="ml-2 underline hover:no-underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={exportData}
                            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors text-sm font-medium"
                        >
                            Export JSON
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors text-sm font-medium"
                        >
                            Import JSON
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
