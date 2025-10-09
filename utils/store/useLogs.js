import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";
import { prepareForLogsTable } from "../supabase/utils";

export const [useLogsData, logsActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    logs: [],

    loadLogs: withLoadingCheck(async (user) => {
        const { data, error } = await supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        for (const log of data) {
            if (log.context_table && log.context_id) {
                const { data: context, error: contextError } = await supabase.from(log.context_table).select('id, title').eq('id', log.context_id).single();
                if (contextError) throw contextError;
                log.context = context;
            }
            if (log.mentor_id) {
                const { data: mentor, error: mentorError } = await supabase.from('users').select('id, first_name, last_name, avatar_url').eq('id', log.mentor_id).single();
                if (mentorError) throw mentorError;
                log.mentor = mentor;
            }
        }
        set({ logs: data });
    }),

    loadMoreLogs: withLoadingCheck(async (user) => {
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
                const { data: mentor, error: mentorError } = await supabase.from('users').select('id, first_name, last_name, avatar_url').eq('id', log.mentor_id).single();
                if (mentorError) throw mentorError;
                log.mentor = mentor;
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
        set((state) => ({ logs: [...state.logs, data] }));
    }),

    deleteLog: withUser(async (user, logId) => {
        set((state) => ({ logs: state.logs.filter(log => log.id !== logId) }));
        const { error } = await supabase.from('logs').delete().eq('id', logId).eq('user_id', user.id);
        if (error) throw error;
    }),
}));

export const useLogs = createDataLoadingHook(useLogsData, 'logs', 'loadLogs');
