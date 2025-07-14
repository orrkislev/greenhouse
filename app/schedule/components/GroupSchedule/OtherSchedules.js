import { useUser } from "@/utils/useUser";
import { useEffect, useState } from "react";
import { getGroupData, getGroupScheduleForDay, isGroupAdmin, subscribeToGroupScheduleForDay } from "./groupschedule actions";
import { ScheduleSection } from "../Layout";
import { tw } from "@/utils/tw";
import { useWeek } from "@/app/schedule/utils/useWeek";
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
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        getGroupScheduleForDay(groupName, formatDate(date)).then(({ tasks, events }) => {
            if (tasks && tasks.length !== 0) setTasks(tasks);
            if (events && events.length !== 0) setEvents(events);
        });
        const unsubscribe = subscribeToGroupScheduleForDay(groupName, formatDate(date), newObjects => {
            if (newObjects.type === 'tasks' && newObjects.data) {
                setTasks(prev => [...prev, ...newObjects.data]);
            } else if (newObjects.type === 'events') {
                setEvents(prev => [...prev, ...newObjects.data]);
            }
        });

        return unsubscribe;
    }, [date, groupName]);

    if (tasks.length == 0 && events.length == 0 && !edittable) {
        return (
            <GroupCellDiv $edittable={edittable}>
                <div className="h-5" />
            </GroupCellDiv>
        );
    }

    return (
        <GroupCellDiv $edittable={edittable}>
            {[...tasks, ...events].map((obj, index) => (
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

