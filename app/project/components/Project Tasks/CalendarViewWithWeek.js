import { tw } from "@/utils/tw";
import { ganttActions, useGantt } from "@/utils/useGantt";
import { useTime } from "@/utils/useTime";
import { endOfWeek, format, startOfWeek, add } from "date-fns";
import { Trash, Grip } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

const CalendarHeader = tw`flex items-center justify-between p-4 bg-gray-100`;
const CalendarCell = tw`p-2 flex flex-col gap-1 transition-all duration-200 border border-gray-200 relative
    ${props => props.$over ? 'border-l-4 border-l-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200' : ''}
    ${props => props.$isWeekend ? 'text-gray-500' : 'text-gray-700'}
    ${props => props.$inTerm ? 'text-gray-500' : 'text-gray-700'}
    ${props => props.$isPast ? 'stripes' : ''}`;


export default function CalendarView({ tasks, updateTaskField, onDelete }) {
    const currTerm = useTime((state) => state.currTerm);
    const gantt = useGantt((state) => state.gantt);
    const [isDragging, setIsDragging] = useState(false);

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
                tasks: tasks.filter(task => task.startDate === currendDatFormatted && task.endDate === currendDatFormatted),
            }
            cellsData.push(newDate);
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }

    // Add week cells and populate tasks
    for (let i = 0; i < cellsData.length; i += 7) {
        const weekStart = cellsData[i].date;
        const weekEnd = add(weekStart, { days: 4 });
        const weekStartFormatted = format(weekStart, 'yyyy-MM-dd');
        const weekEndFormatted = format(weekEnd, 'yyyy-MM-dd');

        cellsData.splice(i, 0, {
            type: 'week',
            start: weekStartFormatted,
            end: weekEndFormatted,
            inTerm: cellsData[i].inTerm,
            isPast: cellsData[i].isPast,
            gantt: [],
            tasks: tasks.filter(task => task.startDate === weekStartFormatted && task.endDate === weekEndFormatted)
        });
    }


    const handleTaskMove = (taskId, cellData) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (cellData.type === 'day') {
            updateTaskField(taskId, 'startDate', cellData.dateFormatted);
            updateTaskField(taskId, 'endDate', cellData.dateFormatted);
        } else if (cellData.type === 'week') {
            const newStartDate = format(cellData.start, 'yyyy-MM-dd');
            const newEndDate = format(cellData.end, 'yyyy-MM-dd');
            updateTaskField(taskId, 'startDate', newStartDate);
            updateTaskField(taskId, 'endDate', newEndDate);
        }
    };

    return (
        <div className='grid grid-cols-7 divide-x divide-y divide-black border border-black'>
            <CalendarHeader>שבוע</CalendarHeader>
            <CalendarHeader>א</CalendarHeader>
            <CalendarHeader>ב</CalendarHeader>
            <CalendarHeader>ג</CalendarHeader>
            <CalendarHeader>ד</CalendarHeader>
            <CalendarHeader>ה</CalendarHeader>
            <CalendarHeader>סופש</CalendarHeader>

            {cellsData.map((cellData, index) => (
                <CalendarCellComponent
                    key={index}
                    cellData={cellData}
                    onTaskMove={handleTaskMove}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

function CalendarCellComponent({ cellData, onTaskMove, isDragging, setIsDragging, onDelete }) {
    const elementRef = useRef(null);
    const [dragOverState, setDragOverState] = useState(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            getData: () => ({
                targetDate: cellData.type === 'week' ? format(cellData.start, 'yyyy-MM-dd') : cellData.dateFormatted,
                type: cellData.type,
                cellData: cellData
            }),
            onDragEnter: () => {
                setDragOverState('over');
            },
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
                    onTaskMove(taskId, cellData);
                }
            }
        });
    }, [cellData, onTaskMove]);
    
    return (
        <CalendarCell ref={elementRef} $over={dragOverState === 'over'}
            $isWeekend={cellData.isWeekend}
            $inTerm={cellData.inTerm}
            $isPast={cellData.isPast}>
            <div className="text-sm text-gray-500 mb-2">
                {cellData.type === 'day' && (
                    cellData.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
                )}

                {cellData.gantt.map((ganttEvent, ganttIndex) => (
                    <div key={ganttEvent} className="text-xs text-gray-400">
                        {ganttEvent}
                    </div>
                ))}

                {cellData.tasks.map((task, taskIndex) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onDelete={onDelete}
                        setIsDragging={setIsDragging}
                    />
                ))}
            </div>
        </CalendarCell>
    );
}


function TaskItem({ task, onDelete, setIsDragging }) {
    const elementRef = useRef(null);
    const gripRef = useRef(null);
    const [dragState, setDragState] = useState('idle');

    useEffect(() => {
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
                onDragStart: () => {
                    setDragState('dragging');
                    setIsDragging(true);
                },
                onDrop: () => {
                    setDragState('idle');
                    setIsDragging(false);
                }
            }),
            dropTargetForElements({
                element, // The entire task is a drop target
                getData: () => ({
                    taskId: task.id,
                    type: 'task'
                }),
                canDrop: ({ source }) => {
                    return source.data.taskId !== task.id;
                },
                onDragEnter: ({ source }) => {
                    if (source.data.taskId !== task.id) {
                        setDragState('over');
                    }
                },
                onDragLeave: () => {
                    setDragState('idle');
                },
                onDrop: ({ source }) => {
                    setDragState('idle');
                    // Task-to-task drops are handled by the parent CalendarCell
                }
            })
        );
    }, [task.id, setIsDragging]);

    return (
        <TaskItemDiv ref={elementRef} $dragging={dragState === 'dragging'} $over={dragState === 'over'}>
            <div ref={gripRef} className="flex items-center gap-2 text-gray-400 cursor-move hover:text-gray-600 transition-colors p-1 rounded mr-2" >
                <Grip className="w-3 h-3" />
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
`;