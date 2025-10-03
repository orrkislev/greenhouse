import { newPathData } from "@/app/(app)/study/components/example study paths";
import { useEffect } from "react";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";
import { useUser } from "./useUser";
import { makeLink, prepareForStudyPathsTable, prepareForTasksTable } from "../supabase/utils";

export const [useStudy, studyActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    paths: [],
    sideContext: [],

    loadPaths: withLoadingCheck(async (user) => {
        if (get().paths.length > 0) return;

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

        const { error: linkError } = await makeLink('tasks', stepData.id, 'study_paths', pathData.id);
        if (linkError) throw linkError;

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

    addStep: async (pathId, step) => {
        const path = get().paths.find(path => path.id === pathId)
        step.position = path.steps.length
        step.student_id = useUser.getState().user.id
        const { data, error } = await supabase.from('tasks').insert(prepareForTasksTable(step)).select().single();
        if (error) throw error;
        await makeLink('tasks', data.id, 'study_paths', pathId);
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, steps: [...path.steps, data] } : path) }))
    },
    updateStep: async (pathId, stepId, stepData) => {
        const path = get().paths.find(path => path.id === pathId)
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? path : path) }))
        const step = path.steps.find(step => step.id === stepId)
        Object.assign(step, stepData)
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
    createImage: withUser(async (user, path, name) => {
        // TODO
        // await get().updatePath(path.id, { image: null })

        // const imageData = await generateImage(name);
        // if (!imageData) return;

        // const byteCharacters = atob(imageData);
        // const byteNumbers = new Array(byteCharacters.length);
        // for (let i = 0; i < byteCharacters.length; i++) {
        //     byteNumbers[i] = byteCharacters.charCodeAt(i);
        // }
        // const byteArray = new Uint8Array(byteNumbers);
        // const blob = new Blob([byteArray], { type: 'image/png' });

        // const storageRef = ref(storage, `studyPaths/${user.id}/${path.id}`);
        // await uploadBytes(storageRef, blob, { contentType: 'image/png' })
        // const url = await getDownloadURL(storageRef);
        // await get().updatePath(path.id, { image: url });
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
