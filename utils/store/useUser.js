import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { prepareEmail } from '@/utils/firebase/auth';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from '@/utils/firebase/firebase';
import { resizeImage } from '@/utils/actions/storage actions';
import { resetPin } from '../actions/admin actions';
import { supabase } from '../supabase/client';


export const useUser = create(subscribeWithSelector((set, get) => {
	return {
		user: null,
		loading: false,
		originalUser: null,
		error: null,

		// ---------------------------------------------------------------
		// ------------ Log in and out, get user data ----------------
		// ---------------------------------------------------------------
		logout: () => {
			set({ user: null });
			supabase.auth.signOut();
		},
		signIn: async (username, pinPass) => {
			set({ error: null });
			const email = prepareEmail(username);
			const { data, error } = await supabase.auth.signInWithPassword({ email, password: pinPass });
			if (error) set({ error });
			if (data) await get().getUserData(data.user.id);
		},
		getUserData: async (userId) => {
			const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
			if (error) set({ error });
			else set({ user: data });
		},
		updateUserData: async (updates) => {
			const { error } = await supabase.from('users').update(updates).eq('id', get().user.id);
			if (error) set({ error });
			else set((state) => ({ user: { ...state.user, ...updates } }));
		},

		// ----------------------------------------------------
		// ------------ Staff Switching User ------------------
		// ----------------------------------------------------
		switchToStudent: async (studentId, currUrl) => {
			const user = get().user;
			if (!user || !isStaff()) {
				throw new Error("User does not have permission to switch to student.");
			}

			set({ originalUser: { user, lastPage: currUrl }, user: null });

			const { data, error } = await supabase.from('users').select('*').eq('id', studentId).single();
			if (error) set({ error });
			else set({ user: data });
		},
		switchBackToOriginal: async () => {
			const originalUser = get().originalUser;
			const lastPage = originalUser.lastPage;
			if (!originalUser) {
				throw new Error("No original user to switch back to.");
			}
			const { data, error } = await supabase.from('users').select('*').eq('id', originalUser.user.id).single();
			if (error) set({ error });
			else set({ user: data });

			return lastPage;
		},

		// ----------------------------------------------------
		// ------------ Profile Picture ------------------
		// ----------------------------------------------------
		updateProfilePicture: async (image) => {
			const user = get().user;
			if (!user) return;
			const storageRef = ref(storage, `profilePictures/${user.id}`);
			const resizedBlob = await resizeImage(image, 128);
			await uploadBytes(storageRef, resizedBlob);
			const url = await getDownloadURL(storageRef);
			await get().updateUserData({ profilePicture: url });
		},

		// ----------------------------------------------------
		// ------------ Change Pin ------------------
		// ----------------------------------------------------
		changePin: async (newPin) => {
			const user = get().user;
			await resetPin(user.id, newPin);
		},
	};
}));

export const isStaff = () => {
	const user = useUser.getState().user;
	return user && (user.role === 'staff');
}
export const isAdmin = () => {
	const user = useUser.getState().user;
	return user && user.is_admin;
}

export const userActions = Object.fromEntries(
	Object.entries(useUser.getState()).filter(([key, value]) => typeof value === 'function')
);

async function getSession() {
	const { data: { session }, error } = await supabase.auth.getSession()
	if (error) return
	if (session) {
		useUser.getState().getUserData(session.user.id);
	}
}
getSession();