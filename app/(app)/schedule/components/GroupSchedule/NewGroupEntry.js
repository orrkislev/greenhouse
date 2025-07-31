import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { tw } from "@/utils/tw";
import { GroupEntryEdit } from "./GroupEntryEdit";
import { useState } from "react";

const AddObjectDiv = tw`flex items-center justify-center text-gray-800 text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-gray-800/30 hover:text-gray-800
        ${props => props.$active ? 'bg-[#FADFC1] text-gray-800' : ''}
        z-5 flex-1
`;



export function NewGroupEntry({ groupId, date }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <AddObjectDiv onClick={() => setIsOpen(true)} $active={isOpen}>
                    +
                </AddObjectDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-gray-300 z-[999]">
                <GroupEntryEdit
                    onClose={() => setIsOpen(false)}
                    groupId={groupId}
                    date={date}
                />
            </PopoverContent>
        </Popover>
    );
}