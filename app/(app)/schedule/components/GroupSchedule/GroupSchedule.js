import { useTime } from "@/utils/store/useTime";
import { ScheduleSection } from "../Layout";
import GroupCell from "./GroupCell";
import { groupUtils } from "@/utils/store/useGroups";

export default function GroupSchedule({ group }) {
    const week = useTime(state => state.week);

    const weekEvents = week.map(date => {
        return { date, events: group.events ? group.events[date] : [] };
    });

    const edittable = groupUtils.isMentor(group)

    return (
        <ScheduleSection edittable={edittable} name={group.name}>
            {weekEvents.map(({ date, events }, index) => (
                <GroupCell key={index}
                    date={date} 
                    groupId={group.id} 
                    edittable={edittable}
                    events={events}
                />
            ))}
        </ScheduleSection>
    );
}