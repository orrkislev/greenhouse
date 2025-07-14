import { create } from "zustand";

export const useWeek = create((set) => {
    const getWeekDates = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
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
