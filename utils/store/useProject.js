import { useTime } from "@/utils/store/useTime";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { makeLink, prepareForProjectsTable, unLink } from "../supabase/utils";
import { supabase } from "../supabase/client";
import { resizeImage } from "../actions/storage actions";
import { newLogActions } from "./useLogs";
import { debounce } from "lodash";
import { format } from "date-fns";
import { toastsActions } from "./useToasts";


export const [useProjectData, projectActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        project: null,

        setProject: (project) => set({ project }),
        loadProject: withUser(async (user) => {
            set({ project: null, tasks: [] });
            const currTerm = useTime.getState().currTerm;
            if (!currTerm) return;
            const { data, error } = await supabase.from('projects').select(`
                *, 
                master:staff_public!master(first_name, last_name, avatar_url)
            `).eq('student_id', user.id).contains('term', [currTerm.id]).single();
            if (error) toastsActions.addFromError(error)
            if (data) set({ project: data })
        }),
        loadProjectById: async (projectId) => {
            const { data, error } = await supabase.from('projects').select(`
                *, 
                master:staff_public!master(first_name, last_name, avatar_url)
            `).eq('id', projectId).single();
            if (error) toastsActions.addFromError(error)
            if (data) set({ project: data })
        },
        continueProject: async (projectId) => {
            const newTerm = useTime.getState().currTerm.id;
            if (newTerm) { }
            // TODO: add the term to the project
        },

        // ------------------------------
        // ------ CRUD Project -------
        // ------------------------------
        createProject: withUser(async (user) => {
            const { data: projectData, error: projectError } = await supabase.from('projects').insert({
                student_id: user.id,
                status: 'draft',
                title: `הפרויקט של ${user.first_name} צריך כותרת`,
                term: [useTime.getState().currTerm.id],
            }).select().single();
            if (projectError) toastsActions.addFromError(projectError)
            set({ project: projectData });

            get().addTaskToProject({
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
            if (error) toastsActions.addFromError(error)
            set({ project: null });
            newLogActions.add(`סגרתי את הפרויקט ${project.title}. `)
        },

        updateOnSupabase: debounce(async () => {
            const { project } = get();
            if (!project) return;
            const { error } = await supabase.from('projects').update(prepareForProjectsTable(project)).eq('id', project.id);
            if (error) toastsActions.addFromError(error)
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
            const { data, error } = await supabase.from('projects').select(`
                    *,
                    master:staff_public!master(first_name, last_name, avatar_url)
                `).eq('student_id', user.id);
            if (error) toastsActions.addFromError(error)
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
            if (error) toastsActions.addFromError(error)
            const { data, error: downloadError } = await supabase.storage.from('images').getPublicUrl(url);
            if (downloadError) toastsActions.addFromError(downloadError)
            await get().updateMetadata({ image: data.publicUrl });
        }),



        // ------------------------------
        getProjectForStudent: async (studentId) => {
            const currTerm = useTime.getState().currTerm;
            if (!currTerm) return null;
            const { data, error } = await supabase.from('projects').select('*').eq('student_id', studentId).contains('term', [currTerm.id]).single();
            if (error) toastsActions.addFromError(error)
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
            if (error) toastsActions.addFromError(error)
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
            if (error) toastsActions.addFromError(error)
        },
        deleteTask: async (taskId) => {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) toastsActions.addFromError(error)
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
            if (error) toastsActions.addFromError(error)
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
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) toastsActions.addFromError(error)
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