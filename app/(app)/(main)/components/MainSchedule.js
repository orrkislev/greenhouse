import { useTodayEvents } from "@/utils/store/useEvents";
import { useGoogleCalendarEventsToday } from "@/utils/store/useGoogleCalendar";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";
import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import MainGreetings from "./MainGreetings";
import Image from "next/image";
import { useMeetingsToday } from "@/utils/store/useMeetings";

export default function MainSchedule() {
    const today = useTime(state => state.today);
    const week = useTime(state => state.week);
    const events = useTodayEvents();
    const groups = useUserGroups();
    const googleCalendarEvents = useGoogleCalendarEventsToday();
    const meetings = useMeetingsToday();

    const groupIds = groups.map(g => g.id).join(',');
    useEffect(() => {
        groupsActions.loadTodayEvents();
    }, [week, groupIds])

    if (!today) return null;

    const todayEvents = [...(events[today] ?? [])];
    todayEvents.push(...googleCalendarEvents.filter(event => event.date === today));
    groups.forEach(group => group.events?.[today]?.forEach(event => todayEvents.push({ ...event, group: group.name })));

    // Combine meetings and events
    const allEvents = [
        ...todayEvents.map(e => ({ ...e, type: 'event' })),
        ...meetings.map(m => ({ ...m, type: 'meeting' }))
    ];

    allEvents.sort((a, b) => a.start.localeCompare(b.start));

    const nextEvent = allEvents.find(event => {
        let eventDate = new Date(event.date || today); // Meetings might not have date prop explicitly needed if filtered by today hook, but assumed safe
        eventDate.setHours(event.start.split(':')[0], event.start.split(':')[1], 0, 0);
        return eventDate > new Date();
    })

    return (
        <Box2 label="מה יש לי היום" className="col-start-1 row-start-1 row-span-4 flex-1 relative" LabelIcon={Calendar}>
            <MainGreetings />
            <div className="flex flex-col gap-2 mt-2">
                {allEvents.length > 0 ? allEvents.map(item => (
                    <div key={item.id} className={`flex gap-3 items-center ${nextEvent?.id === item.id ? 'bg-accent rounded-[8px] border-2 border-border' : ''}`}>
                        <EventTime time={item.start} />
                        <div className="text-sm font-bold flex items-center gap-1">
                            {item.type === 'meeting' ? (
                                item.other_participants?.length > 0 ? `${item.other_participants[0]?.first_name} ${item.other_participants[0]?.last_name}` : item.title
                            ) : (
                                <>
                                    {item.title}
                                    {item.group && <div className="text-xs font-normal text-muted-foreground">(ב{item.group})</div>}
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Image src="/images/no_events.png" alt="empty" width={200} height={200} className="w-[70%] object-cover" />
                        <div className="text-xs text-muted-foreground">אין אירועים היום</div>
                    </div>
                )}
            </div>

            <Link href="/schedule" className="absolute bottom-2 left-2">
                <Button className="bg-white">
                    <Calendar className="w-4 h-4" />
                    לוח הזמנים
                </Button>
            </Link>
        </Box2>
    )
}

export function EventTime({ time }) {
    let [startH, startM] = time.split(':').map(Number);
    startH = startH.toString().padStart(2, '0');
    startM = startM.toString().padStart(2, '0');
    const text = startH == 13 ? 'ערב' : `${startH}:${startM}`;
    return <div className="p-1 bg-muted rounded-[6px] text-xs">{text}</div>
}