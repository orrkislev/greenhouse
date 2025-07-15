import { useUserSchedule } from "../../utils/useUserSchedule";
import { useWeek } from "../../utils/useWeek";
import { useGroupSchedule } from "../GroupSchedule/useGroupSchedule";

export default function useWeeksEvents() {
    const week = useWeek(state => state.week);
    const events = useUserSchedule(state => state.events);
    const groups = useGroupSchedule(state => state.groups);

    const groupEvents = groups.filter(group => group.entries).flatMap(group =>
        group.entries
            .filter(entry => entry.type === 'event')
            .filter(event => event.date >= week[0] && event.date <= week[week.length - 1])
            .filter(event => event.isMember)
            .map(event => ({
                ...event,
                start: event.timeRange.start,
                end: event.timeRange.end,
            }))
    );

    return [...events, ...groupEvents]
}
