import { useEffect, useState, useRef } from "react";
import Avatar from "@/components/Avatar";
import { eventsActions } from "@/utils/store/useEvents";
import { projectActions } from "@/utils/store/useProject";
import { groupsActions, groupUtils } from "@/utils/store/useGroups";
import { researchActions } from "@/utils/store/useResearch";
import { format } from 'date-fns';

export default function StudentCard({ student, viewMode }) {
    const [data, setData] = useState({ ...student });
    const [loadedViews, setLoadedViews] = useState(new Set());
    const cardRef = useRef(null);
    const today = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        // Only load data if we haven't loaded it for this view yet
        if (loadedViews.has(viewMode)) return;

        (async () => {
            if (viewMode === 'events' && !data.events) {
                const events = await eventsActions.getTodaysEventsForUser(student.id);
                groupUtils.getUserGroupIds(student).forEach(groupId => groupsActions.loadGroupEvents(groupId, today, today));
                setData(prev => ({ ...prev, events }));
                setLoadedViews(prev => new Set([...prev, 'events']));
            } else if (viewMode === 'project' && !data.project) {
                const project = await projectActions.getProjectForStudent(student.id);
                setData(prev => ({ ...prev, project }));
                setLoadedViews(prev => new Set([...prev, 'project']));
            } else if (viewMode === 'research' && !data.research) {
                const research = await researchActions.getStudentLatestResearch(student.id);
                setData(prev => ({ ...prev, research }));
                setLoadedViews(prev => new Set([...prev, 'research']));
            }
        })()
    }, [viewMode, student.id, today, loadedViews, data.events, data.project])

    if (!data) {
        return (
            <div
                ref={cardRef}
                className="bg-white rounded p-2 border border-gray-200 animate-pulse break-inside-avoid">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    const { scheduledEvents = [], meetings = [] } = data.events || {};
    console.log(meetings);
    const allEvents = [...scheduledEvents, ...meetings].sort((a, b) => a.start.localeCompare(b.start));

    return (
        <div
            ref={cardRef}
            className="bg-white rounded p-3 border border-gray-200 flex flex-col gap-2 break-inside-avoid"
        >
            {/* Student Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <Avatar user={student} className="w-8 h-8" hoverScale={false} />
                <div>
                    <h3 className="text-sm font-bold text-gray-800">
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
                                        <span className="text-stone-700 font-medium">{event.start.split(':').slice(0, 2).join(':')}</span>
                                        {(event.other_participants && event.other_participants.length > 0) ?
                                            <span className="text-gray-700">{event.other_participants[0].first_name} {event.other_participants[0].last_name}</span>
                                            :
                                            <span className="text-gray-700">{event.title}</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400">אין אירועים היום</div>
                    )}
                </>
            )}

            {viewMode === 'project' && (
                <>
                    {data.project ? (
                        <div className="text-xs font-bold text-gray-800">{data.project.title}</div>
                    ) : (
                        <div className="text-xs text-gray-400">אין פרויקט</div>
                    )}
                </>
            )}

            {viewMode === 'research' && (
                <>
                    {data.research ? (
                        <>
                            <div className="text-xs font-bold text-gray-800">{data.research.title}</div>
                            <div className="flex gap-2 text-xs text-gray-800 flex-wrap">
                                {data.research.sections.questions && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.questions.length} שאלות</div>}
                                {data.research.sections.sources && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.sources.length} מקורות</div>}
                                {data.research.sections.quotes && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.quotes.length} ציטוטים</div>}
                                {data.research.sections.summary && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.summary.length} סיכום</div>}
                                {data.research.sections.masters && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.masters.length} אנשים</div>}
                                {data.research.sections.vocabulary && <div className="px-2 py-1 bg-gray-100 rounded-md">{data.research.sections.vocabulary.length} מושגים</div>}
                            </div>
                        </>
                    ) : (
                        <div className="text-xs text-gray-400">אין חקר</div>
                    )}
                </>
            )}
        </div>
    );
}
