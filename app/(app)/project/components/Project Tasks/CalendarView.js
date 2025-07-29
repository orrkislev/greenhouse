import { tw } from "@/utils/tw";
import { ganttActions, useGantt } from "@/utils/useGantt";
import { useTime } from "@/utils/useTime";
import { endOfWeek, format, startOfWeek, add } from "date-fns";
import { Trash, Grip } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { projectTasksActions, useProjectTasks } from "@/utils/useProjectTasks";

const CalendarHeader = tw`flex items-center justify-between p-4 bg-gray-100`;
const CalendarCell = tw`p-2 flex flex-col gap-1 transition-all duration-200 border border-gray-200 relative
    ${props => props.$over ? 'border-l-4 border-l-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200' : ''}
    ${props => props.$isWeekend ? 'text-gray-500' : 'text-gray-700'}
    ${props => props.$inTerm ? 'text-gray-500' : 'text-gray-700'}
    ${props => props.$isPast ? 'stripes' : ''}`;


export default function CalendarView() {
    const tasks = useProjectTasks((state) => state.tasks);
    const currTerm = useTime((state) => state.currTerm);
    const gantt = useGantt((state) => state.gantt);

    useEffect(() => {
        ganttActions.fetchGanttEvents(currTerm.start, currTerm.end);
    }, [currTerm]);

    const termStart = new Date(currTerm.start);
    const termEnd = new Date(currTerm.end);

    const firstSunday = startOfWeek(termStart, { weekStartsOn: 0 });
    const lastSaturday = endOfWeek(termEnd, { weekStartsOn: 6 });

    const cellsData = [];
    let currentDay = new Date(firstSunday);
    while (currentDay <= lastSaturday) {
        if (currentDay.getDay() !== 6) {
            const currendDatFormatted = format(currentDay, "yyyy-MM-dd");
            const newDate = {
                type: 'day',
                date: new Date(currentDay),
                dateFormatted: currendDatFormatted,
                inTerm: currentDay >= termStart && currentDay <= termEnd,
                isWeekend: currentDay.getDay() === 5,
                isPast: currendDatFormatted < format(new Date(), "yyyy-MM-dd"),
                gantt: ganttActions.getGanttForDay(currentDay),
                tasks: tasks.filter(task => task.endDate === currendDatFormatted),
            }
            cellsData.push(newDate);
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }


    return (
        <div className='grid grid-cols-6 divide-x divide-y divide-black border border-black'>
            <CalendarHeader>א</CalendarHeader>
            <CalendarHeader>ב</CalendarHeader>
            <CalendarHeader>ג</CalendarHeader>
            <CalendarHeader>ד</CalendarHeader>
            <CalendarHeader>ה</CalendarHeader>
            <CalendarHeader>סופש</CalendarHeader>

            {cellsData.map((cellData, index) => (
                <CalendarCellComponent key={index} cellData={cellData} />
            ))}
        </div>
    );
}

function CalendarCellComponent({ cellData }) {
    const elementRef = useRef(null);
    const [dragOverState, setDragOverState] = useState(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            getData: () => ({
                targetDate: cellData.dateFormatted,
                type: cellData.type,
                cellData: cellData
            }),
            onDragEnter: () => setDragOverState('over'),
            onDragLeave: () => setDragOverState(null),
            onDrop: ({ source, location }) => {
                setDragOverState(null);

                // Check if the drop was on a task element (which would have handled it)
                const taskElement = location.current.dropTargets.find(target =>
                    target.data.type === 'task'
                );

                // Only handle the drop if no task element was involved
                if (!taskElement) {
                    const taskId = source.data.taskId;
                    projectTasksActions.updateTask(taskId, {
                        startDate: cellData.dateFormatted,
                        endDate: cellData.dateFormatted
                    });
                }
            }
        });
    }, [cellData]);

    return (
        <CalendarCell ref={elementRef} $over={dragOverState === 'over'}
            $isWeekend={cellData.isWeekend}
            $inTerm={cellData.inTerm}
            $isPast={cellData.isPast}>
            <div className="text-sm text-gray-500 mb-2">
                {cellData.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}

                {cellData.gantt.map(ganttEvent => (
                    <div key={ganttEvent} className="text-xs text-gray-400">
                        {ganttEvent}
                    </div>
                ))}

                {cellData.tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                    />
                ))}
            </div>
        </CalendarCell>
    );
}


function TaskItem({ task }) {
    const elementRef = useRef(null);
    const gripRef = useRef(null);
    const [dragState, setDragState] = useState('idle');

    const onDelete = (taskId) => {
        projectTasksActions.deleteTask(taskId);
    };

    useEffect(() => {
        if (!task) return;
        if (task.completed) return;
        const element = elementRef.current;
        const gripElement = gripRef.current;
        if (!element || !gripElement) return;

        return combine(
            draggable({
                element: gripElement, // Only the grip is draggable
                getInitialData: () => ({
                    taskId: task.id,
                    type: 'task'
                }),
                onDragStart: () => setDragState('dragging'),
                onDrop: () => setDragState('idle'),
            }),
            dropTargetForElements({
                element, // The entire task is a drop target
                getData: () => ({
                    taskId: task.id,
                    type: 'task'
                }),
                canDrop: ({ source }) => source.data.taskId !== task.id,
                onDragEnter: ({ source }) => {
                    if (source.data.taskId !== task.id) {
                        setDragState('over');
                    }
                },
                onDragLeave: () => setDragState('idle'),
                onDrop: ({ source }) => setDragState('idle')
            })
        );
    }, [task]);

    return (
        <TaskItemDiv ref={elementRef} $dragging={dragState === 'dragging'} $over={dragState === 'over'} $active={!task.completed}>
            <div ref={gripRef} className="flex items-center gap-2 text-gray-400 cursor-move hover:text-gray-600 transition-colors p-1 rounded mr-2" >
                {!task.completed && <Grip className="w-3 h-3" />}
            </div>
            <div className="text-sm text-gray-700 flex-1">{task.title}</div>
            <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => onDelete(task.id)}>
                <Trash className="w-4 h-4" />
            </button>
        </TaskItemDiv>
    );
}

const TaskItemDiv = tw`
    relative flex items-center justify-between p-2 bg-white border-b border-gray-200 transition-all duration-200
    ${props => props.$dragging ? 'opacity-50 transform rotate-2 shadow-lg scale-105' : 'hover:bg-gray-50'}
    ${props => props.$over ? 'border-l-4 border-l-blue-400 bg-blue-50' : ''}
    ${props => props.$active ? '' : 'opacity-50 line-through bg-emerald-100 hover:bg-emerald-100'}
`;