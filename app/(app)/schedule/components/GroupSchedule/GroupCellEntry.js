import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GroupEntryEdit, NewGroupObjectModal } from "./GroupEntryEdit";
import { tw } from "@/utils/tw";
import AcceptObjectModal from "./AcceptObjectModal";
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import GroupEntryContext from "./AcceptObjectModal";

const GroupObjectCellDiv = tw.div`bg-[#C4BBB2] flex-1 hover:bg-[#9F8770] cursor-pointer hover:text-white transition-all`;
const GroupObjectText = tw`h-full 
        flex items-center justify-center gap-2 text-center 
        whitespace-pre-line py-1 cursor-pointer text-xs
    `;

export function GroupCellEntry({ groupId, date, obj, edittable }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <GroupObjectCellDiv>
                    <GroupObjectText>
                        <div>{obj.start} - {obj.end}</div>
                        <div>{obj.title}</div>
                    </GroupObjectText>
                </GroupObjectCellDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-gray-300 z-[999]">
                {edittable ? (
                    <GroupEntryEdit
                        onClose={() => setIsOpen(false)}
                        groupId={groupId}
                        date={date}
                        obj={obj}
                    />
                ) : (
                    <GroupEntryContext
                        onClose={() => setIsOpen(false)}
                        groupId={groupId}
                        obj={obj}
                    />
                )}
            </PopoverContent>
        </Popover >
    );
}