import { create } from "zustand";

export const useSchedule = create((set, get) => ({
  schedules: [],
  currentSchedule: null,
  loading: false,
  error: null,

  setSchedules: (schedules) => set({ schedules }),

  setCurrentSchedule: (schedule) => set({ currentSchedule: schedule }),

  addSchedule: (schedule) => set((state) => ({
    schedules: [...state.schedules, schedule],
  })),

  updateSchedule: (id, updates) => set((state) => ({
    schedules: state.schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, ...updates, updatedAt: new Date() } : schedule
    ),
    currentSchedule: state.currentSchedule?.id === id
      ? { ...state.currentSchedule, ...updates, updatedAt: new Date() }
      : state.currentSchedule,
  })),

  deleteSchedule: (id) => set((state) => ({
    schedules: state.schedules.filter((schedule) => schedule.id !== id),
    currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
  })),

  addTask: (scheduleId, dayIndex, task) => set((state) => {
    const updatedSchedules = state.schedules.map((schedule) => {
      if (schedule.id === scheduleId) {
        const updatedDays = [...schedule.days];
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          tasks: [...updatedDays[dayIndex].tasks, task],
        };
        return { ...schedule, days: updatedDays, updatedAt: new Date() };
      }
      return schedule;
    });

    return {
      schedules: updatedSchedules,
      currentSchedule: state.currentSchedule?.id === scheduleId
        ? updatedSchedules.find(s => s.id === scheduleId) || null
        : state.currentSchedule,
    };
  }),

  updateTask: (scheduleId, dayIndex, taskId, updates) => set((state) => {
    const updatedSchedules = state.schedules.map((schedule) => {
      if (schedule.id === scheduleId) {
        const updatedDays = [...schedule.days];
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          tasks: updatedDays[dayIndex].tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        };
        return { ...schedule, days: updatedDays, updatedAt: new Date() };
      }
      return schedule;
    });

    return {
      schedules: updatedSchedules,
      currentSchedule: state.currentSchedule?.id === scheduleId
        ? updatedSchedules.find(s => s.id === scheduleId) || null
        : state.currentSchedule,
    };
  }),

  deleteTask: (scheduleId, dayIndex, taskId) => set((state) => {
    const updatedSchedules = state.schedules.map((schedule) => {
      if (schedule.id === scheduleId) {
        const updatedDays = [...schedule.days];
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          tasks: updatedDays[dayIndex].tasks.filter((task) => task.id !== taskId),
        };
        return { ...schedule, days: updatedDays, updatedAt: new Date() };
      }
      return schedule;
    });

    return {
      schedules: updatedSchedules,
      currentSchedule: state.currentSchedule?.id === scheduleId
        ? updatedSchedules.find(s => s.id === scheduleId) || null
        : state.currentSchedule,
    };
  }),

  toggleTaskCompletion: (scheduleId, dayIndex, taskId) => set((state) => {
    const { updateTask } = get();
    const schedule = state.schedules.find(s => s.id === scheduleId);
    const task = schedule?.days[dayIndex]?.tasks.find(t => t.id === taskId);

    if (task) {
      updateTask(scheduleId, dayIndex, taskId, { completed: !task.completed });
    }

    return state;
  }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));