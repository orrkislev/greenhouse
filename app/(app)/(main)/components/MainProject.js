import { tw } from "@/utils/tw";
import { projectUtils, useProject } from "@/utils/store/useProject";
import { projectTasksActions, useProjectNextTasks, useProjectTasksData } from "@/utils/store/useProjectTasks";
import { CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import Box2 from "@/components/Box2";
import Image from "next/image";
import { IconButton } from "@/components/Button";
import { useState } from "react";
import TaskModal from "@/components/TaskModal";
import { AvatarGroup } from "@/components/Avatar";

export default function MainProject() {
    const project = useProject();

    const imgUrl = project?.metadata?.image ?
        'url(' + project.metadata.image + ')' :
        'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)'

    return (
        <Box2 label="הפרויקט שלי" className="flex-1 group/project pb-8 relative">
            <div className='flex flex-col gap-3'>
                {project ? (
                    <>

                        <Link href={`/project/?id=${project.id}`}>
                            <div className='w-full aspect-[7/3] relative group/image' style={{ backgroundImage: imgUrl, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-transparent group-hover/image:bg-stone-900/30 transition-all duration-200">
                                    <h1 className="font-bold p-2 bg-white group-hover/image:text-stone-900 group-hover/image:scale-105 transition-all duration-200">{project.title}</h1>
                                </div>
                            </div>
                        </Link>
                        <Tasks />
                        <AvatarGroup users={project.masters} className='absolute bottom-1 left-1' />
                    </>) : (
                    <div className='font-semibold'>
                        אין פרויקט פעיל
                    </div>
                )}
            </div>
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
    ${props => props.status === 'todo' && 'bg-red-200 text-red-800'}
    ${props => props.status === 'in_progress' && 'bg-green-200 text-green-800'}
    ${props => props.status === 'blocked' && 'bg-yellow-200 text-yellow-800'}
    ${props => props.status === 'completed' && 'bg-stone-200 text-stone-800'}
`;

function Task({ task }) {
    const [open, setOpen] = useState(false)
    const onCheck = () => projectTasksActions.completeTask(task.id);

    return (
        <div key={task.id} className='flex items-center gap-2 group/task'>
            <IconButton icon={task.status == 'completed' ? CheckSquare : Square} onClick={onCheck} className="" />
            <div className="flex flex-col hover:underline decoration-dashed cursor-pointer" onClick={() => setOpen(true)}>
                <span className="text-sm text-stone-700">{task.title}</span>
                <span className='text-xs text-stone-500'> {task.description}</span>
            </div>
            <TaskModal task={{ ...task, context: projectUtils.getContext(task.project_id) }} isOpen={open} onClose={() => setOpen(false)} />
        </div>
    )
}