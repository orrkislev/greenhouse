import { getGanttEventsWithDateRange } from "@/utils/actions/gantt actions";
import { format } from "date-fns";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/utils/firebase/firebase";

const toKey = (date) => {
    if (typeof date === "string") return date;
    return format(date, "yyyy-MM-dd");
}

export const useGantt = create((set, get) => ({
    gantt: new Map(),
    schoolMessage: '',
    studyGroups: '',

    // ------------------------------
    loadSchoolMessage: async () => {
        if (get().schoolMessage) return;
        const message = await getDoc(doc(db, 'school', 'messages'));
        const data = message.data();
        set({ message: data.text, studyGroups: data.studyGroups || [] });
    },
    saveStudyGroups: async (studyGroups) => {
        await updateDoc(doc(db, 'school', 'messages'), { studyGroups }, { merge: true });
        set({ studyGroups });
    },


    // ------------------------------
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

        // Create a new Map to ensure state updates are detected
        const newGanttItems = new Map(ganttItems);

        let current = new Date(start);
        while (current <= end) {
            const currentKey = toKey(current);
            if (!newGanttItems.has(currentKey)) {
                newGanttItems.set(currentKey, []);
            }
            current.setDate(current.getDate() + 1);
        }
        const finalKey = toKey(current);
        if (!newGanttItems.has(finalKey)) {
            newGanttItems.set(finalKey, []);
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
                const currentEvents = newGanttItems.get(currentKey) || [];
                if (!currentEvents.includes(event.summary)) {
                    // Create a new array to ensure immutability
                    const updatedEvents = [...currentEvents, event.summary];
                    newGanttItems.set(currentKey, updatedEvents);
                }
                current.setDate(current.getDate() + 1);
            }
        });
        set({ gantt: newGanttItems });
    },
    getGanttForDay: (date) => {
        return get().gantt.get(toKey(date)) || [];
    },
}));

export const ganttActions = Object.fromEntries(
    Object.entries(useGantt.getState()).filter(([key, value]) => typeof value === 'function')
);
