import { create } from "zustand";
import { createDataLoadingHook, createStoreActions, withUser } from "./utils/storeUtils";
import { supabase } from "../supabase/client";
import { useUser } from "./useUser";

export const useVocationData = create((set, get) => {
    useUser.subscribe(originalUser => {
        set({ jobs: [] });
    });
    
    return {
        jobs: [],

        loadJobs: withUser(async (user) => {
            set({ jobs: [] });
            const { data, error } = await supabase.from('vocation').select('*').eq('user_id', user.id);
            if (error) throw error;
            set({ jobs: data });
        }),

        addJob: withUser(async (user ) => {
            const { data, error } = await supabase.from('vocation').insert({ user_id: user.id }).select().single();
            if (error) throw error;
            set({ jobs: [...get().jobs, data] });
        }),

        updateJob: async (job, updates) => {
            const { error } = await supabase.from('vocation').update(updates).eq('id', job.id);
            if (error) throw error;
            set({ jobs: get().jobs.map(j => j.id === job.id ? { ...j, ...updates } : j) });
        },

        removeJob: async (jobId) => {
            const { error } = await supabase.from('vocation').delete().eq('id', jobId);
            if (error) throw error;
            set({ jobs: get().jobs.filter(j => j.id !== jobId) });
        }
    }
});

export const vocationActions = createStoreActions(useVocationData);

export const useVocation = createDataLoadingHook(useVocationData, 'jobs', 'loadJobs');