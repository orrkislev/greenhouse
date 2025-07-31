import { useTime } from "../../../../../utils/useTime";
import { ScheduleSection } from "../Layout";
import GroupCell from "./GroupCell";

export default function GroupSchedule({ group }) {
    const week = useTime(state => state.week);

    const weekEntries = week.map(date => {
        return { date, entries: group.entries ? group.entries.filter(entry => entry.date === date) : [] };
    });

    return (
        <ScheduleSection edittable={group.isMentor} name={group.name}>
            {weekEntries.map((entry, index) => (
                <GroupCell key={index}
                    date={entry.date} 
                    groupId={group.id} 
                    edittable={group.isMentor}
                    entries={entry.entries}
                />
            ))}
        </ScheduleSection>
    );
}