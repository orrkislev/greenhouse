import { tw } from "@/utils/tw";
import { BookmarkCheck } from "lucide-react";
import { useWeek } from "../../utils/useWeek";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";
import TaskContext from "./TaskContext";

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
                <TaskContext task={task} onClose={() => setIsSelected(false)} />
            </PopoverContent>
        </Popover>
    );
}