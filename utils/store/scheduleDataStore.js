import { create } from "zustand";

export const DAYS = {
    SUNDAY: { label: 'א', index: 1 },
    MONDAY: { label: 'ב', index: 2 },
    TUESDAY: { label: 'ג', index: 3 },
    WEDNESDAY: { label: 'ד', index: 4 },
    THURSDAY: { label: 'ה', index: 5 },
    WEEKEND: { label: 'ו-ש', index: 6 },
};

export const HOURS = {
    HOUR1: { label: '09:30', index: 1 },
    HOUR2: { label: '10:30', index: 2 },
    HOUR3: { label: '11:30', index: 3 },
    HOUR4: { label: '12:30', index: 4 },
    AFTERNOON: { label: 'ערב', index: 5 },
};

export const useUserSchedule = create((set) => ({
    tasks: [
        { id: 0, dayStart: '25-05-2025', dayEnd: '27-05-2025', title: 'Task 1' },
        { id: 1, dayStart: '28-05-2025', dayEnd: '28-05-2025', title: 'Task 2' },
    ],
    events: [
        { id: 0, date: '25-05-2025', start: '09:30', end: '11:30', title: 'Event 1' },
        { id: 1, date: '26-05-2025', start: '10:30', end: '11:30', title: 'Event 2' },
        { id: 2, date: '28-05-2025', start: '09:30', end: '12:30', title: 'Event 3' },
    ],
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
        { date: '26-05-2025', text: 'יום ירושלים' },
        { date: '27-05-2025', text: 'יומולדת מתן רן' },
        { date: '28-05-2025', text: 'יומולדת עדי' },
        { date: '29-05-2025', text: 'כנס שותפים' },
        { date: '30-05-2025', text: 'יומולדת ירון' },
    ],
    setGantt: (gantt) => set({ gantt }),
}));

