import { useTodayEvents, eventSelectors, eventsActions } from "@/utils/store/useEvents";
import { useGoogleCalendarEventsToday } from "@/utils/store/useGoogleCalendar";
import { useUserGroups } from "@/utils/store/useGroups";
import { useTime } from "@/utils/store/useTime";
import { useEffect } from "react";
import Box2 from "@/components/Box2";
import Button from "@/components/Button";
import Link from "next/link";
import { Calendar } from "lucide-react";
import MainGreetings from "./MainGreetings";
import Image from "next/image";

const GROUP_COLORS = [
    { event: 'bg-blue-500 hover:bg-blue-700', groupHover: 'group-hover/event:bg-blue-700' },
    { event: 'bg-purple-500 hover:bg-purple-700', groupHover: 'group-hover/event:bg-purple-700' },
    { event: 'bg-pink-500 hover:bg-pink-700', groupHover: 'group-hover/event:bg-pink-700' },
    { event: 'bg-orange-500 hover:bg-orange-700', groupHover: 'group-hover/event:bg-orange-700' },
    { event: 'bg-teal-500 hover:bg-teal-700', groupHover: 'group-hover/event:bg-teal-700' },
    { event: 'bg-indigo-500 hover:bg-indigo-700', groupHover: 'group-hover/event:bg-indigo-700' },
    { event: 'bg-rose-500 hover:bg-rose-700', groupHover: 'group-hover/event:bg-rose-700' },
    { event: 'bg-cyan-500 hover:bg-cyan-700', groupHover: 'group-hover/event:bg-cyan-700' },
];

const MEETING_COLORS = { event: 'bg-green-600 hover:bg-green-700', groupHover: 'group-hover/event:bg-green-700' };

function getGroupColor(groupId) {
    if (!groupId) return GROUP_COLORS[0];
    const hash = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return GROUP_COLORS[hash % GROUP_COLORS.length];
}

export default function MainSchedule() {
    const today = useTime(state => state.today);
    const week = useTime(state => state.week);
    const events = useTodayEvents();
    const groups = useUserGroups();
    const googleCalendarEvents = useGoogleCalendarEventsToday();

    const groupIds = groups.map(g => g.id);
    useEffect(() => {
        if (groupIds.length > 0) {
            eventsActions.loadGroupEvents(groupIds, today, today);
        }
    }, [week, groupIds.join(',')])

    if (!today) return null;

    const todayEvents = [...eventSelectors.getEventsForDateWithRecurring(events, today)];
    todayEvents.push(...googleCalendarEvents.filter(event => event.date === today && event.eventType !== 'workingLocation'));

    // Add group events
    const groupEvents = events.filter(e => e.group_id);
    groupEvents.forEach(event => {
        const group = groups.find(g => g.id === event.group_id);
        if (group && (event.date === today || event.day_of_the_week === new Date(today).getDay() + 1)) {
            todayEvents.push({ ...event, group: group.name });
        }
    });

    const allEvents = todayEvents.map(e => ({
        ...e,
        type: e.participants?.length ? 'meeting' : 'event'
    }));

    allEvents.sort((a, b) => a.start.localeCompare(b.start));

    const nextEvent = allEvents.find(event => {
        let eventDate = new Date(event.date || today); // Meetings might not have date prop explicitly needed if filtered by today hook, but assumed safe
        eventDate.setHours(event.start.split(':')[0], event.start.split(':')[1], 0, 0);
        return eventDate > new Date();
    })

    console.log({allEvents, events, googleCalendarEvents, todayEvents})

    return (
        <Box2 label="מה יש לי היום" className="col-start-1 row-start-1 row-span-4 flex-1 relative" LabelIcon={Calendar}>
            <MainGreetings />
            <div className="flex flex-col gap-2 mt-2">
                {allEvents.length > 0 ? allEvents.map(item => {
                    const colors = item.type === 'meeting' ? MEETING_COLORS : getGroupColor(item.group_id);
                    const isNext = nextEvent?.id === item.id;
                    const timeString = item.start.split(':')[0].padStart(2, '0') + ':' + item.start.split(':')[1].padStart(2, '0');
                    return (
                        <div key={item.id} className={`relative ${colors.event} text-white rounded p-1 text-xs flex gap-2 ${isNext ? 'ring-2 ring-offset-1 ring-ghpurple' : ''}`}>
                            {item.group && (
                                <div className={`absolute left-0 top-[-4px] text-[10px] px-1 rounded-sm ${colors.event} ${colors.groupHover}`}>
                                    {item.group}
                                </div>
                            )}
                            <div className="shrink-0">{timeString}</div>
                            <div className="break-words overflow-hidden">
                                {item.type === 'meeting'
                                    ? (item.title || 'פגישה') + " עם " + item.participants?.map(p => p.first_name).join(', ')
                                    : item.title}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Image src="/images/no_events.png" alt="empty" width={200} height={200} className="w-[70%] object-cover" />
                        <div className="text-xs text-muted-foreground">אין אירועים היום</div>
                    </div>
                )}
            </div>

            <Link href="/schedule" className="absolute bottom-2 left-2">
                <Button className="bg-white hover:bg-ghgreen hover:text-ghglow">
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