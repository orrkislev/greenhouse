import { useEffect } from "react";
import { tw } from "@/utils/tw";
import { useTime } from "@/utils/store/useTime";
import { ScheduleSection } from "./Layout";
import { ganttActions, useGantt } from "@/utils/store/useGantt";

const GanttDay = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD]
    `;

export default function Gantt() {
    const week = useTime((state) => state.week);
    const gantt = useGantt((state) => state.gantt);

    useEffect(() => {
        if (!week || week.length === 0) return;
        ganttActions.fetchGanttEvents(week[0]);
    }, [week]);

    return (
        <ScheduleSection name="כללי" edittable={false}>
            {week.map((date, index) => (
                <GanttDay key={`empty-${index}`} className={`pointer-events-none col-${index + 1}`}>
                    {ganttActions.getGanttForDay(date).map((event, i) => (
                        <div key={i} className="text-xs text-gray-700 text-center">
                            {event}
                        </div>
                    ))}
                </GanttDay>
            ))}
        </ScheduleSection>
    );
}


