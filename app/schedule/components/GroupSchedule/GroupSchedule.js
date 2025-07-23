import { useWeek } from "../../utils/useWeek";
import { ScheduleSection } from "../Layout";
import GroupCell from "./GroupCell";

export default function GroupSchedule({ group }) {
    const week = useWeek(state => state.week);

    const weekEntries = week.map(date => {
        return { date, entries: group.entries ? group.entries.filter(entry => entry.date === date) : [] };
    });

    return (
        <ScheduleSection edittable={group.isMentor || group.isAdmin} name={group.name}>
            {weekEntries.map((entry, index) => (
                <GroupCell key={index}
                    date={entry.date} 
                    groupName={group.name} 
                    edittable={group.isMentor || group.isAdmin}
                    entries={entry.entries}
                />
            ))}
        </ScheduleSection>
    );
}