import { useTime } from "@/utils/useTime";
import { create } from "zustand";
import { fetchEventsFromGoogleCalendar } from "./GoogleCalendarActions";
import { useUser } from "./useUser";
import { format, getDay } from "date-fns";

export const useGoogleCalendar = create((set, get) => ({
    events: [],
    isLoading: false,
    loadedRanges: [],

    getTodayEvents: async () => {
        const userRefreshToken = useUser.getState().user.googleRefreshToken;
        if (!userRefreshToken) return;
        const day = format(new Date(), 'yyyy-MM-dd');

        if (get().isLoading) return;
        if (get().loadedRanges.some(range => range.start === day && range.end === day)) {
            return;
        }
        set(state => ({ loadedRanges: [...state.loadedRanges, { start: day, end: day }], isLoading: true }));
        try {
            const events = await fetchEventsFromGoogleCalendar(userRefreshToken, day, day);
            set({ events, isLoading: false });
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
            set({ events, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    }
}));

export const googleCalendarActions = Object.fromEntries(
    Object.entries(useGoogleCalendar.getState()).filter(([key, value]) => typeof value === 'function')
);