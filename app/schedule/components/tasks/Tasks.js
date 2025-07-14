import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { ScheduleSection } from "../Layout";
import AddTaskButton from "./AddTaskButton";
import { Task } from "./Task";


export default function Tasks() {
    const tasks = useUserSchedule(state => state.tasks);
    const week = useWeek(state => state.week);

    const displayTasks = [...tasks]
    const columns = week.map(date => ({ date, tasks: [] }));
    displayTasks.forEach(task => {
        let startIndex = week.findIndex(date => date === task.start);
        let endIndex = week.findIndex(date => date === task.end);

        if (startIndex === -1) startIndex = 0;
        if (endIndex === -1) endIndex = week.length - 1;

        task.row = columns[startIndex].tasks.length + 1;
        columns[startIndex].tasks.push(task);
        for (let i = startIndex + 1; i <= endIndex; i++) {
            columns[i].tasks.push(null);
        }
    })

    return (
        <ScheduleSection name="משימות">
            {Array(6).fill(null).map((_, dayIndex) => (
                <AddTaskButton
                    key={`add-${dayIndex}`}
                    col={dayIndex + 1}
                    row={columns[dayIndex].tasks.length + 1}
                />
            ))}
            {displayTasks.map((task, index) => (
                <Task key={index}
                    task={task}
                    row={task.row}
                />
            ))}
        </ScheduleSection>
    )
}
