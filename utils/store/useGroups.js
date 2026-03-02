import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { useUser } from "@/utils/store/useUser";
import { supabase } from "../supabase/client";
import { prepareForGroupsTable } from "../supabase/utils";
import { toastsActions } from "./useToasts";

export const useGroups = create((set, get) => {
    useUser.subscribe(state => state.user?.id, (id) => {
        set({ groups: [] });
    });

    return {
        groups: [],

        // ----------- Group Loading -----------
        // -------------------------------------
        loadUserGroups: withUser(async (user) => {
            if (get().groups.length > 0) return;
            const { data, error } = await supabase.rpc('get_user_groups', {
                p_user_id: user.id
            })
            if (error) throw error;
            set({ groups: data });
        }),
        updateGroup: async (group, updates) => {
            const { error } = await supabase.from('groups').update(prepareForGroupsTable(updates)).eq('id', group.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון קבוצה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...group, ...updates } : g) }));
        },
        loadGroup: async (groupId) => {
            if (get().groups.find(g => g.id === groupId)) return;
            const { data, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת קבוצה')
            set((state) => ({ groups: [...state.groups, data] }));
        },

        // ----------- Group Members Management -----------
        // ------------------------------------------------
        createGroup: async (name, type) => {
            const { data: groupData, error: groupError } = await supabase.from('groups').insert({ name, type }).select().single();
            if (groupError) toastsActions.addFromError(groupError, 'שגיאה ביצירת קבוצה');
            const user = useUser.getState().user;
            const { data: membersData, error: membersError } = await supabase.from('users_groups').insert({ group_id: groupData.id, user_id: user.id });
            if (membersError) toastsActions.addFromError(membersError, 'שגיאה בהוספת משתמש לקבוצה');
            groupData.members = [user];
            set({ groups: [...get().groups, groupData] });
        },
        deleteGroup: async (groupId) => {
            const { error } = await supabase.from('groups').delete().eq('id', groupId);
            if (error) toastsActions.addFromError(error, 'שגיאה במחיקת קבוצה');
            set((state) => ({ groups: state.groups.filter(g => g.id !== groupId) }));
            await supabase.from('users_groups').delete().eq('group_id', groupId);
            await supabase.from('events').delete().eq('group_id', groupId);
            await supabase.from('tasks').delete().eq('group_id', groupId);
        },
        addMember: async (groupId, user) => {
            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, members: [...g.members, user] } : g) }));
            const { data, error } = await supabase.from('users_groups').insert({ group_id: groupId, user_id: user.id });
            if (error) toastsActions.addFromError(error, 'שגיאה בהוספת משתמש לקבוצה');
        },
        removeMember: async (groupId, userId) => {
            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== userId) } : g) }));
            const { error } = await supabase.from('users_groups').delete().eq('group_id', groupId).eq('user_id', userId);
            if (error) toastsActions.addFromError(error, 'שגיאה בהסרת משתמש מהקבוצה');
        },

        // ----------- Group Students Management -----------
        // -------------------------------------------------
        loadClassMembers: async (group) => {
            if (!group || group.members) return;

            const { data, error } = await supabase
                .from('users_groups')
                .select('users( id, first_name, last_name, username, role, active, user_profiles( avatar_url, cv_url, portfolio_url ) )')
                .eq('group_id', group.id)
                .eq('users.active', true)
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת חברי קבוצה');
            set((state) => ({
                groups: state.groups.map(g => g.id === group.id ? {
                    ...g,
                    members: data.map(d => {
                        const profile = Array.isArray(d.users?.user_profiles) ? d.users.user_profiles[0] : d.users?.user_profiles;
                        return { ...d.users, ...profile };
                    })
                } : g)
            }));
        },

        // ----------- Group Tasks Management -----------
        // ----------------------------------------------
        loadGroupTasks: async (groupId, includeCompleted = false) => {
            if (!includeCompleted && get().groups.find(g => g.id === groupId)?.tasks) return;
            const user = useUser.getState().user;
            const { data, error } = await supabase.rpc('get_user_group_tasks_by_group', {
                p_group_id: groupId,
                p_user_id: user.id,
                p_include_completed: includeCompleted,
            })
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת משימות הקבוצה');
            if (includeCompleted) {
                set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, allTasks: data } : g) }));
            } else {
                set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, tasks: data } : g) }));
            }
        },
        createGroupTask: async (group, text, description, due_date, assignedTo = []) => {
            const task = {
                title: text,
                status: 'todo',
                description,
                due_date,
                created_by: useUser.getState().user.id,
                group_id: group.id,
                assigned_to: assignedTo,
                completed_by: [],
            }
            const { data, error } = await supabase.from('tasks').insert(task).select().single();
            if (error) toastsActions.addFromError(error, 'שגיאה ביצירת משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: [...(g.tasks || []), data] } : g) }));
        },
        updateGroupTask: async (group, task, updates) => {
            const { error } = await supabase.from('tasks').update(updates).eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, ...updates } : t) } : g) }));
        },
        deleteGroupTask: async (group, task) => {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה במחיקת משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? {
                ...g,
                tasks: (g.tasks || []).filter(t => t.id !== task.id),
                allTasks: (g.allTasks || []).filter(t => t.id !== task.id),
            } : g) }));
        },
        toggleGroupTaskStatus: withUser(async (user, group, task) => {
            const isCompleted = task.completed_by && task.completed_by.includes(user.id);
            const newCompletedBy = isCompleted
                ? task.completed_by.filter(id => id !== user.id)
                : [...(task.completed_by || []), user.id];
            const newStatus = newCompletedBy.includes(user.id) ? 'completed' : 'todo';

            set((state) => ({
                groups: state.groups.map(g => g.id === group.id ? {
                    ...g,
                    tasks: g.tasks.map(t => t.id === task.id ? { ...t, completed_by: newCompletedBy, status: newStatus } : t)
                } : g)
            }));

            const { error } = await supabase.from('tasks').update({ completed_by: newCompletedBy }).eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון סטטוס משימה');
        }),
        archiveGroupTask: async (group, task) => {
            const { error } = await supabase.from('tasks').update({ status: 'archived' }).eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בארכיון משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.filter(t => t.id !== task.id) } : g) }));
        }
    }
});


export const groupUtils = {
    isMentor: (group, user) => {
        if (!user) user = useUser.getState().user;
        if (!user.roles || !user.roles.includes('staff')) return false;
        if (group.type === 'staff') return user.class === group.id;
        if (group.type === 'class') return user.class === group.id;
        if (group.type === 'major') return user.major === group.id;
        return false;
    },
    isMember: (group, user) => {
        if (!user) return false;
        return (group.type === 'class' && user.class === group.id) ||
            (group.type === 'major' && user.major === group.id) ||
            (group.type === 'staff' && user.roles && user.roles.includes('staff'));
    },
    isGroupEventMember: (event, user) => {
        if (!user) user = useUser.getState().user;
        return event.members && event.members.includes(user.id);
    },

    getUserGroupIds: (user) => {
        if (!user) user = useUser.getState().user;
        if (!user.id) return [];
        const groups = []
        if (user.roles && user.roles.includes('staff')) groups.push('צוות');
        if (user.class && !groups.includes(user.class)) groups.push(user.class);
        if (user.major && !groups.includes(user.major)) groups.push(user.major);
        return groups;
    }
}

export const groupsActions = createStoreActions(useGroups);

export const useUserGroups = createDataLoadingHook(useGroups, 'groups', 'loadUserGroups');