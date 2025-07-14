import { useEffect } from "react";
import { tw } from "@/utils/tw";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { ScheduleSection } from "./Layout";
import { useGantt } from "../utils/useGantt";

const GanttDay = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD]
    `;

export default function Gantt() {
    const week = useWeek((state) => state.week);
    const gantt = useGantt();

    useEffect(() => {
        if (!week || week.length === 0) return;
        gantt.fetchGanttEvents(week[0]);
    }, [week]);

    return (
        <ScheduleSection name="גאנט" edittable={false}>
            {week.map((date, index) => (
                <GanttDay key={`empty-${index}`} className={`pointer-events-none col-${index + 1}`}>
                    {gantt.getGanttForDay(date).map((event, i) => (
                        <div key={i} className="text-xs text-gray-700 text-center">
                            {event}
                        </div>
                    ))}
                </GanttDay>
            ))}
        </ScheduleSection>
    );
}


