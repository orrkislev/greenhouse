import { addDays, format, isBefore, startOfWeek } from "date-fns";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/utils//firebase/firebase";
import { subscribeWithSelector } from "zustand/middleware";
import { isEqual } from "lodash";

export const HOURS = ['9:30', '10:30', '11:30', '12:30', 'ערב'];
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
        }),

        // ------ Terms ------
        terms: [],
        currTerm: null,
        addTerm: async (term) => {
            const termRef = doc(db, 'school', 'terms');
            const newTerms = [...get().terms, term];
            await updateDoc(termRef, { terms: newTerms });
            set({ terms: newTerms });
        },
        removeTerm: async (termId) => {
            const termRef = doc(db, 'school', 'terms');
            const newTerms = get().terms.filter(term => term.id !== termId);
            await updateDoc(termRef, { terms: newTerms });
            set({ terms: newTerms });
        },
        updateTerm: async (termId, updates) => {
            const termRef = doc(db, 'school', 'terms');
            const newTerms = get().terms.map(term => term.id === termId ? { ...term, ...updates } : term);
            await updateDoc(termRef, { terms: newTerms });
            set({ terms: newTerms });
        },
    };
}));

(async () => {
    const termsInfo = doc(db, 'school', 'terms');
    const termsSnapshot = await getDoc(termsInfo);
    const termsData = termsSnapshot.data();
    const terms = termsData?.terms || [];
    const currDate = format(new Date(), 'yyyy-MM-dd');
    const currTerm = terms.find(term => term.start <= currDate && term.end >= currDate) || null;
    useTime.setState({ currTerm, terms });
})();


export const timeActions = Object.fromEntries(
    Object.entries(useTime.getState()).filter(([key, value]) => typeof value === 'function')
);




// ---------- utility functions -----------
export function getTermWeeks(term) {
    const startDate = new Date(term.start);
    const endDate = new Date(term.end);
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
  
    while (isBefore(current, endDate) || isEqual(current, endDate)) {
      dates.push(new Date(current)); // clone so it's not mutated later
      current = addDays(current, 1);
    }
  
    return dates.map(date => format(date, 'yyyy-MM-dd'));
  }