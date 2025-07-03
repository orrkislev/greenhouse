import { tw } from "@/utils/tw";
import { formatDate } from "@/utils/utils";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { useRef, useState } from "react";
import EditTaskDrawer from "./EditTaskDrawer";


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
        <>
            <div className="col-start-2 col-end-8 row-3 z-10">
                <div className="w-full grid grid-cols-6 gap-2">
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
                </div>
            </div>

            <EditTaskDrawer
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />
        </>
    )
}


const AddTaskButtonDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        opacity-0 hover:opacity-100 bg-white transition-all
        inset-shadow-[0_2px_4px_rgba(0,0,0,0.1)]
        rounded-md z-5 m-2
`;

function AddTaskButton({ col, row }) {
    const addTask = useUserSchedule(state => state.addTask);
    const week = useWeek(state => state.week);

    const handleClick = () => {
        const date = week[col - 1];
        addTask({
            start: formatDate(date),
            end: formatDate(date),
            title: "New Task",
            description: "",
            type: "task",
        });
    }

    return (
        <AddTaskButtonDiv className={`col-${col} row-start-${row} row-end-5`}
            onClick={handleClick}
        >
            משימה חדשה
        </AddTaskButtonDiv>
    );
}




const TaskDiv = tw`bg-[#309898] 
        flex items-center justify-center text-gray-800 text-white text-sm
        pointer-events-auto cursor-pointer 
        hover:bg-[#2A7B7B] hover:shadow-lg hover:translate-y-[-2px] transition-all z-10
        py-1 mx-[-1em] rounded-full shadow-md
`;

function Task({ task, onClick, row }) {
    const rotation = useRef(Math.random() * 10 - 5);
    const week = useWeek(state => state.week);

    let dayStartIndex = week.findIndex(date => formatDate(date) === task.start);
    let dayEndIndex = week.findIndex(date => formatDate(date) === task.end);

    if (dayStartIndex === -1) dayStartIndex = 0;
    if (dayEndIndex === -1) dayEndIndex = week.length - 1

    const taskLength = dayEndIndex - dayStartIndex + 1;

    return (
        <TaskDiv className={`col-start-${dayStartIndex + 1} col-end-${dayEndIndex + 2} row-${row}`}
            style={{ transform: `rotate(${rotation.current / (taskLength * taskLength)}deg)` }}
            onClick={onClick}
        >
            {task.title}
        </TaskDiv>
    );
}
