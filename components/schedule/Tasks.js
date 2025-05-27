import { tw } from "@/utils/tw";
import { Grid } from "./Main";
import { formatDate } from "@/utils/utils";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";


export default function TasksGrid({ gridData }) {
    const tasks = useUserSchedule(state => state.tasks);
    const { weekDates, template } = gridData;

    const clickTask = (task) => {
        console.log(`Clicked on task: ${task.title}, from day ${task.dayStart} to day ${task.dayEnd}`);
    }

    return (
        <Grid className={`z-40`} style={{ gridTemplateRows: template, pointerEvents: 'none' }}>
            {tasks.map((task, index) => (
                <Task key={index}
                    task={task}
                    onClick={() => clickTask(task)}
                    weekDates={weekDates}
                />
            ))}
        </Grid>
    )
}



const TaskDiv = tw`bg-[#309898] rounded-full shadow text-gray-800 mx-2 text-white text-sm px-8 flex items-center justify-start`

function Task({ task, onClick, weekDates }) {
    const dayStartIndex = weekDates.findIndex(date => formatDate(date) === task.dayStart);
    const dayEndIndex = weekDates.findIndex(date => formatDate(date) === task.dayEnd);
    return (
        <TaskDiv
            style={{
                gridRowStart: 2,
                gridColumnStart: dayStartIndex * 2 + 2,
                gridColumnEnd: dayEndIndex * 2 + 4
            }}
            onClick={onClick}
        >
            {task.title}
        </TaskDiv>
    );
}
