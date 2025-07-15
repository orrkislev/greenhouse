import { ScheduleSection } from "../Layout";
import AddTaskButton from "./AddTaskButton";
import { Task } from "./Task";
import useWeeksTasks from "./useWeeksTasks";


export default function Tasks() {
    const { displayTasks, columns } = useWeeksTasks();

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
