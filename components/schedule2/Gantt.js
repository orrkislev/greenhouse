import { useEffect } from "react";
import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { useGantt } from "@/utils/store/scheduleDataStore";
import { ScheduleSection } from "./Layout";

const GanttDay = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD]
    `;

export default function Gantt() {
    const week = useWeek((state) => state.week);
    const gantt = useGantt();

    useEffect(() => {
        if (!week || week.length === 0) return;
        gantt.getGanttEvents(week[0]);
    }, [week]);

    return (
        <ScheduleSection name="גאנט" edittable={false}>
            {week.map((date, index) => (
                <GanttDay key={`empty-${index}`} className={`pointer-events-none col-${index + 1}`}>
                    {gantt.gantt[formatDate(date)] && gantt.gantt[formatDate(date)].map((event, i) => (
                        <div key={`${formatDate(date)}-${i}`} className="text-xs text-gray-700 text-center">
                            {event}
                        </div>
                    ))}
                </GanttDay>
            ))}
        </ScheduleSection>
    );
}


