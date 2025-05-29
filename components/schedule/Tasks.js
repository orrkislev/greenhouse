import { tw } from "@/utils/tw";
import { Grid } from "./Schedule";
import { formatDate } from "@/utils/utils";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { useWeek } from "@/utils/store/scheduleDisplayStore";


export default function TasksGrid({ gridData }) {
    const tasks = useUserSchedule(state => state.tasks);

    return (
        <Grid className={`z-40`} style={{ ...gridData.style, pointerEvents: 'none' }}>
            {tasks.map((task, index) => (
                <Task key={index}
                    task={task}
                />
            ))}
        </Grid>
    )
}



const TaskDiv = tw`bg-[#309898] rounded-full shadow mx-2
        flex items-center justify-start
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#2A7B7B] transition-colors
        ${props => props.isselected ? 'bg-[#267070] font-bold' : ''}
`;

function Task({ task }) {
    const week = useWeek(state => state.week);
    const selected = useUserSchedule(state => state.selected)
    const setSelected = useUserSchedule(state => state.setSelected);
    
    const dayStartIndex = week.findIndex(date => formatDate(date) === task.start);
    const dayEndIndex = week.findIndex(date => formatDate(date) === task.end);

    return (
        <TaskDiv
            style={{
                gridRowStart: 2,
                gridColumnStart: dayStartIndex * 2 + 2,
                gridColumnEnd: dayEndIndex * 2 + 4
            }}
            onClick={() => setSelected(task.id)}
            isselected={ selected === task.id ? "true" : "false" }
        >
            {task.title}
        </TaskDiv>
    );
}
