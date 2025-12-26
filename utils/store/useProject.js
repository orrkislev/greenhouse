import { useTime } from "@/utils/store/useTime";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { makeLink, prepareForProjectsTable } from "../supabase/utils";
import { supabase } from "../supabase/client";
import { resizeImage } from "../actions/storage actions";
import { newLogActions } from "./useLogs";
import { debounce } from "lodash";


export const [useProjectData, projectActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        project: null,

        setProject: (project) => set({ project }),
        loadProject: withUser(async (user) => {
            set({ project: null, tasks: [] });
            const { data, error } = await supabase.rpc('get_student_current_term_project', {
                p_student_id: user.id
            })
            if (error) return console.error(error);
            if (data) {
                set({ project: data })
                get().loadProjectMasters();
                get().loadTasks();
            }
        }),
        continueProject: async (projectId) => {
            await makeLink('projects', projectId, 'terms', useTime.getState().currTerm.id);
            get().loadProject();
        },

        getProjectTerms: async (projectID) => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: projectID,
                p_target_types: ['terms']
            })
            if (error) throw error;
            return data.map(item => item.data);
        },
        loadProjectTerms: async () => {
            const terms = await get().getProjectTerms(get().project.id);
            set({ project: { ...get().project, terms: terms } });
        },

        loadProjectMasters: async () => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: get().project.id,
                p_target_types: ['mentorships']
            })
            if (error) throw error;
            if (data.length === 0 || !data[0].data?.mentor_id) return;
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
                title: `הפרויקט של ${user.first_name} צריך כותרת`,
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
            set((state) => ({ project: { ...state.project, ...updates } }));
            get().updateOnSupabase();
        },

        closeProject: async () => {
            const project = get().project;
            if (!project) return;
            const { error } = await supabase.from('projects').delete().eq('id', project.id);
            if (error) throw error;
            set({ project: null });
            newLogActions.add(`סגרתי את הפרויקט ${project.title}. `)
        },

        updateOnSupabase: debounce(async () => {
            const { project } = get();
            if (!project) return;
            const { error } = await supabase.from('projects').update(prepareForProjectsTable(project)).eq('id', project.id);
            if (error) throw error;
        }, 1000),


        // ------------------------------
        // ------ Project Goals ---------
        // ------------------------------
        updateMetadata: async (updates) => {
            const metadata = { ...get().project.metadata };
            Object.assign(metadata, updates);
            set((state) => ({ project: { ...state.project, metadata: metadata } }));
            get().updateOnSupabase();
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
                .order('created_at', { ascending: false })
                .single();
            if (error) throw error;
            return data;
        },


        // ------------------------------
        // ------ Project Tasks -------
        // ------------------------------
        tasks: [],
        view: 'list',
        loadTasks: async () => {
            set({ tasks: [] });
            if (!useProjectData.getState().project) return;
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: useProjectData.getState().project.id,
                p_target_types: ['tasks']
            })
            if (error) throw error;
            const tasks = data.map(item => item.data).filter(task => task)
            tasks.forEach(task => task.context = projectUtils.getContext(task.project_id));
            set({ tasks });
        },
        // loadNextTasks: withLoadingCheck(async () => {
        //     set({ tasks: [] });
        //     if (!useProjectData.getState().project) return;
        //     const projectId = useProjectData.getState().project.id;
        //     const { data, error } = await supabase.rpc('get_next_project_tasks', { p_project_id: projectId })
        //     if (error) throw error;
        //     set({ tasks: data });
        // }),

        updateTask: async (taskId, updates) => {
            updates.updated_at = new Date().toISOString()
            set({ tasks: get().tasks.map(task => task.id === taskId ? { ...task, ...updates } : task) });
            const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
            if (error) throw error;
        },
        deleteTask: async (taskId) => {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) throw error;
            set({ tasks: get().tasks.filter(task => task.id !== taskId) });
        },

        changeOrder: (taskId, newSpot) => {
            const task = get().tasks.find(t => t.id === taskId);
            const newTasks = get().tasks.filter(t => t.id !== taskId);
            newTasks.splice(newSpot, 0, task);
            set({ tasks: newTasks });
        },

        completeTaskByTitle: async title => {
            const task = get().tasks.find(t => t.title.toLowerCase().includes(title.toLowerCase()));
            if (!task || task.status === 'completed') return;
            get().completeTask(task.id);
        },
        completeTask: async (taskId) => {
            get().updateTask(taskId, { status: 'completed' });
        },


        addTaskToProject: async (task, projectId) => {
            if (!projectId) projectId = useProjectData.getState().project.id;
            if (!task.due_date) task.due_date = format(new Date(), 'yyyy-MM-dd');
            if (!task.status) task.status = 'todo';
            if (!task.student_id) task.student_id = useProjectData.getState().project.student_id;
            const { data, error } = await supabase.from('tasks').insert(task).select().single();
            if (error) throw error;
            await get().linkTaskToProject(data, projectId);
            newLogActions.add(`הוספתי משימה חדשה בפרויקט. `);
            set(state => ({ tasks: [...state.tasks, data] }));
        },
        linkTaskToProject: async (task, projectId) => {
            await makeLink('tasks', task.id, 'projects', projectId);
            if (useProjectData.getState().project?.id === projectId) {
                task.context = projectUtils.getContext(projectId);
                set({ tasks: get().tasks.map(t => t.id === task.id ? task : t) });
            }
        },
        deleteTask: async (taskId) => {
            const projectId = useProjectData.getState().project?.id;
            if (!projectId) return;
            await supabase.from('tasks').delete().eq('id', taskId);
            await unLink('tasks', taskId, 'projects', projectId);
            if (useProjectData.getState().project?.id === projectId) {
                set({ tasks: get().tasks.filter(t => t.id !== taskId) });
            }
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
    },
}