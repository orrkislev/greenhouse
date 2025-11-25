import { Check, ExternalLink, GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import Button from "@/components/Button";
import TaskModal from "@/components/TaskModal";
import { projectActions, projectUtils, useProjectData } from "@/utils/store/useProject";
import Link from "next/link";

export default function ListView() {
    const tasks = useProjectData((state) => state.tasks);
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    const onReorder = (orderedTasks) => {
        orderedTasks.forEach((orderedTask, index) => {
            const task = tasks.find(task => task.id === orderedTask.id);
            projectActions.updateTask(task.id, { position: index });
        });
    }

    return (
        <div className="divide-y divide-stone-200">
            <Reorder.Group values={activeTasks} onReorder={onReorder}>
                {activeTasks.sort((a, b) => a.position - b.position).map((task) => (
                    <SingleTask key={task.id} task={task} />
                ))}
            </Reorder.Group>

            {completedTasks.sort((a, b) => a.position - b.position).map((task) => (
                <SingleTask key={task.id} task={task} />
            ))}
        </div>
    );
}

function SingleTask({ task }) {
    const controls = useDragControls();
    const [openTaskModal, setOpenTaskModal] = useState(false);

    const isActive = task.status === 'todo' || task.status === 'in_progress';

    const ParentItem = isActive ? Reorder.Item : 'div';
    const ParentItemProps = isActive ? {
        value: task,
        dragListener: false,
        dragControls: controls,
        className: 'flex gap-4 w-full items-center hover:bg-muted py-1 group bg-muted my-2',
    } : {
        key: task.id,
        className: 'flex gap-4 w-full items-center hover:bg-muted py-1 group opacity-60 my-2',
    };

    return (
        <>
            <ParentItem key={task.id} {...ParentItemProps}>
                {isActive && <GripVertical className="w-4 h-4" onMouseDown={(e) => controls.start(e)} />}
                <div className={`flex items-center gap-4 ${task.status === 'completed' ? 'opacity-80' : ''}`}>
                    {task.status === 'completed' && <Check className="w-4 h-4" />}
                    <div className='flex items-center gap-2 hover:underline decoration-dashed cursor-pointer'  onClick={() => setOpenTaskModal(true)}>
                        <div className="text-sm text-foreground">{task.title}</div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                        {task.url && (
                            <Link href={task.url.startsWith('http') ? task.url : `https://${task.url}`} target="_blank">
                                <Button className="p-1 bg-accent text-sm text-muted-foreground underline decoration-none cursor-pointer hover:text-secondary transition-all duration-200 flex gap-2 items-center">
                                    <ExternalLink className="w-4 h-4" />
                                    {task.url.length > 20 ? task.url.slice(0, 20) + '...' : task.url}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </ParentItem>
            <TaskModal task={{...task, context: projectUtils.getContext(task.project_id)}} isOpen={openTaskModal} onClose={() => setOpenTaskModal(false)} />
        </>
    )
}