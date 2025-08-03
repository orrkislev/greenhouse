import { eventsActions, useEvents } from "@/utils/store/useEvents";
import { groupsActions, useGroups } from "@/utils/store/useGroups";
import { notesActions, useNotes } from "@/utils/store/useNotes"
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";

export default function MainSchedule() {
    const today = useTime(state => state.today);
    const week = useTime(state => state.week);
    const notes = useNotes(state => state.userNotes);
    const events = useEvents(state => state.events);
    const groups = useGroups(state => state.groups);

    useEffect(()=>{
        groupsActions.loadGroups();
    },[])

    const groupIds = groups.map(g => g.id).join(',');

    useEffect(() => {
        notesActions.loadUserNotesForWeek();
        eventsActions.loadWeekEvents(week);
        groupsActions.updateWeek();
    }, [week, groupIds])

    if (!today) return null;
    const todayNote = notes[today];
    const todayEvents = events.filter(event => event.date === today).sort((a, b) => a.start.localeCompare(b.start));
    const todayGroupEvents = groups.map(group => (
        { group: group.name, 
            events: group.events ? group.events.filter(event => event.date === today) : [] 
        }))
        .filter(group => group.events.length > 0)

    return (
        <div className="flex flex-col gap-2">
            <h1>מה יש לי היום</h1>

            {todayNote && (
                <div className="text-sm text-gray-500">
                    הערות שלי: <span className="text-black">{todayNote}</span>
                </div>
            )}

            <div>
                <div className="text-sm text-gray-500">הלוז שלי</div>
                {todayEvents.length > 0 ? todayEvents.map(event => (
                    <div key={event.id} className="flex gap-1 items-center">
                        <div className="text-xs">ב{event.start}</div>
                        <div className="text-sm font-bold">{event.title}</div>
                    </div>
                )) : <div className="text-xs text-gray-500">אין אירועים היום</div>}
            </div>


            <div>
                <div className="text-sm text-gray-500">הקבוצות שלי</div>
                {todayGroupEvents.map(group => (
                    <div key={group.group} className="flex flex-col gap-1">
                        <div className="text-sm font-bold">{group.group}</div>
                        {group.events.map(event => (
                            <div key={event.id} className="flex gap-1 items-center">
                                <div className="text-xs">ב{event.start}</div>
                                <div className="text-sm font-bold">{event.title}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

        </div>
    )
}