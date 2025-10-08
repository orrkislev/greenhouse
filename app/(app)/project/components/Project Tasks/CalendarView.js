import { tw } from "@/utils/tw";
import { ganttActions, useGantt } from "@/utils/store/useGantt";
import { useTime } from "@/utils/store/useTime";
import { endOfWeek, format, startOfWeek, add, subWeeks } from "date-fns";
import { Trash, Grip, ArrowDownToLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { projectTasksActions, useProjectTasksData } from "@/utils/store/useProjectTasks";
import TaskModal from "@/components/TaskModal";

const CalendarHeader = tw`flex items-center justify-between p-4 bg-stone-100`;
const CalendarCell = tw`p-2 flex flex-col gap-1 transition-all duration-200 border border-stone-200 relative
    ${props => props.$over ? 'border-l-4 border-l-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200' : ''}
    ${props => props.$isWeekend ? 'text-stone-500' : 'text-stone-700'}
    ${props => props.$inTerm ? 'text-stone-500' : 'text-stone-700'}
    ${props => props.$isPast ? 'stripes' : ''}`;


export default function CalendarView() {
    const tasks = useProjectTasksData((state) => state.tasks);
    const currTerm = useTime((state) => state.currTerm);
    const gantt = useGantt((state) => state.gantt);
    const [fullView, setFullView] = useState(true);

    useEffect(() => {
        if (!currTerm) return;
        ganttActions.fetchGanttEvents(currTerm.start, currTerm.end);
    }, [currTerm]);

    if (!currTerm) return;

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
                tasks: tasks.filter(task => format(new Date(task.due_date), 'yyyy-MM-dd') === currendDatFormatted),
            }
            cellsData.push(newDate);
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }

    let displayCells = cellsData;
    if (!fullView) {
        const startOfLastWeek = format(subWeeks(startOfWeek(new Date(), { weekStartsOn: 0 }), 1), "yyyy-MM-dd");
        const indexOfLastWeek = Math.max(cellsData.findIndex(cell => cell.dateFormatted === startOfLastWeek), 0)
        displayCells = cellsData.slice(indexOfLastWeek, indexOfLastWeek + 18);
    }



    return (
        <div className='grid grid-cols-6 relative'>
            <CalendarHeader>א</CalendarHeader>
            <CalendarHeader>ב</CalendarHeader>
            <CalendarHeader>ג</CalendarHeader>
            <CalendarHeader>ד</CalendarHeader>
            <CalendarHeader>ה</CalendarHeader>
            <CalendarHeader>סופש</CalendarHeader>

            {displayCells.map((cellData, index) => (
                <CalendarCellComponent key={index} cellData={cellData} />
            ))}
            {!fullView && (
                <>
                    <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-t from-transparent to-white" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-b from-transparent to-white" />
                    <ArrowDownToLine className="w-8 h-8 border border-stone-200 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-stone-400 bg-white p-1 rounded-full hover:bg-stone-100  hover:scale-110 cursor-pointer transition-all" onClick={() => setFullView(true)} />
                </>
            )}
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
                        due_date: cellData.dateFormatted,
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
            <div className="text-sm text-stone-500 mb-2">
                {cellData.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })}

                {cellData.gantt.map(ganttEvent => (
                    <div key={ganttEvent} className="text-xs text-stone-400">
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
    const [openTaskModal, setOpenTaskModal] = useState(false);

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
        <>
            <TaskItemDiv ref={elementRef} $dragging={dragState === 'dragging'} $over={dragState === 'over'} $active={!task.completed}>
                {!task.status !== 'completed' && (
                    <div ref={gripRef} className="flex items-center text-stone-400 cursor-move hover:text-stone-600 transition-colors p-1 rounded" >
                        <Grip className="w-3 h-3" />
                    </div>
                )}
                <div className="text-sm text-stone-700 flex-1 hover:underline decoration-dashed cursor-pointer" onClick={() => setOpenTaskModal(true)}>{task.title}</div>
            </TaskItemDiv>
            <TaskModal task={task} isOpen={openTaskModal} onClose={() => setOpenTaskModal(false)} />
        </>
    );
}

const TaskItemDiv = tw`
    relative flex items-center gap-2 bg-stone-200 border-b border-stone-200 transition-all duration-200
    ${props => props.$dragging ? 'opacity-50 transform rotate-2 shadow-lg scale-105' : 'hover:bg-stone-50'}
    ${props => props.$over ? 'border-l-4 border-l-blue-400 bg-blue-50' : ''}
    ${props => props.$active ? '' : 'opacity-50 line-through bg-emerald-100 hover:bg-emerald-100'}
`;