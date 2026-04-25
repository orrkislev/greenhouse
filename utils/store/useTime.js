import { add, addDays, format, isAfter, isBefore, isSameDay, startOfWeek, subDays } from "date-fns";
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

        // ------ Report Halves ------
        reportHalves: null,
        loadReportHalves: async () => {
            if (get().reportHalves) return;
            const { data, error } = await supabase.from('misc').select().in('name', ['report_half_A', 'report_half_B']);
            if (error) throw error;
            const halves = Object.fromEntries(data.map(row => [row.name.replace('report_half_', ''), row.data]));
            set({ reportHalves: halves });
        },
        updateReportHalf: async (halfId, updates) => {
            const name = `report_half_${halfId}`;
            const current = get().reportHalves?.[halfId] ?? {};
            const newData = { ...current, ...updates };
            const { error } = await supabase.from('misc').update({ data: newData }).eq('name', name);
            if (error) throw error;
            set(state => ({
                reportHalves: {
                    ...state.reportHalves,
                    [halfId]: newData,
                },
            }));
        },

    };
}));

export const BETWEEN_TERMS = { id: '', name: 'בין הזמנים' };
(async () => {
    const [termResult, halvesResult] = await Promise.all([
        supabase.from('current_term').select(),
        supabase.from('misc').select().in('name', ['report_half_A', 'report_half_B']),
    ]);
    if (termResult.error) throw termResult.error;
    useTime.setState({ currTerm: termResult.data[0] || BETWEEN_TERMS });
    if (!halvesResult.error && halvesResult.data) {
        const halves = Object.fromEntries(halvesResult.data.map(row => [row.name.replace('report_half_', ''), row.data]));
        useTime.setState({ reportHalves: halves });
    }
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


const REPORT_HALF_DEFAULTS = {
    A: { start_month: 1, start_day: 1, end_month: 2, end_day: 28 },
    B: { start_month: 4, start_day: 24, end_month: 6, end_day: 30 },
};

// Returns 'A' or 'B' based on configurable dates stored in misc table
export function getReportHalf(date = new Date()) {
    const reportHalves = useTime.getState().reportHalves;
    const year = date.getFullYear();
    for (const halfId of ['A', 'B']) {
        const half = { ...REPORT_HALF_DEFAULTS[halfId], ...reportHalves?.[halfId] };
        const start = new Date(year, half.start_month - 1, half.start_day);
        const end = new Date(year, half.end_month - 1, half.end_day);
        if (isAfter(date, start) && isBefore(date, end)) return halfId;
    }
    console.log('Not in any report half');
    return null;
}


export const getTimeString = (time) => time.split(':')[0] + ':' + time.split(':')[1]