import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { useState } from "react";
import EditTaskDrawer from "./EditTaskDrawer";
import { ScheduleSection } from "../Layout";


export default function Tasks() {
    const tasks = useUserSchedule(state => state.tasks);
    const week = useWeek(state => state.week);
    const [selectedTask, setSelectedTask] = useState(null);

    const displayTasks = [...tasks]
    const columns = week.map(date => ({ date, tasks: [] }));
    displayTasks.forEach(task => {
        let startIndex = week.findIndex(date => formatDate(date) === task.start);
        let endIndex = week.findIndex(date => formatDate(date) === task.end);

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
                    onClick={() => handleCreateNewTask(dayIndex)}
                />
            ))}
            {displayTasks.map((task, index) => (
                <Task key={index}
                    task={task}
                    row={task.row}
                    onClick={() => setSelectedTask(task)}
                />
            ))}

            <EditTaskDrawer
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />
        </ScheduleSection>

    )
}


const AddTaskButtonDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-transparent hover:text-gray-800
        z-5
`;

function AddTaskButton({ col, row }) {
    const addTask = useUserSchedule(state => state.addTask);
    const week = useWeek(state => state.week);

    const handleClick = () => {
        const date = week[col - 1];
        addTask({
            start: formatDate(date),
            end: formatDate(date),
            title: "משימה חדשה",
            description: "",
            type: "task",
        });
    }

    return (
        <AddTaskButtonDiv className={`col-${col} row-start-${row} row-end-5`}
            onClick={handleClick}
        >
            +
        </AddTaskButtonDiv>
    );
}




const TaskDiv = tw`bg-[#F3B580]
        flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        hover:bg-[#F3A05B] transition-all z-10
        py-1
`;

function Task({ task, onClick, row }) {
    const week = useWeek(state => state.week);

    let dayStartIndex = week.findIndex(date => formatDate(date) === task.start);
    let dayEndIndex = week.findIndex(date => formatDate(date) === task.end);

    if (dayStartIndex === -1) dayStartIndex = 0;
    if (dayEndIndex === -1) dayEndIndex = week.length - 1

    return (
        <TaskDiv className={`col-start-${dayStartIndex + 1} col-end-${dayEndIndex + 2} row-${row}`}
            onClick={onClick}
        >
            {task.title}
        </TaskDiv>
    );
}
