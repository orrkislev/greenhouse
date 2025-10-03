import { useTime } from "@/utils/store/useTime";
import { format } from "date-fns";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { makeLink, prepareForProjectsTable } from "../supabase/utils";
import { supabase } from "../supabase/client";


export const [useProjectData, projectActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        project: null,

        setProject: (project) => set({ project }),
        loadProject: withLoadingCheck(async (user) => {
            set({ project: null });
            const { data, error } = await supabase.rpc('get_student_current_term_project', {
                p_student_id: user.id
            })
            if (error) return console.error(error);
            if (data) set({ project: data })
        }),
        continueProject: async (projectId) => {
            const { data, error } = await makeLink('projects', projectId, 'terms', useTime.getState().currTerm.id);
            if (error) throw error;
            get().loadProject();
        },

        loadProjectTerms: async () => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: get().project.id,
                p_target_types: ['terms']
            })
            if (error) throw error;
            set({ project: { ...get().project, terms: data.terms.map(t => t.terms) } });
        },

        loadProjectMasters: async () => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: get().project.id,
                p_target_types: ['mentorships']
            })
            if (error) throw error;
            const masters = [];
            for (const item of data.mentorships) {
                const { data: masterData, error: masterError } = await supabase.from('users').select('*').eq('id', item.mentor_id).single();
                if (masterError) throw masterError;
                masters.push(masterData);
            }
            set({ project: { ...get().project, masters } });
        },

        // ------------------------------
        // ------ CRUD Project -------
        // ------------------------------
        createProject: withUser(async (user) => {
            const { data: projectData, error: projectError } = await supabase.from('projects').insert({
                student_id: user.id,
                status: 'draft',
                title: `הפרויקט המגניב של ${user.first_name}`,
            }).select().single();
            if (projectError) throw projectError;
            set({ project: projectData });

            const { error: linkError } = await makeLink('projects', projectData.id, 'terms', useTime.getState().currTerm.id);
            if (linkError) throw linkError;

            // TODO MOVE THE TASK CREATION TO PROJECT TASKS
            const { data: taskData, error: taskError } = await supabase.from('tasks').insert({
                title: 'למלא הצהרת כוונות',
                description: 'זה חשוב',
                student_id: user.id,
                due_date: format(new Date(), 'yyyy-MM-dd'),
            }).select().single();
            if (taskError) throw taskError;
            const { error: linkError2 } = await makeLink('tasks', taskData.id, 'projects', projectData.id);
            if (linkError2) throw linkError2;
        }),
        updateProject: async (updates) => {
            const { error } = await supabase.from('projects').update(prepareForProjectsTable(updates)).eq('id', get().project.id);
            if (error) throw error;
            set((state) => ({ project: { ...state.project, ...updates } }));
        },

        closeProject: withUser(async (user) => {
            // TODO
        }),


        // ------------------------------
        // ------ Project Goals ---------
        // ------------------------------
        updateMetadata: async (updates) => {
            const metadata = get().project.metadata;
            Object.assign(metadata, updates);
            const { error } = await supabase.from('projects').update({ metadata: metadata }).eq('id', get().project.id);
            if (error) throw error;
            set((state) => ({ project: { ...state.project, metadata: metadata } }));
        },

        // ------------------------------
        // ------ Other Projects -------
        // ------------------------------
        allProjects: [],
        loadAllProjects: withUser(async (user) => {
            const { data, error } = await supabase.from('projects').select('*').eq('student_id', user.id);
            if (error) throw error;
            set({ allProjects: data });
        }),

        // ------------------------------
        // ------ Project Image -------
        // ------------------------------
        createImage: withUser(async (user, name) => {
            // TODO
            // const project = get().project;
            // if (!project) return;

            // // if (project.image === 'generating') return;
            // await get().updateProject({ image: 'generating' })

            // const imageData = await generateImage(name, folkArtStyle);
            // if (!imageData) {
            //     await get().updateProject({ image: 'no image' })
            //     return;
            // }

            // const byteCharacters = atob(imageData);
            // const byteNumbers = new Array(byteCharacters.length);
            // for (let i = 0; i < byteCharacters.length; i++) {
            //     byteNumbers[i] = byteCharacters.charCodeAt(i);
            // }
            // const byteArray = new Uint8Array(byteNumbers);
            // const blob = new Blob([byteArray], { type: 'image/png' });

            // const storageRef = ref(storage, `projects/${user.id}/${project.id}/image`);
            // await uploadBytes(storageRef, blob, { contentType: 'image/png' })
            // const url = await getDownloadURL(storageRef);
            // await get().updateProject({ image: url });
        }),
    }
});


export const useProject = createDataLoadingHook(useProjectData, 'project', 'loadProject');