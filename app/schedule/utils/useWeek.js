import { format, startOfWeek } from "date-fns";
import { create } from "zustand";

export const HOURS = ['9:30', '10:30', '11:30', '12:30', 'ערב'];

export const useWeek = create((set) => {
    const getWeekDates = (date) => {
        const start = startOfWeek(date)
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return format(d, 'yyyy-MM-dd');
        });
    };
    return {
        week: getWeekDates(new Date()),
        setWeek: (date) => set({ week: getWeekDates(date) }),
        nextWeek: () => set((state) => {
            const newWeek = state.week.map(date => {
                const nextDate = new Date(date);
                nextDate.setDate(date.getDate() + 7);
                return nextDate;
            });
            return { week: newWeek };
        }),
        prevWeek: () => set((state) => {
            const newWeek = state.week.map(date => {
                const prevDate = new Date(date);
                prevDate.setDate(date.getDate() - 7);
                return prevDate;
            });
            return { week: newWeek };
        })
    };
});
