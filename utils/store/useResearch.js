import { createDataLoadingHook, createStore } from "./utils/createStore";
import { createGoogleDoc } from "../actions/google actions";
import { useTime } from "./useTime";
import { supabase } from "../supabase/client";
import { makeLink } from "../supabase/utils";

export const [useResearchData, researchActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    research: null,
    allResearch: [],

    loadResearch: withLoadingCheck(async (user) => {
        set({ research: null });
        // const { data, error } = await supabase.rpc('get_student_current_term_research', { p_student_id: user.id });
        const { data, error } = await supabase.from('research').select('*')
            .eq('student_id', user.id).eq('status', 'active')
            .order('created_at', { ascending: false })
            .single();
        if (error) throw error;
        if (data) set({ research: data });
    }),
    loadAllResearch: withUser(async (user) => {
        const { data, error } = await supabase.from('research').select('*').eq('student_id', user.id);
        if (error) throw error;
        set({ allResearch: data });
    }),
    setResearchById: async (researchId) => {
        const research = get().allResearch.find(research => research.id === researchId);
        if (research) set({ research });
    },

    newResearch: withUser(async (user) => {
        const { data, error } = await supabase.from('research').insert({
            student_id: user.id,
            title: 'חקר חדש',
        }).select().single();
        if (error) throw error;
        set({ research: data });
    }),
    updateResearch: async (updates) => {
        if (!get().research) return;
        const { error } = await supabase.from('research').update(updates).eq('id', get().research.id);
        if (error) throw error;
        set({ research: { ...get().research, ...updates } });
    },
    deleteResearch: async (researchId) => {
        const { error } = await supabase.from('research').delete().eq('id', researchId);
        if (error) throw error;
        set({ research: null, allResearch: get().allResearch.filter(research => research.id !== researchId) });
    },

    updateSections: async (updates) => {
        const newSections = { ...get().research.sections } || {};
        Object.assign(newSections, updates);
        const { error } = await supabase.from('research').update({ sections: newSections }).eq('id', get().research.id);
        if (error) throw error;
        set({ research: { ...get().research, sections: newSections } });
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

    addSection: async (sectionType) => {
        const sections = get().research.sections;
        const newSections = [...sections, { type: sectionType, content: {}, order: sections.length, id: crypto.randomUUID() }];
        set({ research: { ...get().research, sections: newSections } });

        const { error } = await supabase.from('research').update({ sections: newSections }).eq('id', get().research.id);
        if (error) throw error;
    },
    updateSection: async (sectionId, contentUpdates) => {
        const sections = get().research.sections;
        const section = sections.find(section => section.id === sectionId);
        Object.assign(section.content, contentUpdates);
        set({ research: { ...get().research, sections: sections } });
        const { error } = await supabase.from('research').update({ sections: sections }).eq('id', get().research.id);
        if (error) throw error;
    },
    removeSection: async (sectionId) => {
        let sections = get().research.sections;
        sections = sections.filter(section => section.id !== sectionId);
        set({ research: { ...get().research, sections: sections } });
        const { error } = await supabase.from('research').update({ sections: sections }).eq('id', get().research.id);
        if (error) throw error;
    },
}));

export const useResearch = createDataLoadingHook(useResearchData, 'research', 'loadResearch');
export const useAllResearch = createDataLoadingHook(useResearchData, 'allResearch', 'loadAllResearch');