import { useEffect } from "react";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { useTime } from "@/utils/store/useTime";
import { ScheduleSection } from "../Layout";
import GroupScheduleDay from "./GroupScheduleDay";
import { isStaff } from "@/utils/store/useUser";

export default function GroupSchedules() {
    const groups = useUserGroups();

    const groupIds = groups.map(g => g.id).join(',');

    useEffect(() => {
        groupsActions.loadWeekEvents();
    }, [groupIds]);

    return groups.map(group => <GroupSchedule key={group.id} group={group} />)
}




function GroupSchedule({ group }) {
    const week = useTime(state => state.week);

    const weekEvents = week.map(date => {
        return { date, events: group.events ? group.events[date] : [] };
    });

    const edittable = isStaff()

    return (
        <ScheduleSection edittable={edittable} name={group.name}>
            {weekEvents.map(({ date, events }, index) => (
                <GroupScheduleDay key={index}
                    date={date}
                    groupId={group.id}
                    edittable={edittable}
                    events={events}
                />
            ))}
        </ScheduleSection>
    );
}