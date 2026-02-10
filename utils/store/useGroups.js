import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { useUser } from "@/utils/store/useUser";
import { useTime } from "@/utils/store/useTime";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable } from "../supabase/utils";
import { addDays, format } from "date-fns";
import { toastsActions } from "./useToasts";

export const useGroups = create((set, get) => {
    useUser.subscribe(originalUser => {
        set({ groups: [] });
    });

    return {
        groups: [],

        // ----------- Group Loading -----------
        // -------------------------------------
        loadUserGroups: withUser(async (user) => {
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

        // ----------- Group Events Management -----------
        // ------------------------------------------------
        loadTodayEvents: async (groupId) => {
            const today = useTime.getState().today;
            if (groupId) {
                await get().loadGroupEvents(groupId, today);
                return;
            }
            for (const group of get().groups) {
                await get().loadGroupEvents(group.id, today);
            }
        },
        loadWeekEvents: async (groupId) => {
            const week = useTime.getState().week;
            if (!week || week.length === 0) return;
            if (groupId) {
                await get().loadGroupEvents(groupId, week[0], week[week.length - 1]);
                return;
            }
            for (const group of get().groups) {
                await get().loadGroupEvents(group.id, week[0], week[week.length - 1]);
            }
        },
        loadGroupEvents: async (groupId, start, end) => {
            if (!end) end = start;

            const group = get().groups.find(g => g.id === groupId);
            if (!group) return;

            // Initialize events array if not exists
            const events = group.events || [];
            const loadedRanges = group.loadedRanges || [];

            // Check if range is already loaded
            const isRangeLoaded = loadedRanges.some(range =>
                range.start <= start && range.end >= end
            );
            if (isRangeLoaded) return;

            const obj = { p_group_id: groupId, p_start_date: start, p_end_date: end || start }
            const { data, error } = await supabase.rpc('get_group_events', obj)
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת אירועים לקבוצה');

            // Add new events to flat array
            const newEvents = [...events];
            data.forEach(newEvent => {
                if (!newEvents.find(e => e.id === newEvent.id)) {
                    newEvents.push(newEvent);
                }
            });

            // Sort by date and start time
            newEvents.sort((a, b) => {
                const dateCompare = (a.date || '').localeCompare(b.date || '');
                if (dateCompare !== 0) return dateCompare;
                return (a.start || '').localeCompare(b.start || '');
            });

            set((state) => ({
                groups: state.groups.map(g => g.id === groupId ? {
                    ...g,
                    events: newEvents,
                    loadedRanges: [...loadedRanges, { start, end }]
                } : g)
            }));
        },
        createGroupEvent: async (groupId, obj) => {
            const { data, error } = await supabase.from('events').insert(obj).select().single();
            if (error) toastsActions.addFromError(error, 'שגיאה ביצירת אירוע');

            const group = get().groups.find(g => g.id === groupId);
            const events = group?.events || [];
            const newEvents = [...events, data];

            // Sort by date and start time
            newEvents.sort((a, b) => {
                const dateCompare = (a.date || '').localeCompare(b.date || '');
                if (dateCompare !== 0) return dateCompare;
                return (a.start || '').localeCompare(b.start || '');
            });

            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));
            await makeLink('events', data.id, 'groups', groupId);
        },
        updateGroupEvent: async (groupId, obj) => {
            const group = get().groups.find(g => g.id === groupId);
            const events = group?.events || [];
            const newEvents = events.map(e => e.id === obj.id ? obj : e);

            // Sort by date and start time
            newEvents.sort((a, b) => {
                const dateCompare = (a.date || '').localeCompare(b.date || '');
                if (dateCompare !== 0) return dateCompare;
                return (a.start || '').localeCompare(b.start || '');
            });

            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));

            const { error } = await supabase.from('events').update(obj).eq('id', obj.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון אירוע');
        },
        removeGroupEvent: async (groupId, date, objId) => {
            const group = get().groups.find(g => g.id === groupId);
            const events = group?.events || [];
            const newEvents = events.filter(e => e.id !== objId);

            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));

            const { error } = await supabase.from('events').delete().eq('id', objId);
            if (error) toastsActions.addFromError(error, 'שגיאה במחיקת אירוע');
        },

        // ----------- Group Students Management -----------
        // -------------------------------------------------
        loadClassMembers: async (group) => {
            if (!group || group.members) return;

            const { data, error } = await supabase
                .from('users_groups')
                .select('users( id, first_name, last_name, username, role, active, user_profiles( avatar_url ) )')
                .eq('group_id', group.id)
                .eq('users.active', true)
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת חברי קבוצה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, members: data.map(d => d.users) } : g) }));
        },

        // ----------- Group Tasks Management -----------
        // ----------------------------------------------
        loadGroupTasks: async (groupId) => {
            if (get().groups.find(g => g.id === groupId)?.tasks) return;
            const user = useUser.getState().user;
            const { data, error } = await supabase.rpc('get_user_group_tasks_by_group', {
                p_group_id: groupId,
                p_user_id: user.id
            })
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת משימות הקבוצה');
            set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, tasks: data } : g) }));
        },
        loadAllTaskAssignments: async (taskId) => {
            const { data, error } = await supabase.from('task_assignments').select('*').eq('task_id', taskId);
            if (error) toastsActions.addFromError(error, 'שגיאה בטעינת הקצאות המשימה');
            set((state) => ({ groups: state.groups.map(g => ({ ...g, tasks: g.tasks ? g.tasks.map(t => t.id === taskId ? { ...t, assignments: data } : t) : [] })) }));
        },
        createGroupTask: async (group, text, description, due_date) => {
            const task = {
                title: text,
                status: 'todo',
                description,
                due_date,
                created_by: useUser.getState().user.id,
            }
            const { data, error } = await supabase.from('tasks').insert(task).select().single();
            if (error) toastsActions.addFromError(error, 'שגיאה ביצירת משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: [...g.tasks, data] } : g) }));
            await makeLink('tasks', data.id, 'groups', group.id);
        },
        updateGroupTask: async (group, task, updates) => {
            const { error } = await supabase.from('tasks').update(updates).eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, ...updates } : t) } : g) }));
        },
        deleteGroupTask: async (group, task) => {
            const { error } = await supabase.from('tasks').delete().eq('id', task.id);
            if (error) toastsActions.addFromError(error, 'שגיאה במחיקת משימה');
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.filter(t => t.id !== task.id) } : g) }));
        },
        toggleGroupTaskStatus: withUser(async (user, group, task) => {
            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t) } : g) }));

            const { error } = await supabase.from('task_assignments').upsert(
                { task_id: task.id, student_id: user.id, status: newStatus },
                { onConflict: 'task_id,student_id' }
            )
            if (error) toastsActions.addFromError(error, 'שגיאה בעדכון סטטוס משימה '); 
        })
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