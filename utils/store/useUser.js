import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { prepareEmail, preparePassword } from '@/utils/actions/auth';
import { resizeImage } from '@/utils/actions/storage actions';
import { resetPin } from '../actions/admin actions';
import { supabase } from '../supabase/client';
import { redirect } from 'next/navigation';


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
			const password = preparePassword(pinPass)
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) set({ error });
			if (data) await get().getUserData(data.user.id);
		},
		getUserData: async (userId) => {
			const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
			if (error) set({ error });
			else set({ user: data });

			if (!data.googleRefreshToken) {
				const { data: { session } } = await supabase.auth.getSession();
				if (session?.provider_refresh_token) {
					await get().updateUserData({ googleRefreshToken: session.provider_refresh_token });
				}
			}
		},
		updateUserData: async (updates) => {
			const { error } = await supabase.from('users').update(updates).eq('id', get().user.id);
			if (error) set({ error });
			else set((state) => ({ user: { ...state.user, ...updates } }));
		},
		signInWithGoogle: async () => {
			await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: window.location.origin,
					// Space-separated string is the Supabase convention
					scopes: [
						'https://www.googleapis.com/auth/calendar.readonly',
						'https://www.googleapis.com/auth/documents',
						'https://www.googleapis.com/auth/drive.file',
					].join(' '),
					queryParams: {
						access_type: 'offline',
						// prompt: 'consent',
						include_granted_scopes: 'true'
					},
				},
			});
		},

		// ----------------------------------------------------
		// ------------ Staff Switching User ------------------
		// ----------------------------------------------------
		switchToStudent: async (studentId, currUrl) => {
			currUrl = window.location.pathname + window.location.search;
			const user = get().user;
			if (!user || !isStaff()) {
				throw new Error("User does not have permission to switch to student.");
			}

			const originalUser = get().originalUser;
			set({ originalUser: originalUser || { user, lastPage: currUrl }, user: null });

			const { data, error } = await supabase.from('users').select('*').eq('id', studentId).single();
			if (error) set({ error });
			else set({ user: data });

			redirect('/')
		},
		switchBackToOriginal: async () => {
			const originalUser = get().originalUser;
			const lastPage = originalUser.lastPage;
			if (!originalUser) {
				throw new Error("No original user to switch back to.");
			}
			const { data, error } = await supabase.from('users').select('*').eq('id', originalUser.user.id).single();
			if (error) set({ error });
			else set({ user: data, originalUser: null });

			return lastPage;
		},

		// ----------------------------------------------------
		// ------------ Profile Picture ------------------
		// ----------------------------------------------------
		updateProfilePicture: async (image) => {
			const user = get().user;
			const resizedBlob = await resizeImage(image, 128);
			const { error } = await supabase.storage.from('images').upload(`${user.id}.png`, resizedBlob, {
				upsert: true,
			});
			if (error) throw error;
			const { data, error: downloadError } = await supabase.storage.from('images').getPublicUrl(`${user.id}.png`);
			if (downloadError) throw downloadError;
			await get().updateUserData({ avatar_url: data.publicUrl });
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
	return user && user.role == 'staff' &&  user.is_admin;
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