import { create } from "zustand";
import { formatDate } from "../utils";

export const HOURS = ['9:30', '10:30', '11:30', '12:30', 'ערב'];

export const useUserSchedule = create((set) => ({
    tasks: [],
    events: [],
    setTasks: (tasks) => set({ tasks }),
    setEvents: (events) => set({ events }),

    updateEvent: (eventId, updatedEvent) => set((state) => {
        const updatedEvents = state.events.map(event =>
            event.id === eventId ? { ...event, ...updatedEvent } : event
        );
        return { events: updatedEvents };
    }),
    addEvent: (event) => set((state) => ({
        events: [...state.events, event]
    })),
    deleteEvent: (eventId) => set((state) => ({
        events: state.events.filter(event => event.id !== eventId)
    })),


    addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task]
    })),
    updateTask: (taskId, updatedTask) => set((state) => {
        const updatedTasks = state.tasks.map(task =>
            task.id === taskId ? { ...task, ...updatedTask } : task
        );
        return { tasks: updatedTasks };
    }),
    deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
    })),

    selected: null,
    setSelected: (selected) => set({ selected }),
}));

export const useGantt = create((set, get) => ({
    gantt: {},
    getGanttEvents: async (start, end) => {
        // Ensure start is a Sunday
        if (start.getDay() !== 0) {
            start.setDate(start.getDate() - start.getDay());
        }
        const startKey = formatDate(start);

        // Ensure end is a Saturday
        // if not provided, set it to the next Saturday after start
        if (!end) {
            end = new Date(start)
            end.setDate(start.getDate() + 6);
        }
        if (end.getDay() !== 6) {
            end.setDate(end.getDate() + (6 - end.getDay()));
        }
        const endKey = formatDate(end);

        // Check if the gantt already has data for the requested range
        // If it does, return early to avoid unnecessary fetch
        const ganttItems = get().gantt;
        if (ganttItems[startKey] && ganttItems[endKey]) {
            return;
        }

        // Fetch events from the Google Calendar API
        const url = `/api/google_calendar?start=${startKey}&end=${endKey}`;
        const res = await fetch(url);
        const data = await res.json();

        // Check if the response contains items
        if (!data.items || data.items.length === 0) {
            return;
        }

        // Initialize ganttItems with empty arrays for each day in the range
        let current = new Date(start);
        while (current <= end) {
            ganttItems[formatDate(current)] = ganttItems[formatDate(current)] || [];
            current.setDate(current.getDate() + 1);
        }
        ganttItems[formatDate(current)] = ganttItems[formatDate(current)] || [];

        // Populate ganttItems with event summaries
        data.items.filter(e => e.summary).forEach(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            const isAllDay = !event.start.dateTime;
            let current = new Date(start);
            const last = new Date(end);
            if (isAllDay) last.setDate(last.getDate() - 1);
            while (current <= last) {
                if (!ganttItems[formatDate(current)].includes(event.summary)) {
                    ganttItems[formatDate(current)].push(event.summary);
                }
                current.setDate(current.getDate() + 1);
            }
        });
        set({ gantt: ganttItems });
    }
}));
