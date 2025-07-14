import { tw } from "@/utils/tw";
import { BookmarkCheck } from "lucide-react";
import { useWeek } from "../../utils/useWeek";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { leaveGroupEntry, removeGroupEntry } from "../../utils/groupschedule actions";
import { useUser } from "@/utils/useUser";
import { Input } from "@/components/ui/input";
import { useUserSchedule } from "../../utils/useUserSchedule";

const TaskDiv = tw`bg-[#F3B580]
        flex items-center justify-center gap-2 text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        hover:bg-[#F3A05B] transition-all z-10
        py-1
`;

export function Task({ task, onClick, row }) {
    const [isSelected, setIsSelected] = useState(false);
    const week = useWeek(state => state.week);

    let dayStartIndex = week.findIndex(date => date === task.start);
    let dayEndIndex = week.findIndex(date => date === task.end);

    if (dayStartIndex === -1) dayStartIndex = 0;
    if (dayEndIndex === -1) dayEndIndex = week.length - 1

    return (
        <Popover open={isSelected} onOpenChange={setIsSelected}>
            <PopoverTrigger asChild>
                <TaskDiv className={`col-start-${dayStartIndex + 1} col-end-${dayEndIndex + 2} row-${row}`}
                    onClick={onClick}
                >
                    {task.isMember && <BookmarkCheck className='w-4 h-4' />}
                    {task.title}
                </TaskDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                {task.isMember ? (
                    <GroupTaskContext task={task} onClose={() => setIsSelected(false)} />
                ) : (
                    <EditTask task={task} onClose={() => setIsSelected(false)} />
                )}
            </PopoverContent>
        </Popover>
    );
}


function GroupTaskContext({ task, onClose }) {
    const userId = useUser(state => state.user.id);
    const removeGroupTask = useUserSchedule(state => state.removeGroupTask);

    const handleRemove = () => {
        leaveGroupEntry(task.group, task.id, userId)
        removeGroupTask(task.id);
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
    const updateTask = useUserSchedule(state => state.updateTask);
    const deleteTask = useUserSchedule(state => state.deleteTask);
    
    const handleUpdate = () => {
        const updatedTask = { ...task, title };
        updateTask(task.id, updatedTask);
        onClose();
    };

    const handleDelete = () => {
        deleteTask(task.id);
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
