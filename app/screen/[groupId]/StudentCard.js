'use client'

import { useRef } from "react";
import Avatar from "@/components/Avatar";

export default function StudentCard({ student, viewMode }) {
    const cardRef = useRef(null);

    // Data is now passed from server via props
    const { scheduledEvents = [], meetings = [] } = student.events || {};
    const allEvents = [...scheduledEvents, ...meetings].sort((a, b) => a.start.localeCompare(b.start));

    return (
        <div
            ref={cardRef}
            className="bg-card rounded p-3 border border-border flex flex-col gap-2 break-inside-avoid"
        >
            {/* Student Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Avatar user={student} className="w-8 h-8" hoverScale={false} />
                <div>
                    <h3 className="text-sm font-bold text-foreground">
                        {student.first_name} {student.last_name}
                    </h3>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'events' && (
                <>
                    {allEvents.length > 0 ? (
                        <div className="space-y-1">
                            {allEvents.map((event, idx) => (
                                <div key={event.id || idx} className="text-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="text-foreground font-medium">{event.start.split(':').slice(0, 2).join(':')}</span>
                                        {(event.other_participants && event.other_participants.length > 0) ?
                                            <span className="text-foreground">{event.other_participants[0]?.first_name} {event.other_participants[0]?.last_name}</span>
                                            :
                                            <span className="text-foreground">{event.title}</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground">אין אירועים היום</div>
                    )}
                </>
            )}

            {viewMode === 'project' && (
                <>
                    {student.project ? (
                        <div className="text-xs font-bold text-foreground">{student.project?.title}</div>
                    ) : (
                        <div className="text-xs text-muted-foreground">אין פרויקט</div>
                    )}
                </>
            )}

            {viewMode === 'research' && (
                <>
                    {student.research ? (
                        <>
                            <div className="text-xs font-bold text-foreground">{student.research?.title}</div>
                            <div className="flex gap-2 text-xs text-foreground flex-wrap">
                                {student.research?.sections?.questions && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.questions.length} שאלות</div>}
                                {student.research?.sections?.sources && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.sources.length} מקורות</div>}
                                {student.research?.sections?.quotes && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.quotes.length} ציטוטים</div>}
                                {student.research?.sections?.summary && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.summary.length} סיכום</div>}
                                {student.research?.sections?.masters && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.masters.length} אנשים</div>}
                                {student.research?.sections?.vocabulary && <div className="px-2 py-1 bg-muted rounded-md">{student.research.sections.vocabulary.length} מושגים</div>}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground">אין חקר</div>
                    )}
                </>
            )}
        </div>
    );
}
