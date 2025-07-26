import { getGanttEventsWithDateRange } from "@/utils/gantt actions";
import { format } from "date-fns";
import { create } from "zustand";

const toKey = (date) => {
    if (typeof date === "string") return date;
    return format(date, "yyyy-MM-dd");
}

export const useGantt = create((set, get) => ({
    terms: [], 
    gantt: new Map(),
    loadTodayGantt: () => {
        get().fetchGanttEvents(new Date(), new Date());
    },
    fetchGanttEvents: async (start, end) => {
        const ganttItems = get().gantt;
        if (ganttItems.has(toKey(start)) && (end && ganttItems.has(toKey(end)))) {
            return;
        }
        const data = await getGanttEventsWithDateRange(start, end);
        if (!data.items || data.items.length === 0) {
            return;
        }

        let current = new Date(start);
        while (current <= end) {
            const currentKey = toKey(current);
            if (!ganttItems.has(currentKey)) {
                ganttItems.set(currentKey, []);
            }
            current.setDate(current.getDate() + 1);
        }
        const finalKey = toKey(current);
        if (!ganttItems.has(finalKey)) {
            ganttItems.set(finalKey, []);
        }

        data.items.filter(e => e.summary).forEach(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            const isAllDay = !event.start.dateTime;
            let current = new Date(eventStart);
            const last = new Date(eventEnd);
            if (isAllDay) last.setDate(last.getDate() - 1);
            while (current <= last) {
                const currentKey = toKey(current);
                const currentEvents = ganttItems.get(currentKey) || [];
                if (!currentEvents.includes(event.summary)) {
                    currentEvents.push(event.summary);
                    ganttItems.set(currentKey, currentEvents);
                }
                current.setDate(current.getDate() + 1);
            }
        });
        set({ gantt: ganttItems });
    },
    getGanttForDay: (date) => {
        return get().gantt.get(toKey(date)) || [];
    },
}));

export const ganttActions = Object.fromEntries(
    Object.entries(useGantt.getState()).filter(([key, value]) => typeof value === 'function')
);
