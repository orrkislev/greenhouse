import { createStore } from "./utils/createStore";
import { useUser } from "@/utils/store/useUser";
import { useTime } from "@/utils/store/useTime";
import { supabase } from "../supabase/client";
import { makeLink, prepareForGroupsTable } from "../supabase/utils";
import { addDays, format, isSameDay } from "date-fns";
import { createDataLoadingHook } from "./utils/createStore";

export const [useGroups, groupsActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    groups: [],
    loading: false,

    // ----------- Group Loading -----------
    // -------------------------------------
    loadUserGroups: withLoadingCheck(async (user) => {
        const { data, error } = await supabase.rpc('get_user_groups', {
            p_user_id: user.id
        })
        if (error) throw error;
        set({ groups: data });
    }),
    updateGroup: async (group, updates) => {
        const { error } = await supabase.from('groups').update(prepareForGroupsTable(updates)).eq('id', group.id);
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...group, ...updates } : g) }));
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

        let shouldLoad = false;
        let date = start;
        const events = { ...get().groups.find(g => g.id === groupId).events } || {}
        while (date <= end) {
            if (!events[date]) {
                shouldLoad = true;
                break;
            }
            date = addDays(date, 1);
        }
        if (!shouldLoad) return;

        const obj = { p_group_id: groupId, p_start_date: start, p_end_date: end || start }
        const { data, error } = await supabase.rpc('get_group_events', obj)
        if (error) throw error;
        date = new Date(start);
        while (date <= new Date(end)) {
            const dateStr = format(date, 'yyyy-MM-dd');
            if (!events[dateStr]) events[dateStr] = [];
            date = addDays(date, 1);
        }
        data.forEach(e => {
            if (!events[e.date].find(e => e.id === e.id)) events[e.date].push(e)
        })
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: events } : g) }));
    },
    createGroupEvent: async (groupId, obj) => {
        const { data, error } = await supabase.from('events').insert(obj).select().single();
        if (error) throw error;
        const newEvents = { ...get().groups.find(g => g.id === groupId).events } || {}
        if (!newEvents[data.date]) newEvents[data.date] = [];
        newEvents[data.date].push(data);
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));
        await makeLink('events', data.id, 'groups', groupId);
    },
    updateGroupEvent: async (groupId, obj) => {
        const { error } = await supabase.from('events').update(obj).eq('id', obj.id);
        if (error) throw error;
        const newEvents = { ...get().groups.find(g => g.id === groupId).events } || {}
        newEvents[obj.date] = newEvents[obj.date].map(e => e.id === obj.id ? obj : e)
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));
    },
    removeGroupEvent: async (groupId, date, objId) => {
        const { error } = await supabase.from('events').delete().eq('id', objId);
        if (error) throw error;
        const groupEvents = { ...get().groups.find(g => g.id === groupId).events } || {}
        groupEvents[date] = groupEvents[date]?.filter(e => e.id !== objId)
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: groupEvents } : g) }));
    },

    // ----------- Group Students Management -----------
    // -------------------------------------------------
    loadClassMembers: async (group) => {
        if (group.members) return;

        const { data, error } = await supabase
            .from('users_groups')
            .select('users( id, first_name, last_name, username, avatar_url, role )')
            .eq('group_id', group.id)
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, members: data.map(d => d.users) } : g) }));
    },

    // ----------- Group Tasks Management -----------
    // ----------------------------------------------
    loadGroupTasks: async (groupId) => {
        if (get().groups.find(g => g.id === groupId).tasks) return;
        const user = useUser.getState().user;
        const { data, error } = await supabase.rpc('get_user_group_tasks_by_group', {
            p_group_id: groupId,
            p_user_id: user.id
        })
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, tasks: data } : g) }));
    },
    loadAllTaskAssignments: async (taskId) => {
        const { data, error } = await supabase.from('task_assignments').select('*').eq('task_id', taskId);
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => ({ ...g, tasks: g.tasks ? g.tasks.map(t => t.id === taskId ? { ...t, assignments: data } : t) : [] })) }));
    },
    createGroupTask: async (group, text) => {
        const task = {
            title: text,
            status: 'todo',
            created_by: useUser.getState().user.id,
        }
        const { data, error } = await supabase.from('tasks').insert(task).select().single();
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: [...g.tasks, data] } : g) }));
        await makeLink('tasks', data.id, 'groups', group.id);
    },
    updateGroupTask: async (group, task, updates) => {
        const { error } = await supabase.from('tasks').update(updates).eq('id', task.id);
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, ...updates } : t) } : g) }));
    },
    deleteGroupTask: async (group, task) => {
        const { error } = await supabase.from('tasks').delete().eq('id', task.id);
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.filter(t => t.id !== task.id) } : g) }));
    },
    completeTask: async (group, task, userId) => {
        const { error } = await supabase.from('task_assignments').update({ statud: 'done' }).eq('task_id', task.id).eq('user_id', userId);
        if (error) throw error;
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? task : t) } : g) }));
    }
}))


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

export const useUserGroups = createDataLoadingHook(useGroups, 'groups', 'loadUserGroups');