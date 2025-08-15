import { useUser } from "@/utils/store/useUser";
import AuthGoogleCalendar from "./AuthGoogleCalendar";
import { googleCalendarActions, useGoogleCalendar } from "@/utils/store/useGoogleCalendar";
import { useEffect } from "react";
import { ScheduleSection } from "../Layout";
import { tw } from "@/utils/tw";
import { useTime } from "@/utils/store/useTime";

const GanttDay = tw`flex flex-col items-center justify-center text-stone-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#4285F4] text-white
    `;


export default function GoogleCalendar() {
    const user = useUser(state => state.user);
    const week = useTime(state => state.week);
    const googleEvents = useGoogleCalendar(state => state.events);

    useEffect(() => {
        if (!user || !user.googleRefreshToken || !week || week.length === 0) return;
        googleCalendarActions.getWeeksEvents();
    }, [user.googleRefreshToken, week]);

    if (!user) return null;
    if (!user.googleRefreshToken) return null

    const weeksEvents = week.map(day => {
        return {
            date: day,
            events: googleEvents.filter(event => event.date === day)
        }
    });

    return (
        <ScheduleSection name="גוגל" edittable={false} withLabel={true}>
            {weeksEvents.map((day, index) => (
                <GanttDay key={index}>
                    {day.events.length > 0 && (
                        day.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="text-xs">
                                <div className="font-medium">{event.summary || 'No Title'}</div>
                                <div className="text-xs">
                                    {event.start} - {event.end}
                                </div>
                            </div>
                        ))
                    )}
                </GanttDay>
            ))}
        </ScheduleSection>
    );
}
