import { tw } from "@/utils/tw";
import { useProject } from "@/utils/store/useProject";
import { projectTasksActions, useProjectNextTasks, useProjectTasksData } from "@/utils/store/useProjectTasks";
import { Check, ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import Box2 from "@/components/Box2";

export default function MainProject() {
    const project = useProject();

    let state = 'no project'
    if (project && project.master) state = 'tasks'
    if (project && !project.master) state = 'proposal'

    return (
        <Box2 label="הפרויקט שלי" className="flex-1group/project pb-8">
            <div className='flex flex-col gap-3'>
                <div className='font-semibold'>
                    {state === 'no project' ? 'אין פרויקט פעיל' : project.name || 'פרויקט חדש'}
                </div>

                {state !== 'no project' && <Tasks />}
            </div>

            <Link href="/project">
                <div className='absolute bottom-2 left-2 flex items-center gap-3 px-2 py-1 border border-stone-300 rounded-full hover:bg-stone-100 transition-all group-hover/project:opacity-100 opacity-0'>
                    <div className='text-xs'>
                        לדף הפרויקט
                    </div>
                    <ChevronLeft className='inline w-4 h-4 text-stone-500' />
                </div>
            </Link>
        </Box2>
    );
}






function Tasks() {
    const tasks = useProjectNextTasks()
    const view = useProjectTasksData((state) => state.view);

    if (tasks.length === 0) {
        return <div className='text-stone-500 text-center p-4'>אין משימות</div>;
    }

    return (
        <div className='flex flex-col gap-2'>
            {view === 'list' && (
                <>
                    <div className='text-xs text-stone-600'>המשימות הבאות</div>
                    {tasks.filter(task => task.completed).slice(0, 2).map(task => (
                        <Task key={task.id} tag="completed" task={task} description={'משימה הושלמה'} />
                    ))}
                    {tasks.filter(task => !task.completed).slice(0, 2).map(task => (
                        <Task key={task.id} tag="next" task={task} />
                    ))}
                </>
            )}
            {view === 'weekly' && (
                <>
                    {tasks.filter(tasks => tasks.mark === 'overdue').map(task => (
                        <Task key={task.id} tag="overdue" task={task} description={'מטרה באיחור'} />
                    ))}

                    {tasks.filter(task => task.mark === 'week').length > 0 && (
                        <>
                            <div className='text-xs text-stone-600'>מטרות שבועיות</div>
                            {tasks.filter(task => task.mark === 'week').map(task => (
                                <Task key={task.id} tag="active" task={task} />
                            ))}
                        </>
                    )}
                </>
            )}
            {view === 'calendar' && (
                <>
                    {tasks.filter(task => task.mark === 'overdue').map(task => (
                        <Task key={task.id} tag="overdue" task={task} description={'משימה באיחור'} />
                    ))}

                    {tasks.filter(task => task.mark === 'today').length > 0 && (
                        <>
                            <div className='text-xs text-stone-600'>משימות להיום</div>
                            {tasks.filter(task => task.mark === 'today').map(task => (
                                <Task key={task.id} tag="active" task={task} />
                            ))}
                        </>
                    )}

                    {tasks.filter(task => task.mark === 'next').length > 0 && (
                        <>
                            <div className='text-xs text-stone-600'>המשימות הבאות</div>
                            {tasks.filter(task => task.mark === 'next').map(task => (
                                <Task key={task.id} tag="next" task={task} description={new Date(task.startDate).toLocaleDateString('he-IL', {
                                    month: 'short',
                                    day: 'numeric',
                                    weekday: 'short'
                                })} />
                            ))}
                        </>
                    )}
                </>
            )}
        </div>
    );
}


export const TaskPill = tw`
    text-sm px-2 py-1 bg-blue-200 text-blue-800 rounded-full
    ${props => props.tag === 'overdue' && 'bg-red-200 text-red-800'}
    ${props => props.tag === 'active' && 'bg-green-200 text-green-800'}
    ${props => props.tag === 'next' && 'bg-yellow-200 text-yellow-800'}
    ${props => props.tag === 'completed' && 'bg-stone-200 text-stone-800'}
`;

function Task({ task, description, tag }) {
    const onCheck = () => {
        projectTasksActions.completeTask(task.id);
    }
    const onDelete = () => {
        projectTasksActions.cancelTask(task.id);
    }

    return (
        <div key={task.id} className='flex items-center gap-2 group/task'>
            <TaskPill tag={tag}>
                {task.title}
                <span className='text-xs text-stone-500'> ({description || task.description})</span>
            </TaskPill>
            {tag != 'completed' && (
                <div className='flex gap-2 items-center group-hover/task:opacity-100 opacity-0 transition-opacity'>
                    <button className='p-1 border border-emerald-400 hover:bg-emerald-200 rounded-full' onClick={onCheck}>
                        <Check className='w-4 h-4 text-emerald-400' />
                    </button>
                    <button className='p-1 border border-rose-400 hover:bg-rose-200 rounded-full' onClick={onDelete}>
                        <X className='w-4 h-4 text-rose-400' />
                    </button>
                </div>
            )}
        </div>
    )
}