import { useUser } from "@/utils/useUser";
import { useEffect, useState } from "react";
import { getGroupData, getGroupEntriesForWeek, isGroupAdmin } from "../../utils/groupschedule actions";
import { ScheduleSection } from "../Layout";
import { tw } from "@/utils/tw";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { NewGroupObjectButton } from "./NewGroupObjectModal";
import { GroupCellObject } from "./GroupCellObject";

export default function OtherSchedules() {
    const groups = useUser(state => state.user.groups);
    return groups.map((group, index) => (
        <GroupSchedule key={index} groupName={group} />
    ));
}




function GroupSchedule({ groupName }) {
    const userId = useUser(state => state.user.id);
    const [groupData, setGroupData] = useState(null);
    const week = useWeek(state => state.week);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        getGroupData(groupName).then(data => {
            setGroupData(data);
        })
    }, [groupName]);

    useEffect(() => {
        if (!groupName || !week || week.length === 0) return;
        (async () => {
            const { entries, subscribe: eventSubscribe } = await getGroupEntriesForWeek(groupName, week);
            setEntries(entries);
            const unsubscribe = eventSubscribe(setEntries);
            return unsubscribe;
        })();
    }, [week, groupName]);

    if (!groupData || !week || week.length === 0) {
        return <div className="p-4 border rounded mb-4">Loading...</div>;
    }

    const edittable = isGroupAdmin(groupData, userId)

    return (
        <ScheduleSection edittable={edittable} name={groupName}>
            {week.map((date, index) => (
                <GroupCell key={index}
                    {...{ date, groupName, edittable }}
                    entries={entries.filter(entry => entry.date === date)}
                />
            ))}
        </ScheduleSection>
    );
}


const GroupCellDiv = tw`bg-white flex flex-col h-full gap-[2px]
    ${props => !props.$edittable ? 'bg-[#C4BBB2]/60' : ''}
    `;

function GroupCell({ date, groupName, edittable, entries = [] }) {

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
                <GroupCellObject key={index} {...{ groupName, date, obj, edittable }} />
            ))}
            {edittable && <NewGroupObjectButton {...{ groupName, date }} />}
        </GroupCellDiv>
    );
}

