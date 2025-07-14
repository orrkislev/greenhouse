import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NewGroupObjectModal } from "./NewGroupObjectModal";
import { tw } from "@/utils/tw";
import AcceptObjectModal from "./AcceptObjectModal";
import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

const GroupObjectCellDiv = tw.div`bg-[#C4BBB2] flex-1 hover:bg-[#9F8770] cursor-pointer hover:text-white transition-all`;
const GroupObjectText = tw`h-full 
        flex items-center justify-center gap-2 text-center 
        whitespace-pre-line py-1 cursor-pointer text-xs
    `;

export function GroupCellObject({ groupName, date, obj, edittable }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <GroupObjectCellDiv>
                    <GroupObjectText>
                        {obj.type === 'event' ? (
                            <div>{obj.timeRange.start} - {obj.timeRange.end}</div>
                        ) : (
                            <div>
                                {obj.isMember ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </div>
                        )}
                        <div>{obj.title}</div>
                    </GroupObjectText>
                </GroupObjectCellDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-gray-300 z-[999]">
                {edittable ? (
                    <NewGroupObjectModal
                        onClose={() => setIsOpen(false)}
                        groupName={groupName}
                        date={date}
                        obj={obj}
                    />
                ) : (
                    <AcceptObjectModal
                        onClose={() => setIsOpen(false)}
                        groupName={groupName}
                        obj={obj}
                    />
                )}
            </PopoverContent>
        </Popover >
    );
}