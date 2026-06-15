'use server'

import { getSupabaseServerClient } from '../supabase/server';
import { prepareEmail, preparePassword } from './auth';

export async function signInWithPin(username, pin) {
    const supabase = await getSupabaseServerClient();

    const { data: flagRow } = await supabase
        .from('misc').select('data').eq('name', 'pinLoginAllowed').single();
    if (!flagRow?.data?.enabled) {
        return { error: 'התחברות עם PIN אינה זמינה כרגע' };
    }

    const email = prepareEmail(username);
    const password = preparePassword(pin);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: userData } = await supabase
        .from('users').select('role, is_admin').eq('id', data.user.id).single();
    if (userData?.role === 'staff' || userData?.is_admin) {
        await supabase.auth.signOut();
        return { error: 'אנשי צוות מתחברים עם Google בלבד' };
    }

    return { userId: data.user.id };
}
