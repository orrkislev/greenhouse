import { tw } from "@/utils/tw";
import { GroupEventEdit } from "./GroupEventEdit";
import usePopper from "@/components/Popper";

const AddObjectDiv = tw`flex items-center justify-center text-foreground text-sm
        pointer-events-auto cursor-pointer 
        transition-all bg-[#FADFC199] hover:bg-[#FADFC1]
        text-foreground/30 hover:text-foreground
        ${props => props.$active ? 'bg-[#FADFC1] text-foreground' : ''}
        z-5 flex-1
`;



export function NewGroupEvent({ groupId, date }) {
    const { open, close, Popper, baseRef } = usePopper();

    return (
        <>
            <AddObjectDiv ref={baseRef} onClick={open}>+</AddObjectDiv>
            <Popper>
                <GroupEventEdit onClose={close} groupId={groupId} date={date} />
            </Popper>
        </>
    );
}