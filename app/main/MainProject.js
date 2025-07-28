import { tw } from "@/utils/tw";
import { useProject } from "@/utils/useProject";
import { useProjectTasks } from "@/utils/useProjectTasks";
import { ta } from "date-fns/locale";
import { Check, ChevronLeft, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function MainProject() {
    const project = useProject((state) => state.project);

    return (
        <div className='flex flex-col'>
            <div className='text-xs text-gray-600'>הפרויקט שלי</div>
            <div className='mr-2'>
                {project ? <MainProjectContent /> : <div>אין פרויקט</div>}
            </div>
        </div>
    );
}

function MainProjectContent() {
    const project = useProject((state) => state.project);
    const tasks = useProjectTasks((state) => state.tasks);
    const view = useProjectTasks((state) => state.view);

    useEffect(() => {
        useProjectTasks.getState().loadNextTasks();
    }, []);
    return (
        <div className='flex flex-col gap-2 p-4 border-b border-gray-200'>
            <div className='flex gap-16 items-center'>
                <div className='mr-2'>{project.name}</div>
                <Link href="/project">
                    <div className='flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-full hover:bg-gray-100 transition-all'>
                        <div className='text-sm'>ניהול משימות</div>
                        <ChevronLeft className='inline w-4 h-4 text-gray-500' />
                    </div>
                </Link>
            </div>

            {tasks.length === 0 ? (
                <div className='text-gray-500 text-center p-4'>אין משימות</div>
            ) : (
                <div className='flex flex-col gap-2'>
                    {view === 'list' && (
                        <>
                            <div>המשימה הבאה</div>
                            <Task key={tasks[0].id} tag="next" task={tasks[0]} />
                        </>
                    )}
                    {view === 'weekly' && (
                        <>
                            {tasks.filter(tasks => tasks.mark === 'overdue').map(task => (
                                <Task key={task.id} tag="overdue" task={task} description={'מטרה באיחור'} />
                            ))}

                            {tasks.filter(task => task.mark === 'week').length > 0 && (
                                <>
                                    <div className='text-xs text-gray-600'>מטרות שבועיות</div>
                                    {tasks.filter(task => task.mark === 'week').map(task => (
                                        <Task key={task.id} tag="active" task={task} />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                    {view === 'calendar' && (
                        <>
                            {tasks.filter(task => task.mark === 'overdue').length > 0 && (
                                <Task key={task.id} tag="overdue" task={task} description={'משימה באיחור'} />
                            )}

                            {tasks.filter(task => task.mark === 'today').length > 0 && (
                                <>
                                    <div className='text-xs text-gray-600'>משימות להיום</div>
                                    {tasks.filter(task => task.mark === 'today').map(task => (
                                        <Task key={task.id} tag="active" task={task} />
                                    ))}
                                </>
                            )}

                            {tasks.filter(task => task.mark === 'next').length > 0 && (
                                <>
                                    <div className='text-xs text-gray-600'>המשימה הבאה</div>
                                    {tasks.filter(task => task.mark === 'next').map(task => (
                                        <Task key={task.id} tag="next" task={task} />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

const TaskPill = tw`
    text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full
    ${props => props.tag === 'overdue' && 'bg-red-200 text-red-800'}
    ${props => props.tag === 'active' && 'bg-green-200 text-green-800'}
    ${props => props.tag === 'next' && 'bg-yellow-200 text-yellow-800'}
`;

function Task({ task, description, tag }) {
    const onCheck = () => { }
    const onDelete = () => { }
    return (
        <div key={task.id} className='flex items-center gap-2 group'>
            <TaskPill tag={tag}>
                {task.title}
                <span className='text-xs text-gray-500'> ({description || task.description})</span>
            </TaskPill>
            <div className='flex gap-2 items-center group-hover:opacity-100 opacity-0 transition-opacity'>
                <button className='p-1 border border-gray-200 hover:bg-gray-200 rounded-full' onClick={onCheck}>
                    <Check className='w-4 h-4' />
                </button>
                <button className='border border-gray-200 hover:bg-gray-200 rounded-full' onClick={onDelete}>
                    <Trash className='w-4 h-4' />
                </button>
            </div>
        </div>
    )
}