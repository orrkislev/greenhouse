import { useEffect } from "react";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";
import { useUser } from "./useUser";
import { makeLink, prepareForStudyPathsTable, prepareForTasksTable, unLink } from "../supabase/utils";
import { resizeImage } from "../actions/storage actions";

export const EnglishPathID = 'd5b55c53-5f6b-4832-97cf-3fbb99037218';

export const [useStudy, studyActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    paths: [],
    sideContext: [],

    loadPaths: withLoadingCheck(async (user) => {
        set({ paths: [] });
        const { data, error } = await supabase.from('study_paths').select('*').eq('student_id', user.id);
        if (error) throw error;

        for (const path of data) {
            const { data: stepsData, error: stepsError } = await supabase.rpc('get_linked_items', {
                p_table_name: 'study_paths',
                p_item_id: path.id,
                p_target_types: ['tasks']
            });
            if (stepsError) throw stepsError;
            path.steps = stepsData ? stepsData.map(t => t.data) : [];
        }


        if (!data.some(path => path.id === EnglishPathID)) {
            const { data: englishPath, error: englishPathError } = await supabase.from('study_paths').select('*').eq('id', EnglishPathID).single();
            if (englishPath) {
                data.push(englishPath);
                const { data: stepsData, error: stepsError } = await supabase.from('tasks').select('*').eq('student_id', user.id).eq('metadata->>english', 'true');
                if (stepsError) throw stepsError;
                englishPath.steps = stepsData
            }
        }
        set({ paths: data });
    }),

    addPath: async () => {
        const { data: pathData, error: pathError } = await supabase.from('study_paths').insert({
            title: 'תחום הלמידה שלי',
            description: 'למה אני לומד את זה?',
            student_id: useUser.getState().user.id,
            status: 'active',
        }).select().single();
        if (pathError) throw pathError;

        const { data: stepData, error: stepError } = await supabase.from('tasks').insert(prepareForTasksTable({
            title: 'מה הדבר הראשון שאלמד בנושא הזה',
            description: 'איך בדיוק אני אלמד את זה?',
            student_id: useUser.getState().user.id,
            position: 0,
        })).select().single();
        if (stepError) throw stepError;

        await makeLink('tasks', stepData.id, 'study_paths', pathData.id);

        set({ paths: [...get().paths, { ...pathData, steps: [stepData] }] })
    },
    deletePath: async (pathId) => {
        const { error } = await supabase.from('study_paths').delete().eq('id', pathId);
        if (error) throw error;
        set({ paths: get().paths.filter(path => path.id !== pathId) })
    },
    updatePath: async (pathId, pathData) => {
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, ...pathData } : path) }))
        await supabase.from('study_paths').update(prepareForStudyPathsTable(pathData)).eq('id', pathId);
    },
    updatePathMetadata: async (pathId, metadata) => {
        const path = get().paths.find(path => path.id === pathId)
        const newMetadata = { ...path.metadata, ...metadata }
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, metadata: newMetadata } : path) }))
        await supabase.from('study_paths').update({ metadata: newMetadata }).eq('id', pathId);
    },

    addStep: async (pathId, step) => {
        const path = get().paths.find(path => path.id === pathId)
        step.position = path.steps.length
        step.student_id = useUser.getState().user.id
        if (path.id === EnglishPathID) step.metadata = { ...step.metadata, english: true }
        const { data, error } = await supabase.from('tasks').insert(prepareForTasksTable(step)).select().single();
        if (error) throw error;
        await get().linkStepToPath(data, pathId);
    },
    linkStepToPath: async (step, pathId) => {
        await makeLink('tasks', step.id, 'study_paths', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, steps: [...path.steps, step] } : path) }))
    },
    unlinkStepFromPath: async (stepId) => {
        const path = useStudy.getState().paths.find(path => path.steps.some(step => step.id === stepId))
        if (!path) return;
        await unLink('tasks', stepId, 'study_paths', path.id);
        if (path) {
            set(state => ({ paths: state.paths.map(path => path.id === path.id ? { ...path, steps: path.steps.filter(step => step.id !== stepId) } : path) }))
        }
    },
    updateStep: async (pathId, stepId, stepData) => {
        const path = get().paths.find(path => path.id === pathId)
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
        const step = path.steps.find(step => step.id === stepId)
        Object.assign(step, stepData)
        step.updated_at = new Date().toISOString()
        const { error } = await supabase.from('tasks').update(prepareForTasksTable(stepData)).eq('id', stepId);
        if (error) throw error;
    },
    deleteStep: async (pathId, subjectId, stepId) => {
        const path = get().paths.find(path => path.id === pathId)
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
        path.steps = path.steps.filter(step => step.id !== stepId)
        const { error } = await supabase.from('tasks').delete().eq('id', stepId);
        if (error) throw error;
    },

    // ------------------------------
    // ---------- sources
    // ------------------------------
    addSource: async (pathId, source) => {
        const path = get().paths.find(path => path.id === pathId)
        path.sources.push(source)
        await supabase.from('study_paths').update({ sources: path.sources }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },
    updateSource: async (pathId, sourceIndex, sourceData) => {
        const path = get().paths.find(path => path.id === pathId)
        path.sources[sourceIndex] = sourceData
        await supabase.from('study_paths').update({ sources: path.sources }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },
    deleteSource: async (pathId, sourceIndex) => {
        const path = get().paths.find(path => path.id === pathId)
        if (!path.sources) return;
        path.sources = path.sources.filter((_, index) => index !== sourceIndex)
        await supabase.from('study_paths').update({ sources: path.sources }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },

    // ------------------------------
    // ---------- vocabulary
    // ------------------------------
    addVocabulary: async (pathId, word) => {
        const path = get().paths.find(path => path.id === pathId)
        path.vocabulary.push(word)
        await supabase.from('study_paths').update({ vocabulary: path.vocabulary }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },
    updateVocabulary: async (pathId, wordIndex, word) => {
        const path = get().paths.find(path => path.id === pathId)
        path.vocabulary[wordIndex] = word
        await supabase.from('study_paths').update({ vocabulary: path.vocabulary }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },
    deleteVocabulary: async (pathId, wordIndex) => {
        const path = get().paths.find(path => path.id === pathId)
        path.vocabulary = path.vocabulary.filter((_, index) => index !== wordIndex)
        await supabase.from('study_paths').update({ vocabulary: path.vocabulary }).eq('id', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
    },

    uploadImage: withUser(async (user, pathId, file) => {
        const blob = await resizeImage(file, 1024);
        const url = `studypaths/${user.id}/${pathId}/image`;
        const { error } = await supabase.storage.from('images').upload(url, blob, {
            upsert: true,
        });
        if (error) throw error;
        const { data: downloadData, error: downloadError } = await supabase.storage.from('images').getPublicUrl(url);
        if (downloadError) throw downloadError;
        await get().updatePathMetadata(pathId, { image: downloadData.publicUrl });
    }),

    // ------------------------------
    loadSideContext: async () => {
        const { data, error } = await supabase.from('misc').select('data').eq('name', 'studySideContext').single();
        if (error) throw error;
        set({ sideContext: data.data.data });
    },
    saveSideContext: async (sideContext) => {
        const { error } = await supabase.from('misc').update({ data: { 'data': sideContext } }).eq('name', 'studySideContext');
        if (error) throw error;
        set({ sideContext });
    }
}));
export const useStudyPaths = createDataLoadingHook(useStudy, 'paths', 'loadPaths');


export function useStudySideContext() {
    const sideContext = useStudy(state => state.sideContext);
    useEffect(() => {
        studyActions.loadSideContext();
    }, []);
    return sideContext
}


export const studyUtils = {
    getContext: (pathId) => {
        const path = useStudy.getState().paths.find(path => path.id === pathId);
        if (!path) return null;
        return { table: 'study_paths', id: pathId, title: path.title };
    }
}