import { tw } from "@/utils/tw";
import { GroupCellEntry } from "./GroupCellEntry";
import { NewGroupEntry } from "./NewGroupEntry";

const GroupCellDiv = tw`bg-white flex flex-col h-full gap-[2px]
    ${props => !props.$edittable ? 'bg-[#C4BBB2]/60' : ''}
    `;

export default function GroupCell({ date, groupId, edittable, entries = [] }) {

    if (entries.length == 0 && !edittable) {
        return (
            <GroupCellDiv $edittable={edittable}>
                <div className="h-5" />
            </GroupCellDiv>
        );
    }

    return (
        <GroupCellDiv $edittable={edittable}>
            {entries.map((obj, index) => (
                <GroupCellEntry key={index} {...{ groupId, date, obj, edittable }} />
            ))}
            {edittable && <NewGroupEntry {...{ groupId, date }} />}
        </GroupCellDiv>
    );
}
