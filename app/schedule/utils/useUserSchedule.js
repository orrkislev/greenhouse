import { create } from "zustand";
import { formatDate } from "../../../utils/utils";

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

