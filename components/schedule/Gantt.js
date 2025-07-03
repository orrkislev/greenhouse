import { useEffect, useState } from "react";
import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { SectionTitle } from "./Schedule";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const GanttDay = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10] mb-8
    `;

export default function Gantt() {
    const [isOpen, setIsOpen] = useState(false);
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
            <SectionTitle className="row-2" onClick={() => setIsOpen(!isOpen)}>
                גאנט {isOpen ? <ArrowUpCircle/> : <ArrowDownCircle />}
            </SectionTitle>
            {isOpen && week.map((date, index) => (
                <GanttDay key={`empty-${index}`} className={`mt-2 pointer-events-none row-2 col-${index + 2}`}>
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


