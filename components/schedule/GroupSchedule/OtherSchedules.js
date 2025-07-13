import { useUser } from "@/utils/store/user";
import { useEffect, useState } from "react";
import { getGroupData, getGroupScheduleForDay, isGroupAdmin, subscribeToGroupScheduleForDay } from "./groupschedule actions";
import { ScheduleSection } from "../Layout";
import { tw } from "@/utils/tw";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { formatDate } from "@/utils/utils";
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

    useEffect(() => {
        getGroupData(groupName).then(data => {
            setGroupData(data);
        })
    }, [groupName]);

    if (!groupData || !week || week.length === 0) {
        return <div className="p-4 border rounded mb-4">Loading...</div>;
    }

    const edittable = isGroupAdmin(groupData, userId)

    return (
        <ScheduleSection edittable={edittable} name={groupName}>
            {week.map((day, index) => (
                <GroupCell key={index} date={day} groupName={groupName} edittable={edittable} />
            ))}
        </ScheduleSection>
    );
}


const GroupCellDiv = tw`bg-white flex flex-col h-full gap-[2px]
    ${props => !props.$edittable ? 'bg-[#C4BBB2]/60' : ''}
    `;

function GroupCell({ date, groupName, edittable }) {
    const [objects, setObjects] = useState([]);

    useEffect(() => {
        getGroupScheduleForDay(groupName, formatDate(date)).then(objects => {
            if (objects && objects.length !== 0) {
                setObjects(objects);
            }
        });
        const unsubscribe = subscribeToGroupScheduleForDay(groupName, formatDate(date), setObjects);

        return unsubscribe;
    }, [date, groupName]);

    if (objects.length == 0 && !edittable) {
        return (
            <GroupCellDiv $edittable={edittable}>
                <div className="h-5" />
            </GroupCellDiv>
        );
    }

    return (
        <GroupCellDiv $edittable={edittable}>
            {objects.map((obj, index) => (
                <GroupCellObject key={index}
                    groupName={groupName}
                    dateString={formatDate(date)}
                    obj={obj}
                    edittable={edittable}
                />
            ))}
            {edittable && <NewGroupObjectButton groupName={groupName} dateString={formatDate(date)} />}
        </GroupCellDiv>
    );
}

