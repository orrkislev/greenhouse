import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../firebase/auth';

export const useUser = create(
  persist(
    (set, get) => {
      let unsubscribeUserDoc = null;
      if (typeof window !== 'undefined' && !window.__userStoreAuthSubscribed) {
        window.__userStoreAuthSubscribed = true;
        AuthService.onAuthStateChange((user) => {
          
          if (!user) {
            set({ user: null, loading: false, error: null });
            if (unsubscribeUserDoc) {
              unsubscribeUserDoc();
              unsubscribeUserDoc = null;
            }
            return;
          }

          set({ user });

          if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
            unsubscribeUserDoc = null;
          }

          unsubscribeUserDoc = AuthService.subscribeToUserDoc(user.id, (userDoc) => {
            set({ user: { ...get().user, ...userDoc } });
          });
        });
      }
      return {
        user: {},
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
        logout: () => {
          if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
            unsubscribeUserDoc = null;
          }
          set({ user: null, error: null });
        },

        // Auth logic merged from AuthContext
        signIn: async (username, pinPass) => {
          set({ loading: true, error: null });
          try {
            const user = await AuthService.signIn(username, pinPass);
            set({ user });
            // Subscribe to user doc changes
            if (unsubscribeUserDoc) unsubscribeUserDoc();
            if (user && user.uid) {
              console.log('subscribing to user doc:', user.uid);
              unsubscribeUserDoc = AuthService.subscribeToUserDoc(user.uid, (userDoc) => {
                set({ user: { ...get().user, ...userDoc } });
              });
            }
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
      };
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

