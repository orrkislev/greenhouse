import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GroupEventEdit } from "./GroupEventEdit";
import { tw } from "@/utils/tw";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { groupsActions } from "@/utils/store/useGroups";
import { useUser } from "@/utils/store/useUser";

const GroupObjectCellDiv = tw.div`bg-[#C4BBB2] flex-1 hover:bg-[#9F8770] cursor-pointer hover:text-white transition-all`;
const GroupObjectText = tw`h-full 
        flex items-center justify-center gap-2 text-center 
        whitespace-pre-line py-1 cursor-pointer text-xs
    `;

export function GroupCellEvent({ groupId, date, event, edittable }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <GroupObjectCellDiv>
                    <GroupObjectText>
                        <div>{event.start} - {event.end}</div>
                        <div>{event.title}</div>
                    </GroupObjectText>
                </GroupObjectCellDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 border border-stone-300 z-[999]">
                {edittable ? (
                    <GroupEventEdit
                        onClose={() => setIsOpen(false)}
                        groupId={groupId}
                        date={date}
                        event={event}
                    />
                ) : (
                    <AcceptEventModal
                        onClose={() => setIsOpen(false)}
                        groupId={groupId}
                        event={event}
                    />
                )}
            </PopoverContent>
        </Popover >
    );
}

function AcceptEventModal({ groupId, event, onClose }) {

    const handleAccept = async () => {
        groupsActions.joinGroupEvent(groupId, event.id, useUser.getState().user.id)
        onClose()
    };

    return (
        <Button onClick={handleAccept}>
            כן
        </Button>
    );
}