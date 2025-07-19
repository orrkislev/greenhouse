import { Button } from "@/components/ui/button";
import { groupsActions } from "@/utils/useGroups";
import { useUser } from "@/utils/useUser";
import { Input } from "@/components/ui/input";
import { tasksActions } from "@/utils/useTasks";
import { useState } from "react";

export default function TaskContext({task, onClose}) {
    if (task.group){
        return <GroupTaskContext task={task} onClose={onClose} />
    } else {
        return <EditTask task={task} onClose={onClose} />
    }
}


function GroupTaskContext({ task, onClose }) {
    const userId = useUser(state => state.user.id);

    const handleRemove = () => {
        groupsActions.leaveGroupEntry(task.group, task.id, userId)
        tasksActions.removeGroupTask(task.id);
        onClose();
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">משימה קבוצתית</h3>
            <p className="mb-4">האם אתה רוצה לעזוב את המשימה הזו?</p>
            <Button variant="destructive" onClick={handleRemove}>
                עזוב משימה
            </Button>
            <Button variant="outline" onClick={onClose} className="ml-2">
                סגור
            </Button>
        </div>
    )
}


function EditTask({ task, onClose }) {
    const [title, setTitle] = useState(task.title || "");

    const handleUpdate = () => {
        const updatedTask = { ...task, title };
        tasksActions.updateTask(task.id, updatedTask);
        onClose();
    };

    const handleDelete = () => {
        tasksActions.deleteTask(task.id);
        onClose();
    };

    return (
        <div>
            <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="הכנס שם משימה"
                required
            />
            <Button onClick={handleUpdate} className="mt-2">
                שמור
            </Button>

            <Button variant="destructive" onClick={handleDelete}>
                מחק
            </Button>
        </div>
    )
}
