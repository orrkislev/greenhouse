import { useWeek } from "@/app/schedule/utils/useWeek";
import { create } from "zustand";
import { fetchEventsFromGoogleCalendar } from "./GoogleCalendarActions";
import { useUser } from "./useUser";

export const useGoogleCalendar = create((set, get) => ({
    events: [],
    isLoading: false,
    loadedRanges: [],

    getWeeksCalendarEvents: async () => {
        console.log('getWeeksCalendarEvents called');
        const week = useWeek.getState().week;
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
            console.error('Error fetching Google Calendar events:', error);
            set({ isLoading: false });
        }
    }
}));