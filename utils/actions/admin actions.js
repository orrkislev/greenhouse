'use server';
import { prepareEmail, preparePassword } from '@/utils/actions/auth';
import { getSupabaseAdminClient, getSupabaseServerClient } from '../supabase/server';

const supabase = getSupabaseAdminClient();

export const createUser = async (username, first_name, last_name) => {
    // Only allow admins to create users
    const serverClient = await getSupabaseServerClient();
    const { data: { user: callingUser } } = await serverClient.auth.getUser();
    if (!callingUser) throw new Error('Not authenticated');
    const { data: callerData } = await supabase.from('users').select('is_admin').eq('id', callingUser.id).single();
    if (!callerData?.is_admin) throw new Error('Not authorized');

    // Check if username already exists
    const userSnapshot = await supabase.from('users').select('*').eq('username', username).single();
    if (userSnapshot.data) {
        throw new Error("Username already exists. Please choose a different username.");
    }

    // Check if username is valid
    const usernameRegex = /^[A-Za-z][A-Za-z0-9._-]*$/;
    if (!usernameRegex.test(username)) {
        throw new Error("Username must start with a letter and contain only English letters, numbers, dots, underscores, or hyphens.");
    }

    // Create user
    const email = prepareEmail(username);
    const password = preparePassword('0000');
    const { data: userRecord, error: userError } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });

    if (userError) {
        throw new Error('Failed to create user: ' + userError.message);
    }

    const { data, error } = await supabase.from('users').insert({
        id: userRecord.user.id,
        first_name,
        last_name,
        username,
        created_at: new Date(),
        updated_at: new Date(),
    });
    if (error) {
        throw new Error('Failed to save user to database: ' + error.message);
    }
    return userRecord.user.id;
}

export const resetPin = async (userId, newPin = '0000') => {
    const serverClient = await getSupabaseServerClient();
    const { data: { user: callingUser } } = await serverClient.auth.getUser();
    if (!callingUser) throw new Error('Not authenticated');
    const { data: callerData } = await supabase.from('users').select('role, is_admin').eq('id', callingUser.id).single();

    const isStaff = callerData?.role === 'staff';
    const isSelf = callingUser.id === userId;

    if (!isSelf && !isStaff) {
        throw new Error('Not authorized to reset this PIN');
    }

    const password = preparePassword(newPin);
    return await supabase.auth.admin.updateUserById(userId, {
        password,
    });
}

export const deleteUser = async (userId) => {
    // Only allow admins to delete users
    const serverClient = await getSupabaseServerClient();
    const { data: { user: callingUser } } = await serverClient.auth.getUser();
    if (!callingUser) throw new Error('Not authenticated');
    const { data: callerData } = await supabase.from('users').select('is_admin').eq('id', callingUser.id).single();
    if (!callerData?.is_admin) throw new Error('Not authorized');

    // Delete user
    await supabase.auth.admin.deleteUser(userId);
}