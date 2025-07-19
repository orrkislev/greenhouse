import { useState } from "react";
import { tw } from "@/utils/tw";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useUser } from "@/utils/useUser";
import { groupsActions } from "@/utils/useGroups"
import { eventsActions } from "@/utils/useEvents";

const EventDiv = tw`
    bg-[#EF98A1] py-2 px-4 text-gray-800
    flex flex-col justify-center text-sm
    pointer-events-auto cursor-pointer transition-colors duration-200
    z-5 hover:bg-[#E77885] stripes outline-2 outline-white
`;

export function ReadOnlyEvent({ event, onSelect }) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <EventDiv style={event.gridStyle} onClick={() => setIsPopoverOpen(true)}>
                    <div className="font-medium truncate">{event.title}</div>
                </EventDiv>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" sideOffset={5}>
                <GroupEventContext event={event} onClose={() => setIsPopoverOpen(false)} />
            </PopoverContent>
        </Popover>
    );
}

function GroupEventContext({ event, onClose }) {
    const userId = useUser(state => state.user.id);

    const handleRemove = () => {
        groupsActions.leaveGroupEntry(event.group, event.id, userId)
        eventsActions.removeGroupEvent(event.id);
        onClose();
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">אירוע של קבוצת {event.group}</h3>
            <p className="mb-4">האם אתה רוצה לעזוב את האירוע הזה?</p>
            <Button variant="destructive" onClick={handleRemove}>
                עזוב אירוע
            </Button>
            <Button variant="outline" onClick={onClose} className="ml-2">
                סגור
            </Button>
        </div>
    )
}
