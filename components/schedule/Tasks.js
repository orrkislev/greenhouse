import { tw } from "@/utils/tw";
import { Grid } from "./Schedule";
import { formatDate } from "@/utils/utils";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";


export default function TasksGrid({ gridData }) {
    const tasks = useUserSchedule(state => state.tasks);

    const { weekDates, template } = gridData;

    return (
        <Grid className={`z-40`} style={{ gridTemplateRows: template, pointerEvents: 'none' }}>
            {tasks.map((task, index) => (
                <Task key={index}
                    task={task}
                    weekDates={weekDates}
                />
            ))}
        </Grid>
    )
}



const TaskDiv = tw`bg-[#309898] rounded-full shadow mx-2
        flex items-center justify-start
        text-gray-800 text-white text-sm px-8 
        pointer-events-auto cursor-pointer hover:bg-[#2A7B7B] transition-colors
        ${props => props.isSelected ? 'bg-[#267070] font-bold' : ''}
`;

function Task({ task, weekDates }) {
    const selected = useUserSchedule(state => state.selected)
    const setSelected = useUserSchedule(state => state.setSelected);
    
    const dayStartIndex = weekDates.findIndex(date => formatDate(date) === task.dayStart);
    const dayEndIndex = weekDates.findIndex(date => formatDate(date) === task.dayEnd);

    return (
        <TaskDiv
            style={{
                gridRowStart: 2,
                gridColumnStart: dayStartIndex * 2 + 2,
                gridColumnEnd: dayEndIndex * 2 + 4
            }}
            onClick={() => setSelected(task.id)}
            isSelected={ selected === task.id}
        >
            {task.title}
        </TaskDiv>
    );
}
