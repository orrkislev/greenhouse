import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { supabase } from "../supabase/client";
import { prepareForLogsTable } from "../supabase/utils";
import { useUser } from "./useUser";

export const useLogsData = create((set, get) => {
    useUser.subscribe(state => state.user?.id, (id) => {
        set({ logs: [] });
    });

    return {
        logs: [],

        loadLogs: withUser(async (user) => {
            set({ logs: [] });
            const { data, error } = await supabase.from('logs').select('*')
                .or(`user_id.eq.${user.id},mentor_id.eq.${user.id}`)
                .order('created_at', { ascending: false }).limit(20);
            if (error) throw error;
            for (const log of data) {
                if (log.context_table && log.context_id) {
                    const { data: context } = await supabase.from(log.context_table).select('id, title').eq('id', log.context_id).single();
                    if (context) log.context = context;
                }
                if (log.user_id !== user.id) {
                    const { data: user } = await supabase.from('users').select('id, first_name, last_name, role, user_profiles( avatar_url )').eq('id', log.user_id).single();
                    if (user) log.user = user;
                } else log.user = user;
                if (log.mentor_id) {
                    if (log.mentor_id !== user.id) {
                        // A student cannot read another user's row in `users` (RLS), so a mentor
                        // who is staff must be looked up via `staff_public` instead - see
                        // docs/rules/security.md.
                        const { data: mentor } = await supabase.from('staff_public').select('user_id, first_name, last_name, avatar_url').eq('user_id', log.mentor_id).maybeSingle();
                        if (mentor) log.mentor = { id: mentor.user_id, first_name: mentor.first_name, last_name: mentor.last_name, role: 'staff', avatar_url: mentor.avatar_url };
                    } else log.mentor = user;
                }
            }
            set({ logs: data });
        }),

        loadMoreLogs: withUser(async (user) => {
            set({ logs: [] });
            const lastId = get().logs[get().logs.length - 1].id;
            const { data, error } = await supabase.from('logs').select('*').eq('user_id', user.id).gt('id', lastId).order('created_at', { ascending: false }).limit(30);
            if (error) throw error;
            for (const log of data) {
                if (log.context_table && log.context_id) {
                    const { data: context, error: contextError } = await supabase.from(log.context_table).select('id, title').eq('id', log.context_id).single();
                    if (contextError) throw contextError;
                    log.context = context;
                }
                if (log.mentor_id) {
                    const { data: mentor } = await supabase.from('staff_public').select('user_id, first_name, last_name, avatar_url').eq('user_id', log.mentor_id).maybeSingle();
                    if (mentor) log.mentor = { id: mentor.user_id, first_name: mentor.first_name, last_name: mentor.last_name, role: 'staff', avatar_url: mentor.avatar_url };
                }
            }
            set((state) => ({ logs: [...state.logs, ...data] }));
        }),

        addLog: withUser(async (user, log) => {
            log.user_id = user.id;
            if (log.context) {
                log.context_table = log.context.table
                log.context_id = log.context.id
            }
            if (log.mentor) log.mentor_id = log.mentor.id
            const { data, error } = await supabase.from('logs').insert(prepareForLogsTable(log)).select().single();
            if (error) throw error;
            if (log.context) data.context = log.context;
            if (log.mentor) data.mentor = log.mentor;
            data.user = user;
            set((state) => ({ logs: [...state.logs, data] }));
        }),

        deleteLog: withUser(async (user, logId) => {
            set((state) => ({ logs: state.logs.filter(log => log.id !== logId) }));
            const { error } = await supabase.from('logs').delete().eq('id', logId).eq('user_id', user.id);
            if (error) throw error;
        }),
    }
});

export const logsActions = createStoreActions(useLogsData);

export const useLogs = createDataLoadingHook(useLogsData, 'logs', 'loadLogs');

export const useNewLog = create((set, get) => ({
    text: '',
    add: (text) => {
        set(state => ({ text: state.text + ' ' + text }));
    },
}));

export const newLogActions = createStoreActions(useNewLog);
