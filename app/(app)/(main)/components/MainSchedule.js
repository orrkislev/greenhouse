import { eventsActions, useEvents } from "@/utils/store/useEvents";
import { googleCalendarActions, useGoogleCalendar } from "@/utils/store/useGoogleCalendar";
import { groupsActions, useInvolvedGroups } from "@/utils/store/useGroups";
import { notesActions, useNotes } from "@/utils/store/useNotes"
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";
import Box2 from "@/components/Box2";

export default function MainSchedule() {
    const today = useTime(state => state.today);
    const week = useTime(state => state.week);
    const notes = useNotes(state => state.userNotes);
    const events = useEvents(state => state.events);
    const groups = useInvolvedGroups();
    const googleCalendarEvents = useGoogleCalendar(state => state.events);

    const groupIds = groups.map(g => g.id).join(',');

    useEffect(() => {
        notesActions.loadUserNotesForWeek();
        eventsActions.loadWeekEvents(week);
        groupsActions.updateWeek();
        googleCalendarActions.getTodayEvents();
    }, [week, groupIds])

    if (!today) return null;
    const todayNote = notes[today];
    const todayEvents = events.filter(event => event.date === today).sort((a, b) => a.start.localeCompare(b.start));
    todayEvents.push(...googleCalendarEvents.filter(event => event.date === today));
    const todayGroupEvents = groups.map(group => (
        {
            group: group.name,
            events: group.events ? group.events[today] : []
        }))
        .filter(group => group.events.length > 0)

    return (
        <Box2 label="מה יש לי היום" className="flex-1">

            {todayNote && (
                <div className="text-sm text-stone-500">
                    הערות שלי: <span className="text-black">{todayNote}</span>
                </div>
            )}

            <div>
                <div className="text-sm text-stone-500">הלוז שלי</div>
                {todayEvents.length > 0 ? todayEvents.map(event => (
                    <div key={event.id} className="flex gap-3 items-center">
                        <div className="text-xs">ב{event.start}</div>
                        <div className="text-sm font-bold">{event.title}</div>
                    </div>
                )) : <div className="text-xs text-stone-500">אין אירועים היום</div>}
            </div>


            {todayGroupEvents.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="text-sm text-stone-500">הקבוצות שלי</div>
                    {todayGroupEvents.map(group => (
                        <div key={group.group} className="flex flex-col gap-3">
                            <div className="text-sm font-bold">{group.group}</div>
                            {group.events.map(event => (
                                <div key={event.id} className="flex gap-3 items-center">
                                    <div className="text-xs">ב{event.start}</div>
                                    <div className="text-sm font-bold">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

        </Box2>
    )
}