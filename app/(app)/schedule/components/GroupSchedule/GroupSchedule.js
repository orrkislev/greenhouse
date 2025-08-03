import { useTime } from "@/utils/store/useTime";
import { ScheduleSection } from "../Layout";
import GroupCell from "./GroupCell";

export default function GroupSchedule({ group }) {
    const week = useTime(state => state.week);

    const weekEvents = week.map(date => {
        return { date, events: group.events ? group.events.filter(event => event.date === date) : [] };
    });

    return (
        <ScheduleSection edittable={group.isMentor} name={group.name}>
            {weekEvents.map(({ date, events }, index) => (
                <GroupCell key={index}
                    date={date} 
                    groupId={group.id} 
                    edittable={group.isMentor}
                    events={events}
                />
            ))}
        </ScheduleSection>
    );
}