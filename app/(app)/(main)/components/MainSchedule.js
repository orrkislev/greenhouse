import { useTodayEvents } from "@/utils/store/useEvents";
import { useGoogleCalendarEventsToday } from "@/utils/store/useGoogleCalendar";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { useNotes } from "@/utils/store/useNotes"
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";
import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import MainGreetings from "./MainGreetings";
import Image from "next/image";

export default function MainSchedule() {
    const today = useTime(state => state.today);
    const week = useTime(state => state.week);
    const events = useTodayEvents();
    const groups = useUserGroups();
    const googleCalendarEvents = useGoogleCalendarEventsToday();

    const groupIds = groups.map(g => g.id).join(',');
    useEffect(() => {
        groupsActions.loadTodayEvents();
    }, [week, groupIds])

    if (!today) return null;

    const todayEvents = events[today] ?? [];
    todayEvents.push(...googleCalendarEvents.filter(event => event.date === today));

    const allEvents = [...todayEvents];
    groups.forEach(group => group.events?.[today]?.forEach(event => allEvents.push({ ...event, group: group.name })));
    allEvents.sort((a, b) => a.start.localeCompare(b.start));

    const nextEvent = allEvents.find(event => {
        let eventDate = new Date(event.date);
        eventDate.setHours(event.start.split(':')[0], event.start.split(':')[1], 0, 0);
        return eventDate > new Date();
    })

    return (
        <Box2 label="מה יש לי היום" className="col-start-1 row-start-1 row-span-4 flex-1 relative" LabelIcon={Calendar}>
            <MainGreetings />
            <div className="flex flex-col gap-2 mt-2">
                {allEvents.length > 0 ? allEvents.map(event => (
                    <div key={event.id} className={`flex gap-3 items-center  ${nextEvent?.id === event.id ? 'bg-stone-300 rounded-[8px] border-2 border-stone-300' : ''}`}>
                        <EventTime time={event.start} />
                        <div className="text-sm font-bold flex items-center gap-1">
                            {event.title}
                            {event.group && <div className="text-xs font-normal text-stone-500">(ב{event.group})</div>}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Image src="/images/no_events.png" alt="empty" width={200} height={200} className="w-[70%] object-cover" />
                        <div className="text-xs text-stone-500">אין אירועים היום</div>
                    </div>
                )}
            </div>

            <Link href="/schedule" className="absolute bottom-2 left-2">
                <Button>
                    <Calendar className="w-4 h-4" />
                    לוח הזמנים
                </Button>
            </Link>
        </Box2>
    )
}

function EventTime({ time }) {
    let [startH, startM] = time.split(':').map(Number);
    startH = startH.toString().padStart(2, '0');
    startM = startM.toString().padStart(2, '0');
    const text = startH == 13 ? 'ערב' : `${startH}:${startM}`;
    return <div className="p-1 bg-stone-100 rounded-[6px] text-xs">{text}</div>
}