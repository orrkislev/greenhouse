import { Check, GripVertical, Trash, X } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import { projectTasksActions, useProjectTasks } from "@/utils/useProjectTasks";

export default function ListView() {
    const tasks = useProjectTasks((state) => state.tasks);

    // Separate completed and non-completed tasks
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    const onReorder = (newActiveTasks) => {
        // Preserve completed tasks at the end when reordering
        const allTasks = [...newActiveTasks, ...completedTasks];
        projectTasksActions.setTasks(allTasks);
    }

    return (
        <div className="divide-y divide-gray-200">
            {/* Draggable active tasks */}
            <Reorder.Group values={activeTasks} onReorder={onReorder}>
                {activeTasks.map((task) => (
                    <SingleTask key={task.id} task={task} isDraggable={true} />
                ))}
            </Reorder.Group>

            {/* Non-draggable completed tasks */}
            {completedTasks.map((task) => (
                <SingleTask key={task.id} task={task} isDraggable={false} />
            ))}
        </div>
    );
}

function SingleTask({ task, isDraggable = true }) {
    const controls = useDragControls();

    if (!isDraggable) {
        // Non-draggable completed task - non-editable and no delete button
        return (
            <div className='flex gap-4 w-full items-center hover:bg-gray-100 py-1 group opacity-60'>
                <div className="w-4 h-4"></div> {/* Placeholder for grip space */}
                <div className="flex justify-between items-center w-full">
                    <div className="flex-1 text-sm text-gray-500">
                        {task.title || ''}
                    </div>
                    <div className="flex-1 text-sm text-gray-500">
                        {task.description || ''}
                    </div>
                    <div className="w-6 h-6"></div> {/* Placeholder for delete button space */}
                </div>
            </div>
        );
    }

    return (
        <Reorder.Item key={task.id}
            className='flex gap-4 w-full items-center hover:bg-gray-100 py-1 group'
            value={task}
            dragListener={false}
            dragControls={controls}
        >
            <GripVertical className="w-4 h-4" onMouseDown={(e) => controls.start(e)} />
            <div className="flex justify-between items-center w-full">
                <EditLabel task={task} field="title" />
                <EditLabel task={task} field="description" />
                <div className="flex items-center gap-2">
                    <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors rounded-full p-1 opacity-0 group-hover:opacity-100"
                        onClick={() => projectTasksActions.completeTask(task.id)}>
                        <Check className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors rounded-full p-1 opacity-0 group-hover:opacity-100"
                        onClick={() => projectTasksActions.deleteTask(task.id)}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    )
}



function EditLabel({ task, field }) {
    const [editing, setEditing] = useState(false);

    const update = (newValue) => {
        projectTasksActions.updateTask(task.id, { [field]: newValue });
    }

    return (
        <div className="flex-1 text-sm">
            {editing ? (
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
                <div onClick={() => setEditing(true)} className="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors user-select-none">
                    {task[field] || ''}
                </div>
            )}
        </div>
    )
}