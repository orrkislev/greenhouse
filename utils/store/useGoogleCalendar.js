import { useTime } from "@/utils/store/useTime";
import { create } from "zustand";
import { fetchEventsFromGoogleCalendar } from "@/utils/actions/google actions";
import { useUser } from "@/utils/store/useUser";
import { addDays, format, getDay } from "date-fns";

export const useGoogleCalendar = create((set, get) => ({
    events: [],
    isLoading: false,
    loadedRanges: [],

    getTodayEvents: async () => {
        const userRefreshToken = useUser.getState().user.googleRefreshToken;
        if (!userRefreshToken) return;
        const day = format(new Date(), 'yyyy-MM-dd');
        const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

        if (get().isLoading) return;
        if (get().loadedRanges.some(range => range.start === day && range.end === tomorrow)) {
            return;
        }
        set(state => ({ loadedRanges: [...state.loadedRanges, { start: day, end: tomorrow }], isLoading: true }));
        try {
            const events = await fetchEventsFromGoogleCalendar(userRefreshToken, day, tomorrow);
            set({ events: events.map(formatEvent), isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },
    getWeeksEvents: async () => {
        const week = useTime.getState().week;
        if (!week || week.length === 0) return
        const userRefreshToken = useUser.getState().user.googleRefreshToken;
        if (!userRefreshToken) return

        const start = week[0];
        const end = week[week.length - 1];

        if (get().isLoading) return;
        if (get().loadedRanges.some(range => range.start === start && range.end === end)) {
            return;
        }
        set(state => ({ loadedRanges: [...state.loadedRanges, { start, end }], isLoading: true }));
        try {
            const events = await fetchEventsFromGoogleCalendar(userRefreshToken, start, end);
            set({ events: events.map(formatEvent), isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    }
}));

export const googleCalendarActions = Object.fromEntries(
    Object.entries(useGoogleCalendar.getState()).filter(([key, value]) => typeof value === 'function')
);

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