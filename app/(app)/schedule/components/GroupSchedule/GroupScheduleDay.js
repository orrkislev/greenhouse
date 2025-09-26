import { tw } from "@/utils/tw";
import { GroupCellEvent } from "./GroupCellEvent";
import { NewGroupEvent } from "./NewGroupEvent";

const GroupCellDiv = tw`bg-white flex flex-col h-full gap-[2px]
    ${props => !props.$edittable ? 'bg-[#C4BBB2]/60' : ''}
    `;

export default function GroupScheduleDay({ date, groupId, edittable, events = [] }) {

    if (events.length == 0 && !edittable) {
        return (
            <GroupCellDiv $edittable={edittable}>
                <div className="h-5" />
            </GroupCellDiv>
        );
    }

    return (
        <GroupCellDiv $edittable={edittable}>
            {events.map((event, index) => (
                <GroupCellEvent key={index} {...{ groupId, date, event, edittable }} />
            ))}
            {edittable && <NewGroupEvent {...{ groupId, date }} />}
        </GroupCellDiv>
    );
}
