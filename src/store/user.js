import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '@/services/auth';

export const useUser = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, error: null }),

      // Auth logic merged from AuthContext
      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const user = await AuthService.signIn(email, password);
          set({ user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to sign in' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const user = await AuthService.signUp(email, password, displayName);
          set({ user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to sign up' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });
        try {
          await AuthService.signOut();
          get().logout();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to sign out' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export const useScheduleStore = create((set, get) => ({
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
