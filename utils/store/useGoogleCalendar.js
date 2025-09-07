import { useTime } from "@/utils/store/useTime";
import { fetchEventsFromGoogleCalendar } from "@/utils/actions/google actions";
import { addDays, format } from "date-fns";
import { createDataLoadingHook, createStore } from "./utils/createStore";

export const [useGoogleCalendar, googleCalendarActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    events: [],
    loadedRanges: [],

    getTodayEvents: withLoadingCheck(async (user) => {
        set({ events: [], loadedRanges: [] });
        
        if (!user.googleRefreshToken) return;
        const day = format(new Date(), 'yyyy-MM-dd');
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

        if (get().loadedRanges.some(range => range.start === day && range.end === tomorrow)) {
            return;
        }
        set(state => ({ loadedRanges: [...state.loadedRanges, { start: day, end: tomorrow }] }));
        const events = await fetchEventsFromGoogleCalendar(user.googleRefreshToken, day, tomorrow);
        set({ events: events.map(formatEvent) })
    }),
    getWeeksEvents: withLoadingCheck(async (user) => {
        const week = useTime.getState().week;
        if (!week || week.length === 0) return
        if (!user.googleRefreshToken) return

        const start = week[0];
        const end = week[week.length - 1];

        if (get().loadedRanges.some(range => range.start === start && range.end === end)) {
            return;
        }
        set(state => ({ loadedRanges: [...state.loadedRanges, { start, end }] }));
        const events = await fetchEventsFromGoogleCalendar(user.googleRefreshToken, start, end);
        set({ events: events.map(formatEvent) });
    }),
}));

export const useGoogleCalendarEventsToday = createDataLoadingHook(useGoogleCalendar, 'events', 'getTodayEvents');
export const useGoogleCalendarEventsWeek = createDataLoadingHook(useGoogleCalendar, 'events', 'getWeeksEvents');

const formatEvent = (event) => {
    return {
        ...event,
        start: new Date(event.start.dateTime).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
        end: new Date(event.end.dateTime).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
        date: format(new Date(event.start.dateTime), 'yyyy-MM-dd'),
        title: event.summary
    }
}