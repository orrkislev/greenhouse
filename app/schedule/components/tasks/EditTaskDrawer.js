import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/DatePicker";
import { useUserSchedule } from "@/app/schedule/utils/useUserSchedule";
import { format } from "date-fns";

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
            setStartDate(task.start ||  null);
            setEndDate(task.end || null);
        } else {
            setTitle("");
            setStartDate(null);
            setEndDate(null);
        }
    }, [task]);

    const handleSave = async (e) => {
        e.preventDefault();

        const taskData = { title, 
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(endDate, 'yyyy-MM-dd')
        };

        if (task?.id) {
            updateTask(task.id, taskData);
        } else {
            addTask(taskData);
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
                    <DrawerTitle>עריכת משימה</DrawerTitle>
                </DrawerHeader>
                <form className="flex flex-col gap-4 p-4" onSubmit={handleSave}>
                    <div>
                        <label className="block text-sm font-medium mb-1">מה המשימה</label>
                        <Input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="הכנס שם משימה"
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">תאריך התחלה</label>
                        <DatePicker 
                            initial={startDate}
                            onChange={setStartDate}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">תאריך סיום</label>
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
                                מחק
                            </Button>
                        )}
                        <DrawerClose asChild>
                            <Button type="button" variant="outline">ביטול</Button>
                        </DrawerClose>
                        <Button type="submit">
                            {task ? "עדכן" : "צור משימה חדשה"}
                        </Button>
                    </div>
                </form>
            </DrawerContent>
        </Drawer>
    );
}