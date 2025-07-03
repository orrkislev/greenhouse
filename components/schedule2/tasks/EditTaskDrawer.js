import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { useUserSchedule } from "@/utils/store/scheduleDataStore";
import { formatDate, parseDate } from "@/utils/utils";

export default function EditTaskDrawer({ open, onClose, task }) {
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    
    const updateTask = useUserSchedule(state => state.updateTask);
    const addTask = useUserSchedule(state => state.addTask);
    const deleteTask = useUserSchedule(state => state.deleteTask);

    useEffect(() => {
        if (task) {
            setTitle(task.title || "");
            setStartDate(task.start ? parseDate(task.start) : null);
            setEndDate(task.end ? parseDate(task.end) : null);
        } else {
            setTitle("");
            setStartDate(null);
            setEndDate(null);
        }
    }, [task]);

    const handleSave = async (e) => {
        e.preventDefault();

        const taskData = {
            title,
            start: formatDate(startDate),
            end: formatDate(endDate),
        };

        if (task?.id) {
            // Update existing task
            updateTask(task.id, taskData);
        } else {
            // Create new task
            const newTask = {
                ...taskData,
                id: Date.now().toString(), // Simple ID generation
            };
            addTask(newTask);
        }
        
        onClose();
    };

    const handleDelete = () => {
        deleteTask(task.id);
        onClose();
    };

    return (
        <Drawer open={open} onOpenChange={onClose} direction="right">
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{task ? "Edit Task" : "New Task"}</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSave}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Task Title</label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="Enter task title"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <DatePicker 
                            initial={startDate}
                            onChange={setStartDate}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <DatePicker 
                            initial={endDate}
                            onChange={setEndDate}
                        />
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-4">
                        {task?.id && (
                            <Button 
                                type="button" 
                                variant="destructive" 
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DrawerClose>
                        <Button type="submit">
                            {task ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}