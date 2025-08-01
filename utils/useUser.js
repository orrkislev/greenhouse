import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { AuthService } from './firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';

export const useUser = create(subscribeWithSelector(persist((set, get) => {
	let unsubscribeUserDoc = null;
	const unsubscribe = () => {
		if (unsubscribeUserDoc) {
			unsubscribeUserDoc();
			unsubscribeUserDoc = null;
		}
	}


	return {
		user: null,
		loading: true,
		originalUser: null,

		logout: () => {
			unsubscribe();
			set({ user: null });
			AuthService.signOut();
		},

		signIn: async (username, pinPass) => {
			set({ loading: true });
			try {
				const userCredential = await AuthService.signIn(username, pinPass);
				unsubscribe();
				if (userCredential) {
					const userRef = doc(db, 'users', username);
					unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
						if (docSnap.exists()) set({ user: { ...docSnap.data(), id: username } });
					});
				}
			} catch (error) {
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

		switchToStudent: async (studentId, currUrl) => {
			const user = get().user;
			if (!user || !user.roles || !user.roles.includes('staff')) {
				throw new Error("User does not have permission to switch to student.");
			}
			set({ originalUser: { user, lastPage: currUrl } });
			const studentRef = doc(db, 'users', studentId);
			unsubscribe();
			unsubscribeUserDoc = onSnapshot(studentRef, (docSnapshot) => {
				if (docSnapshot.exists()) {
					set({ user: { ...docSnapshot.data(), id: studentId } });
				}
			})
		},
		switchBackToOriginal: () => {
			const originalUser = get().originalUser;
			const lastPage = originalUser.lastPage;
			if (!originalUser) {
				throw new Error("No original user to switch back to.");
			}
			unsubscribe();
			const userRef = doc(db, 'users', originalUser.user.id);
			unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
				if (docSnap.exists()) set({ user: { ...docSnap.data(), id: originalUser.user.id } });
			});
			set({ user: originalUser, originalUser: null });
			return lastPage;
		}
	};
},
	{
		name: 'auth-storage',
		partialize: (state) => ({ user: state.user, originalUser: state.originalUser }),
		merge: (persistedState, currentState) => ({ ...currentState, ...persistedState, loading: false }),
	}
)));

export const userActions = Object.fromEntries(
	Object.entries(useUser.getState()).filter(([key, value]) => typeof value === 'function')
);