import { add, addDays, format, isBefore, isSameDay, startOfWeek, subDays } from "date-fns";
import { create } from "zustand";
import { supabase } from "../supabase/client";
import { subscribeWithSelector } from "zustand/middleware";

export const HOURS = ['9:30', '10:30', '11:30', '12:30', '13:30'];
export const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];


export const useTime = create(subscribeWithSelector((set, get) => {
    const getWeekDates = (date) => {
        const start = startOfWeek(date)
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return format(d, 'yyyy-MM-dd');
        });
    };

    return {
        today: format(new Date(), 'yyyy-MM-dd'),
        week: getWeekDates(new Date()),
        setWeek: (date) => set({ week: getWeekDates(date) }),
        nextWeek: () => set((state) => {
            const firstDate = addDays(state.week[0], 7);
            return { week: getWeekDates(firstDate) };
        }),
        prevWeek: () => set((state) => {
            const firstDate = subDays(state.week[0], 7);
            return { week: getWeekDates(firstDate) };
        }),

        // ------ Terms ------
        terms: [],
        currTerm: null,
        loadTerms: async () => {
            if (get().terms.length > 0) return;
            const { data, error } = await supabase.from('terms').select();
            if (error) throw error;
            set({ terms: data });
        },
        addTerm: async (term) => {
            const { data, error } = await supabase.from('terms').insert(term).select();
            if (error) throw error;
            const newTerms = [...get().terms, data[0]];
            set({ terms: newTerms });
        },
        removeTerm: async (termId) => {
            const { error } = await supabase.from('terms').delete().eq('id', termId);
            if (error) throw error;
            const newTerms = get().terms.filter(term => term.id !== termId);
            set({ terms: newTerms });
        },
        updateTerm: async (termId, updates) => {
            const { error } = await supabase.from('terms').update(updates).eq('id', termId);
            if (error) throw error;
            const newTerms = get().terms.map(term => term.id === termId ? { ...term, ...updates } : term);
            set({ terms: newTerms });
        },

    };
}));

export const BETWEEN_TERMS = { id: '', name: 'בין הזמנים' };
(async () => {
    const { data, error } = await supabase.from('current_term').select();
    if (error) throw error;
    useTime.setState({ currTerm: data[0] || BETWEEN_TERMS });
})();

export const timeActions = Object.fromEntries(
    Object.entries(useTime.getState()).filter(([key, value]) => typeof value === 'function')
);




// ---------- utility functions -----------
export function getTermWeeks(termIds) {
    const terms = termIds.map(id => useTime.getState().terms.find(term => term.id === id)).filter(t => t);
    if (terms.length === 0) return [];
    const startDate = new Date(terms[0].start);
    const endDate = new Date(terms[terms.length - 1].end);
    const firstSunday = new Date(startDate);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());
    const lastSaturday = new Date(endDate);
    lastSaturday.setDate(lastSaturday.getDate() + (6 - lastSaturday.getDay()));
    console.log(firstSunday, lastSaturday);
    const termWeeks = [];
    let weekStart = new Date(firstSunday);
    while (weekStart <= lastSaturday) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        termWeeks.push({
            dates: Array.from({ length: 6 }, (_, i) => {
                const d = new Date(weekStart);
                d.setDate(weekStart.getDate() + i);
                return format(d, 'yyyy-MM-dd');
            }),
            start: new Date(weekStart),
            end: new Date(weekEnd),
            isCurrent: weekStart <= new Date() && weekEnd >= new Date(),
            weekNumber: termWeeks.length,
        });
        weekStart.setDate(weekStart.getDate() + 7);
    }
    return termWeeks;
}


export function dateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates = [];
    let current = startDate;

    while (isBefore(current, endDate) || isSameDay(current, endDate)) {
        dates.push(new Date(current)); // clone so it's not mutated later
        current = addDays(current, 1);
    }

    return dates.map(date => format(date, 'yyyy-MM-dd'));
}


export const getTimeString = (time) => time.split(':')[0] + ':' + time.split(':')[1]