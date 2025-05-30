import { create } from "zustand";
import { updateEvent } from "@/utils/firebase/firebase_data";

export const DAYS = {
    SUNDAY: { label: 'א', index: 1 },
    MONDAY: { label: 'ב', index: 2 },
    TUESDAY: { label: 'ג', index: 3 },
    WEDNESDAY: { label: 'ד', index: 4 },
    THURSDAY: { label: 'ה', index: 5 },
    WEEKEND: { label: 'ו-ש', index: 6 },
};

export const HOURS = ['9:30', '10:30', '11:30', '12:30', 'ערב'];

export const useUserSchedule = create((set) => ({
    tasks: [],
    events: [],
    setTasks: (tasks) => set({ tasks }),
    setEvents: (events) => set({ events }),

    addEvent: (event) => set((state) => ({
        events: [...state.events, event]
    })),
    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
    })),

    selected: null,
    setSelected: (selected) => set({ selected }),
}));

export const useGantt = create((set) => ({
    gantt: [
        { date: '26-05-2025', text: ['יום ירושלים'] },
        { date: '27-05-2025', text: ['יומולדת עדי', 'יום ירושלים'] },
        { date: '28-05-2025', text: ['יומולדת עדי'] },
        { date: '29-05-2025', text: ['כנס שותפים'] },
        { date: '30-05-2025', text: ['יומולדת ירון'] },
    ],
    setGantt: (gantt) => set({ gantt }),
}));
