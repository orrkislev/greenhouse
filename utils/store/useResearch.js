import { createDataLoadingHook, createStore } from "./utils/createStore";
import { createGoogleDoc } from "../actions/google actions";
import { useTime } from "./useTime";
import { supabase } from "../supabase/client";
import { debounce } from "lodash";

export const [useResearchData, researchActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    research: null,
    allResearch: [],

    loadResearch: withLoadingCheck(async (user) => {
        set({ research: null });
        // const { data, error } = await supabase.rpc('get_student_current_term_research', { p_student_id: user.id });
        const { data, error } = await supabase.from('research').select('*')
            .eq('student_id', user.id).eq('status', 'active')
            .single();
        if (error) throw error;
        if (data) set({ research: data });
    }),
    loadAllResearch: withUser(async (user) => {
        const { data, error } = await supabase.from('research').select('*').eq('student_id', user.id);
        if (error) throw error;
        const latestResearch = data.filter(research => research.status === 'active').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        set({ allResearch: data, research: latestResearch[0] });
    }),
    setResearchById: async (researchId) => {
        const research = get().allResearch.find(research => research.id === researchId);
        if (research) set({ research });
    },


    updateOnSupabase: debounce(async () => {
        const { research } = get();
        if (!research) return;
        const { error } = await supabase.from('research').update(research).eq('id', research.id);
        if (error) throw error;
    }, 1000),

    newResearch: withUser(async (user) => {
        const { data, error } = await supabase.from('research').insert({
            student_id: user.id,
            title: 'חקר חדש',
        }).select().single();
        if (error) throw error;
        set({ research: data, allResearch: [...get().allResearch, data] });
    }),
    updateResearch: async (updates) => {
        if (!get().research) return;
        set({ research: { ...get().research, ...updates }, allResearch: get().allResearch.map(research => research.id === get().research.id ? { ...get().research, ...updates } : research) });
        get().updateOnSupabase();
    },
    deleteResearch: async (researchId) => {
        const { error } = await supabase.from('research').delete().eq('id', researchId);
        if (error) throw error;
        set({ research: null, allResearch: get().allResearch.filter(research => research.id !== researchId) });
    },

    updateSections: async (updates) => {
        const sections = get().research.sections;
        Object.assign(sections, updates);
        set({ research: { ...get().research, sections: sections } });
        get().updateOnSupabase();
    },

    createGoogleDoc: withUser(async (user) => {
        if (!get().research) return;
        const currTerm = useTime.getState().currTerm;
        const research = get().research;
        if (!research || research.docUrl) return;
        const docUrl = await createGoogleDoc({
            refreshToken: user.googleRefreshToken,
            name: 'חקר ' + research.title,
            title: research.title,
            subtitle: 'עבודת חקר של ' + user.first_name + ' ' + user.last_name + ', תקופת ' + currTerm.name
        });
        get().updateResearch({ docUrl });
    }),


    getStudentLatestResearch: async (studentId) => {
        const { data, error } = await supabase.from('research').select('*').eq('student_id', studentId).eq('status', 'active').single();
        if (error) throw error;
        return data;
    },
}));

export const useResearch = createDataLoadingHook(useResearchData, 'research', 'loadResearch');
export const useAllResearch = createDataLoadingHook(useResearchData, 'allResearch', 'loadAllResearch');

export const researchUtils = {
    getNeedReview: (research) => {
        const terms = useTime.getState().terms
        const researchCreatedDate = new Date(research.created_at)
        const term = terms.find(term => new Date(term.start) <= researchCreatedDate && new Date(term.end) >= researchCreatedDate)
        if (!term) return false
        const currTerm = useTime.getState().currTerm
        if (term.id === currTerm.id) return false
        return !research.metadata?.review
    }
}