import { ScheduleEvents } from "@/app/schedule/components/events/Events";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { eventsActions } from "@/utils/useEvents";
import { tasksActions } from "@/utils/useTasks";
import { useEffect } from "react";

export default function MentoringGroup_Meetings({ group, styles }) {
    const week = useWeek(state => state.week);

    useEffect(()=>{
        eventsActions.loadWeekEvents(week);
        tasksActions.loadWeekTasks(week);
    }, [week])

    return (
        <div className={`p-4 border-t ${styles.border}`}>
            <h4 className={`font-bold ${styles.accent}`}>שיחות אישיות</h4>
            <div className="flex justify-between w-full mt-2 gap-4">
                <div className="flex flex-col gap-2">
                    {group.students && group.students.map(student => (
                        <div key={student.id} className="bg-gray-200 px-2 py-1 border border-gray-300 flex gap-2 text-sm">
                            <span className="">{student.firstName} {student.lastName}</span>
                            <span className="text-gray-600">
                                {student.nextMeeting ? new Date(student.nextMeeting).toLocaleDateString() : "---"}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex-1">
                    <ScheduleEvents withLabel={false}/>
                </div>
            </div>
        </div>
    );
}
