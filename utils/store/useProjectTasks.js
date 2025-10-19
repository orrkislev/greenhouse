import { projectActions, projectUtils, useProject, useProjectData } from "@/utils/store/useProject";
import { makeLink, unLink } from "../supabase/utils";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";
import { format } from "date-fns";
import { useUser } from "./useUser";
import { useEffect } from "react";

export const [useProjectTasksData, projectTasksActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        tasks: [],
        view: 'list',
        loaded: false,

        loadAllTasks: async () => {
            if (!useProjectData.getState().project) return;
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: useProjectData.getState().project.id,
                p_target_types: ['tasks']
            })
            if (error) throw error;
            const tasks = data.map(item => item.data);
            tasks.forEach(task => task.context = projectUtils.getContext(task.project_id));
            set({ tasks });
        },
        loadNextTasks: async () => {
            if (!useProjectData.getState().project) return;
            const projectId = useProjectData.getState().project.id;
            const { data, error } = await supabase.rpc('get_next_project_tasks', { p_project_id: projectId })
            if (error) throw error;
            set({ tasks: data });
        },


        setView: (view) => {
            projectActions.updateProject({ taskStyle: view });
            if (view === 'list')
                set({ tasks: get().tasks.sort((a, b) => a.due_date.localeCompare(b.due_date)) });
            set({ view });
        },
        updateTask: async (taskId, updates) => {
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
            awaitget().completeTask(task.id);
        },
        completeTask: async (taskId) => {
            get().updateTask(taskId, { status: 'completed' });
        },
        cancelTask: (taskId) => {
            get().updateTask(taskId, { status: 'closed' });
        },


        addTaskToProject: async (task, projectId) => {
            if (!projectId) projectId = useProjectData.getState().project.id;
            if (!task.due_date) task.due_date = format(new Date(), 'yyyy-MM-dd');
            if (!task.status) task.status = 'todo';
            if (!task.student_id) task.student_id = useProjectData.getState().project.student_id;
            const { data, error } = await supabase.from('tasks').insert(task).select().single();
            if (error) throw error;
            await get().linkTaskToProject(data, projectId);
        },
        linkTaskToProject: async (task, projectId) => {
            await makeLink('tasks', task.id, 'projects', projectId);
            if (useProjectData.getState().project?.id === projectId) {
                task.context = projectUtils.getContext(projectId);
                set({ tasks: get().tasks.map(t => t.id === task.id ? task : t) });
            }
        },
        unlinkTaskFromProject: async (taskId) => {
            await unLink('tasks', taskId, 'projects', useProjectData.getState().project?.id);
            set({ tasks: get().tasks.filter(t => t.id !== taskId) });
        },

    }
});

export function useProjectTasks() {
    const project = useProject();
    const tasks = useProjectTasksData(state => state.tasks);
    useEffect(() => {
        projectTasksActions.loadAllTasks();
    }, [project?.id]);
    return tasks;
}

export function useProjectNextTasks() {
    const project = useProject();
    const tasks = useProjectTasksData(state => state.tasks);
    useEffect(() => {
        projectTasksActions.loadNextTasks();
    }, [project?.id]);
    return tasks;
}