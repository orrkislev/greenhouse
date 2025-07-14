import { create } from "zustand";
import { getGanttEventsWithDateRange } from "./gantt actions";
import { format } from "date-fns";

const toKey = (date) => {
    if (typeof date === "string") return date;
    return format(date, "yyyy-MM-dd");
}

export const useGantt = create((set, get) => ({
    gantt: new Map(),
    getGanttForDay: (date) => {
        const ganttItems = get().gantt;
        return ganttItems.get(toKey(date)) || [];
    },
    fetchGanttEvents: async (start, end) => {
        // Check if the gantt already has data for the requested range
        // If it does, return early to avoid unnecessary fetch
        const ganttItems = get().gantt;
        if (ganttItems.has(toKey(start)) && (end && ganttItems.has(toKey(end)))) {
            return;
        }

        // Fetch events using the server action
        const data = await getGanttEventsWithDateRange(start, end);
        // Check if the response contains items
        if (!data.items || data.items.length === 0) {
            return;
        }

        // Initialize ganttItems with empty arrays for each day in the range
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

        // Populate ganttItems with event summaries
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
    }
}));
