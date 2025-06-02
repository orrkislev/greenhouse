import { useEffect, useState } from "react";
import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { useWeek } from "@/utils/store/scheduleDisplayStore";

const GanttDay = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    rounded-sm bg-pink-300/50 backdrop-blur-xs shadow mb-[-.5em]
    gap-2 divide-y divide-black/10
`;

export default function Gantt() {
    const week = useWeek((state) => state.week);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!week || week.length === 0) return;

        async function fetchEvents() {
            try {
                const res = await fetch(`/api/google_calendar?firstDay=${formatDate(week[0])}`);
                const data = await res.json();
                setEvents(data.items || []);
                if (!data.items || data.items.length === 0) {
                    console.warn("No calendar events found for this week.");
                    return;
                }
                const ganttItems = [];
                data.items.filter(e => e.summary).forEach(event => {
                    const start = new Date(event.start.dateTime || event.start.date);
                    const end = new Date(event.end.dateTime || event.end.date);
                    const isAllDay = !event.start.dateTime;
                    let current = new Date(start);
                    const last = new Date(end);
                    if (isAllDay) last.setDate(last.getDate() - 1);
                    while (current <= last) {
                        ganttItems.push({
                            date: formatDate(current),
                            content: event.summary || '',
                        });
                        current.setDate(current.getDate() + 1);
                    }
                });
                setEvents(ganttItems);
            } catch (err) {
                console.error("Failed to fetch events from /api/google_calendar", err);
            }
        }
        fetchEvents();
    }, [week]);

    return (
        <>
            {week.map((date, index) => (
                <GanttDay key={`empty-${index}`}
                    style={{
                        marginTop: '0.5em',
                        gridColumnStart: index + 2,
                        pointerEvents: 'none',
                    }}
                >
                    {events.filter(g => g.date === formatDate(date)).map(g => (
                        <div key={g.date + g.content} className="text-xs text-gray-700 text-center">
                            {g.content}
                        </div>
                    ))}
                </GanttDay>
            ))}
        </>
    );
}


