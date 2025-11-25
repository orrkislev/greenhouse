import { getTermWeeks, useTime } from "@/utils/store/useTime";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { ArrowDownToLine, ExternalLink, Grip } from "lucide-react";
import { projectActions, useProjectData } from "@/utils/store/useProject";
import { tw } from "@/utils/tw";
import TaskModal from "@/components/TaskModal";
import Link from "next/link";
import Button from "@/components/Button";

export default function WeeklyView() {
    const [fullView, setFullView] = useState(true);
    const tasks = useProjectData((state) => state.tasks);
    const currTerm = useTime((state) => state.currTerm);
    const [isDragging, setIsDragging] = useState(false);

    if (!currTerm) return null;

    const termWeeks = getTermWeeks(currTerm);


    // ---- Filter tasks for each week
    termWeeks.forEach(week => week.tasks = []);
    tasks.forEach(task => {
        const dueDate = format(new Date(task.due_date), 'yyyy-MM-dd');
        const week = termWeeks.find(week => week.dates.includes(dueDate));
        if (week) week.tasks.push(task);
    })
    termWeeks.forEach(week => week.tasks.sort((a, b) => a.position - b.position));

    const handleTaskMove = (taskId, targetWeekIndex, positionInWeek) => {
        const targetWeek = termWeeks[targetWeekIndex];
        projectActions.updateTask(taskId, { due_date: format(targetWeek.start, 'yyyy-MM-dd'), position: positionInWeek });
    };

    let displayWeeks = termWeeks;
    if (!fullView) {
        const currentIndex = termWeeks.findIndex(week => week.isCurrent) || 1;
        displayWeeks = termWeeks.slice(currentIndex - 1, currentIndex + 2);
    }

    return (
        <div className='flex flex-col relative'>
            {displayWeeks.map((week, weekIndex) => (
                <WeekRow
                    key={week.weekNumber}
                    week={week}
                    weekIndex={weekIndex}
                    onTaskMove={handleTaskMove}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                />
            ))}
            {!fullView && (
                <>
                    <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-t from-transparent to-white" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-b from-transparent to-white" />
                    <ArrowDownToLine className="w-8 h-8 border border-border absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-stone-400 bg-white p-1 rounded-full hover:bg-muted  hover:scale-110 cursor-pointer transition-all" onClick={() => setFullView(true)} />
                </>
            )}
        </div>
    );
}


const WeekRowDiv = tw.div`
    flex gap-4 divide-x divide-stone-200 py-2 transition-colors ${({ $dragOver }) => $dragOver ? 'bg-muted' : ''}
    ${({ $isCurrent }) => $isCurrent ? 'bg-muted border border-border' : ''}
`

function WeekRow({ week, weekIndex, onTaskMove, isDragging, setIsDragging }) {
    const elementRef = useRef(null);
    const [dragOverState, setDragOverState] = useState(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            getData: () => ({ weekNumber: week.weekNumber, type: 'week' }),
            onDragEnter: () => {
                // Only show feedback if week has no tasks
                if (week.tasks.length === 0) {
                    setDragOverState('over');
                }
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
                    const targetPosition = week.tasks.length; // Add to end
                    onTaskMove(taskId, weekIndex, targetPosition);
                }
            }
        });
    }, [week.tasks.length, week.weekNumber, onTaskMove]);

    return (
        <WeekRowDiv ref={elementRef} $dragOver={dragOverState === 'over'} $isCurrent={week.isCurrent}>
            <div className='flex flex-col items-center justify-center w-16'>
                <div className="">{dateLabel(week.start)}</div>
                <div className="text-xs ">{monthLabel(week.start)}</div>
            </div>
            <div className='flex gap-2 flex-1 pl-4'>
                {week.tasks.map((task, taskIndex) => (
                    <DraggableTask
                        key={task.id}
                        task={task}
                        taskIndex={taskIndex}
                        weekNumber={week.weekNumber}
                        onTaskMove={onTaskMove}
                        setIsDragging={setIsDragging}
                    />
                ))}
                {week.tasks.length === 0 && (
                    <div className="text-stone-400 text-sm p-2">
                        -
                    </div>
                )}
            </div>
        </WeekRowDiv>
    );
}

function DraggableTask({ task, taskIndex, weekNumber, onTaskMove, setIsDragging }) {
    const elementRef = useRef(null);
    const gripRef = useRef(null);
    const [dragState, setDragState] = useState('idle');
    const [openTaskModal, setOpenTaskModal] = useState(false);

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
                    sourceWeekNumber: weekNumber,
                    sourceTaskIndex: taskIndex
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
                    taskIndex,
                    weekNumber,
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
                    const sourceTaskId = source.data.taskId;
                    if (sourceTaskId !== task.id) {
                        onTaskMove(sourceTaskId, weekNumber, taskIndex);
                    }
                }
            })
        );
    }, [task, taskIndex, weekNumber, onTaskMove, setIsDragging]);

    return (
        <>
            <div
                ref={elementRef}
                className={`relative flex items-center justify-between p-2 gap-4 border rounded-lg select-none transition-all ${dragState === 'dragging'
                    ? 'opacity-50 transform rotate-2 shadow-lg'
                    : dragState === 'over'
                        ? 'border-secondary bg-muted'
                        : 'hover:bg-muted border-border'
                    }
                ${task.completed ? 'opacity-50 line-through bg-emerald-100 hover:bg-emerald-100' : ''}
                `}>
                <div
                    ref={gripRef}
                    className="flex items-center gap-2 text-stone-400 cursor-move hover:text-muted-foreground transition-colors p-1 rounded"
                >
                    {!task.completed && <Grip className="w-4 h-4" />}
                </div>
                {dragState === 'over' && (
                    <DropIndicator edge="right" gap="4px" />
                )}
                <div className="flex-1 hover:underline decoration-dashed cursor-pointer" onClick={() => setOpenTaskModal(true)}>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.description}</div>

                </div>
                {task.url && (
                    <Link href={task.url.startsWith('http') ? task.url : `https://${task.url}`} target="_blank">
                        <Button className="p-1 bg-accent text-sm text-muted-foreground underline decoration-none cursor-pointer hover:text-secondary transition-all duration-200 flex gap-2 items-center">
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>
            <TaskModal task={task} isOpen={openTaskModal} onClose={() => setOpenTaskModal(false)} />
        </>
    );
}

const monthLabel = (date) => date.toLocaleDateString('he-IL', { month: 'short' })
const dateLabel = (date) => date.toLocaleDateString('he-IL', { day: 'numeric' })



// Simple drop indicator component
const DropIndicator = ({ edge, gap }) => (
    <div
        className={`absolute top-0 bottom-0 h-0.5 bg-muted0 z-10 ${edge === 'right' ? '-right-1' : '-left-1'}`}
        style={{ margin: gap || '2px' }}
    />
);
