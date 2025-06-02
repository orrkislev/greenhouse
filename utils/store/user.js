import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../firebase/auth';

export const useUser = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      setUser: (newUserData) => set(prev => ({
        user: {
          ...prev.user,
          ...newUserData,
        },
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, error: null }),

      // Auth logic merged from AuthContext
      signIn: async (username, pinPass) => {
        set({ loading: true, error: null });
        try {
          const user = await AuthService.signIn(username, pinPass);
          set({ user });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to sign in' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (username, pinPass, userData) => {
        set({ loading: true, error: null });
        try {
          const user = await AuthService.signUp(username, pinPass, userData);
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

