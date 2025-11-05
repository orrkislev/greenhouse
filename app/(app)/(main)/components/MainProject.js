import { tw } from "@/utils/tw";
import { projectUtils, useProject, useProjectData } from "@/utils/store/useProject";
import { Bird, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import Box2 from "@/components/Box2";
import Image from "next/image";
import Button, { IconButton } from "@/components/Button";
import { useState } from "react";
import TaskModal from "@/components/TaskModal";
import CoverZoomCard from "@/components/CoverZoomCard";
import ProjectTasks from "../../project/components/Project Tasks/ProjectTasks";
import WithLabel from "@/components/WithLabel";

export default function MainProject() {
    const project = useProject();

    return (
        <Box2 label="הפרויקט שלי" className="flex-1 group/project pb-8 relative" LabelIcon={Bird}>
            <div className='flex flex-col gap-3'>
                {project ? (
                    <>
                        <CoverZoomCard href={`/project/?id=${project.id}`} imageUrl={project.metadata?.image || '/images/fun.png'} label={project.title} key={project.id} />
                        <Tasks />
                    </>
                ) : (
                    <>
                        <div className='flex flex-col items-center justify-center'>
                            <Image src="/images/bored.png" alt="project" width={150} height={150} />
                            <div className='text-stone-500 text-center text-sm'>
                                אין פרויקט פעיל
                            </div>
                        </div>
                        <Link href="/project" className="absolute bottom-2 left-2">
                            <Button>
                                <Bird className="w-4 h-4" />
                                הפרויקט
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </Box2>
    );
}






function Tasks() {
    const tasks = useProjectData((state) => state.tasks);   

    if (tasks?.length === 0) {
        return <div className='text-stone-500 text-center p-4'>אין משימות</div>;
    }

    const nextTasks = tasks
        .sort((a, b) => a.position - b.position)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .filter(task => task.status === 'todo');

    return (
        <WithLabel label="משימות">
            <div className="flex flex-col gap-2">
                <Task key={nextTasks[0].id} task={nextTasks[0]} />
            </div>
        </WithLabel>
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
    const onCheck = () => ProjectTasks.completeTask(task.id);

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