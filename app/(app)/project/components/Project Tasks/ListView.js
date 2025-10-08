import { Check, CheckSquare, GripVertical, Square, Trash, X } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import { projectTasksActions, useProjectTasksData } from "@/utils/store/useProjectTasks";
import { IconButton } from "@/components/Button";
import TaskModal from "@/components/TaskModal";

export default function ListView() {
    const tasks = useProjectTasksData((state) => state.tasks);

    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    const onReorder = (orderedTasks) => {
        orderedTasks.forEach((orderedTask, index) => {
            const task = tasks.find(task => task.id === orderedTask.id);
            projectTasksActions.updateTask(task.id, { position: index });
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
        className: 'flex gap-4 w-full items-center hover:bg-stone-100 py-1 group bg-stone-100 my-2',
    } : {
        key: task.id,
        className: 'flex gap-4 w-full items-center hover:bg-stone-100 py-1 group opacity-60 my-2',
    };

    return (
        <>
            <ParentItem key={task.id} {...ParentItemProps}>
                {isActive && <GripVertical className="w-4 h-4" onMouseDown={(e) => controls.start(e)} />}
                <div className={`flex items-center gap-4 ${task.status === 'completed' ? 'opacity-80' : ''}`}>
                    {task.status === 'completed' && <Check className="w-4 h-4" />}
                    {/* {task.status === 'completed' ? (
                        <IconButton icon={Check} className={`border-sky-300 text-sky-600`}
                            onClick={() => projectTasksActions.updateTask(task.id, { status: 'todo' })}
                        />
                    ) : (
                        <IconButton icon={Square} className={`group-hover:opacity-100 opacity-0 transition-opacity`}
                            onClick={() => projectTasksActions.completeTask(task.id)} />
                    )} */}
                    {/* <EditLabel task={task} field="title" className="font-semibold" edittable={isActive} /> */}
                    {/* <EditLabel task={task} field="description" className="" edittable={isActive} /> */}
                    <div className='flex items-center gap-2 hover:underline decoration-dashed cursor-pointer'  onClick={() => setOpenTaskModal(true)}>
                        <div className="text-sm text-stone-700">{task.title}</div>
                        <div className="text-xs text-stone-500">{task.description}</div>
                    </div>
                    {/* <div className="flex gap-2">
                        <IconButton icon={X} onClick={() => projectTasksActions.deleteTask(task.id)} />
                    </div> */}
                </div>
            </ParentItem>
            <TaskModal task={task} isOpen={openTaskModal} onClose={() => setOpenTaskModal(false)} />
        </>
    )
}



function EditLabel({ task, field, className, edittable }) {
    const [editing, setEditing] = useState(false);

    const update = (newValue) => {
        projectTasksActions.updateTask(task.id, { [field]: newValue });
    }

    return (
        <div className={`text-sm ${className}`}>
            {editing && edittable ? (
                <input
                    type="text"
                    defaultValue={task[field]}
                    autoFocus
                    onBlur={e => {
                        update(e.target.value);
                        setEditing(false);
                    }}
                    className="border rounded px-2 py-1"
                />
            ) : (
                <div onClick={() => setEditing(true)} className={`cursor-pointer text-stone-700 hover:text-stone-900 transition-colors user-select-none decoration-dashed ${className} ${edittable ? 'hover:underline' : ''}`}>
                    {task[field] || ''}
                </div>
            )}
        </div>
    )
}