import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from './firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';

console.log('useUser store initialized');
export const useUser = create(
	persist(
		(set, get) => {
			let unsubscribeUserDoc = null;
			const unsubscribe = () => {
				if (unsubscribeUserDoc) {
					unsubscribeUserDoc();
					unsubscribeUserDoc = null;
				}
			}


			return {
				user: {},
				loading: true,
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
					unsubscribe();
					set({ user: null, error: null });
					AuthService.signOut();
				},

				signIn: async (username, pinPass) => {
					set({ loading: true, error: null });
					try {
						const user = await AuthService.signIn(username, pinPass);
						set({ user });
						unsubscribe();
						if (user && user.username) {
							unsubscribeUserDoc = AuthService.subscribeToUserDoc(user.username, (userDoc) => {
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

				updateUserDoc: async (updates) => {
					const userDocRef = doc(db, 'users', get().user.id);
					await updateDoc(userDocRef, updates);
					set((state) => ({
						user: {
							...state.user,
							...updates,
						},
					}));
				},
			};
		},
		{
			name: 'auth-storage',
			partialize: (state) => ({ user: state.user }),
			merge: (persistedState, currentState) => ({ ...currentState, ...persistedState, loading: false }),
		}
	)
);

