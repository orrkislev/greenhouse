import { GroupEventEdit } from "./GroupEventEdit";
import { tw } from "@/utils/tw";
import usePopper from "@/components/Popper";

const GroupObjectCellDiv = tw.div`bg-[#C4BBB2] flex-1 hover:bg-[#9F8770] cursor-pointer hover:text-white transition-all`;
const GroupObjectText = tw`h-full 
        flex items-center justify-center gap-2 text-center 
        whitespace-pre-line py-1 cursor-pointer text-xs
    `;

export function GroupCellEvent({ groupId, date, event, edittable }) {
    const { open, close, Popper, baseRef } = usePopper();

    return (
        <>
            <GroupObjectCellDiv ref={baseRef} onClick={() => edittable && open()}>
                <GroupObjectText>
                    <div>{event.start} - {event.end}</div>
                    <div>{event.title}</div>
                </GroupObjectText>
            </GroupObjectCellDiv>
            {edittable && <Popper>
                <GroupEventEdit onClose={close} groupId={groupId} date={date} event={event} />
            </Popper>
            }
        </>
    )
}