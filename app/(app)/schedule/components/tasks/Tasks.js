import { tasksActions, useTasks } from "@/utils/store/useTasks";
import { ScheduleSection } from "../Layout";
import AddTaskButton from "./AddTaskButton";
import { Task } from "./Task";
import { useGroups } from "@/utils/store/useGroups";
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";


export default function Tasks() {
    const tasks = useTasks(state => state.tasks);
    const groups = useGroups(state => state.groups);
    const week = useTime(state => state.week);

    useEffect(() => {
        if (week && week.length > 0) tasksActions.loadWeekTasks(week);
    }, [week]);

    const groupTasks = groups.filter(group => group.entries).flatMap(group =>
        group.entries
            .filter(task => task.isMember)
            .filter(entry => entry.type === 'task')
            .filter(task => task.date >= week[0] && task.date <= week[week.length - 1])
    );

    const allTasks = [...tasks, ...groupTasks];

    return (
        <ScheduleSection name="משימות">
            {week.map((date, index) => (
                <div key={index} className='flex flex-col gap-[2px]'>
                    {allTasks.filter(task => task.date === date).map(task => (
                        <Task key={task.id} task={task} />
                    ))}
                    <AddTaskButton key={`add-${index}`} date={date} />
                </div>
            ))}
        </ScheduleSection>
    )
}
