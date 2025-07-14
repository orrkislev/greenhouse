import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NewGroupObjectModal } from "./NewGroupObjectModal";
import { tw } from "@/utils/tw";
import AcceptObjectModal from "./AcceptObjectModal";

const GroupObjectCellDiv = tw.div`bg-[#C4BBB2] flex-1 hover:bg-[#9F8770] cursor-pointer hover:text-white transition-all`;
const GroupObjectText = tw`h-full 
        flex items-center justify-center gap-2 text-center 
        whitespace-pre-line py-1 cursor-pointer text-xs
    `;

export function GroupCellObject({ groupName, dateString, obj, edittable }) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <GroupObjectCellDiv>
                    <GroupObjectText>
                        {obj.type === 'event' && (
                            <div>{obj.timeRange.start} - {obj.timeRange.end}</div>
                        )}
                        <div>{obj.text}</div>
                    </GroupObjectText>
                </GroupObjectCellDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-gray-300 z-[999]">
                {edittable ? (
                    <NewGroupObjectModal
                        onClose={() => setIsOpen(false)}
                        groupName={groupName}
                        dateString={dateString}
                        obj={obj}
                    />
                ) : (
                    <AcceptObjectModal
                        groupName={groupName}
                        dateString={dateString}
                        obj={obj}
                    />
                )}
            </PopoverContent>
        </Popover >
    );
}