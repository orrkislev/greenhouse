import { GripVertical, Trash } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import { projectTasksActions, useProjectTasks } from "@/utils/useProjectTasks";

export default function ListView() {
    const tasks = useProjectTasks((state) => state.tasks);

    const onReorder = (newTasks) => {
        projectTasksActions.setTasks(newTasks);
    }
    return (
        <Reorder.Group className="divide-y divide-gray-200" values={tasks} onReorder={onReorder}>
            {tasks.map((task) => (
                <SingleTask key={task.id} task={task} />
            ))}
        </Reorder.Group>
    );
}

function SingleTask({ task}) {
    const controls = useDragControls();

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
                <button className="bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors rounded-full p-1 opacity-0 group-hover:opacity-100"
                    onClick={() => projectTasksActions.deleteTask(task.id)}>
                    <Trash className="w-4 h-4" />
                </button>
            </div>
        </Reorder.Item>
    )
}



function EditLabel({ task, field}) {
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