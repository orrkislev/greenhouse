import { useTime } from "@/utils/store/useTime";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { makeLink, prepareForProjectsTable } from "../supabase/utils";
import { supabase } from "../supabase/client";
import { resizeImage } from "../actions/storage actions";
import { newLogActions } from "./useLogs";


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
            if (data) {
                set({ project: data })
                get().loadProjectMasters();
            }
        }),
        continueProject: async (projectId) => {
            await makeLink('projects', projectId, 'terms', useTime.getState().currTerm.id);
            get().loadProject();
        },

        loadProjectTerms: async () => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: get().project.id,
                p_target_types: ['terms']
            })
            if (error) throw error;
            set({ project: { ...get().project, terms: data.map(item => item.data) } });
        },

        loadProjectMasters: async () => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: get().project.id,
                p_target_types: ['mentorships']
            })
            if (error) throw error;
            if (data.length === 0) return;
            const mentorId = data[0].data.mentor_id;
            const { data: masterData, error: masterError } = await supabase.from('users').select('*').eq('id', mentorId).single();
            if (masterError) throw masterError;
            set({ project: { ...get().project, master: masterData } });
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

            makeLink('projects', projectData.id, 'terms', useTime.getState().currTerm.id);

            projectTasksActions.addTaskToProject({
                title: 'למלא הצהרת כוונות',
                description: 'זה חשוב',
            }, projectData.id);

            newLogActions.add(`התחלתי פרויקט חדש בתקופת ${useTime.getState().currTerm.name}. `);
        }),
        updateProject: async (updates) => {
            const { error } = await supabase.from('projects').update(prepareForProjectsTable(updates)).eq('id', get().project.id);
            if (error) throw error;
            set((state) => ({ project: { ...state.project, ...updates } }));
        },

        closeProject: async () => {
            const project = get().project;
            if (!project) return;
            const { error } = await supabase.from('projects').delete().eq('id', project.id);
            if (error) throw error;
            set({ project: null });
            newLogActions.add(`סגרתי את הפרויקט ${project.title}. `)
        },


        // ------------------------------
        // ------ Project Goals ---------
        // ------------------------------
        updateMetadata: async (updates) => {
            const metadata = { ...get().project.metadata };
            Object.assign(metadata, updates);
            set((state) => ({ project: { ...state.project, metadata: metadata } }));
            const { error } = await supabase.from('projects').update({ metadata: metadata }).eq('id', get().project.id);
            if (error) throw error;
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

        uploadImage: withUser(async (user, file) => {
            const resizedBlob = await resizeImage(file, 1024);
            const url = `${user.id}/project_${get().project.id}.png`;
            const { error } = await supabase.storage.from('images').upload(url, resizedBlob, {
                upsert: true,
            });
            if (error) throw error;
            const { data, error: downloadError } = await supabase.storage.from('images').getPublicUrl(url);
            if (downloadError) throw downloadError;
            await get().updateMetadata({ image: data.publicUrl });
        }),



        // ------------------------------
        getProjectForStudent: async (studentId) => {
            const { data, error } = await supabase.from('projects').select('*')
                .eq('student_id', studentId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .single();
            if (error) throw error;
            return data;
        },
    }
});


export const useProject = createDataLoadingHook(useProjectData, 'project', 'loadProject');
export const useAllProjects = createDataLoadingHook(useProjectData, 'allProjects', 'loadAllProjects');

export const projectUtils = {
    getContext: (projectId) => {
        const project = projectId ?
            useProjectData.getState().allProjects.find(project => project.id === projectId) :
            useProjectData.getState().project;
        if (!project) return null;
        return {
            table: 'projects',
            id: project.id,
            title: project.title,
        }
    }
}