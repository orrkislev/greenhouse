import { tw } from "@/utils/tw";
import { BookmarkCheck } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";
import TaskContext from "./TaskContext";

const TaskDiv = tw`bg-[#F3B580]
        flex items-center justify-center gap-2 text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        hover:bg-[#F3A05B] transition-all z-10
        py-1
`;

export function Task({task}) {
    const [isSelected, setIsSelected] = useState(false);

    return (
        <Popover open={isSelected} onOpenChange={setIsSelected}>
            <PopoverTrigger asChild>
                <TaskDiv>
                    {task.isMember && <BookmarkCheck className='w-4 h-4' />}
                    {task.title}
                </TaskDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <TaskContext task={task} onClose={() => setIsSelected(false)} />
            </PopoverContent>
        </Popover>
    );
}