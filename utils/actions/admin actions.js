'use server';
import { prepareEmail, preparePassword } from '@/utils/actions/auth';
import { getSupabaseAdminClient, getSupabaseServerClient } from '../supabase/server';
import { prepareForUsersTable, prepareForUserProfilesTable } from '../supabase/schema';

const supabase = getSupabaseAdminClient();

export const createUser = async (username, first_name, last_name, extraData = {}) => {
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

    // Create auth user
    const email = prepareEmail(username);
    const password = preparePassword('0000');
    const { data: userRecord, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            first_name,
            last_name,
            full_name: `${first_name} ${last_name}`.trim()
        }
    });

    if (userError) {
        throw new Error('Failed to create user: ' + userError.message);
    }

    const userId = userRecord.user.id;

    // 1. Insert into public.users
    const userFields = prepareForUsersTable({ first_name, last_name, username, ...extraData });
    const { error: dbUserError } = await supabase.from('users').insert({
        id: userId,
        ...userFields
    });
    if (dbUserError) throw new Error('Failed to save user to database: ' + dbUserError.message);

    // 2. Insert into public.user_profiles
    const profileFields = prepareForUserProfilesTable(extraData);
    const { error: profileError } = await supabase.from('user_profiles').upsert({
        id: userId,
        ...profileFields
    });
    if (profileError) throw new Error('Failed to save user profile: ' + profileError.message);

    return userId;
}

export const updateUser = async (targetUserId, updates) => {
    const serverClient = await getSupabaseServerClient();
    const { data: { user: callingUser } } = await serverClient.auth.getUser();
    if (!callingUser) throw new Error('Not authenticated');

    const { data: callerData } = await supabase.from('users').select('role, is_admin').eq('id', callingUser.id).single();
    const isSelf = callingUser.id === targetUserId;
    const isAdmin = callerData?.is_admin;
    const isStaff = callerData?.role === 'staff';

    const userUpdates = prepareForUsersTable(updates);
    const profileUpdates = prepareForUserProfilesTable(updates);

    // Security Guard: Only Admins can update account data (users table)
    if (Object.keys(userUpdates).length > 0) {
        if (!isAdmin) throw new Error('Unauthorized: Only admins can update account records.');
        const { error } = await supabase.from('users').update(userUpdates).eq('id', targetUserId);
        if (error) throw error;

        // Sync name updates to Auth metadata
        if (userUpdates.first_name || userUpdates.last_name) {
            const { data: currentUser } = await supabase.from('users').select('first_name, last_name').eq('id', targetUserId).single();
            await supabase.auth.admin.updateUserById(targetUserId, {
                user_metadata: {
                    first_name: currentUser.first_name,
                    last_name: currentUser.last_name,
                    full_name: `${currentUser.first_name} ${currentUser.last_name}`.trim()
                }
            });
        }
    }

    // Security Guard: Admins/Staff OR the User themselves can update profiles
    if (Object.keys(profileUpdates).length > 0) {
        if (!isAdmin && !isStaff && !isSelf) throw new Error('Unauthorized: You do not have permission to update this profile.');
        const { error } = await supabase.from('user_profiles').upsert({ id: targetUserId, ...profileUpdates });
        if (error) throw error;
    }

    return { success: true };
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