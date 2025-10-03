import { projectActions, useProjectData } from "@/utils/store/useProject";
import { makeLink } from "../supabase/utils";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";

export const [useProjectTasksData, projectTasksActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        tasks: [],
        view: 'list',
        loaded: false,

        loadAllTasks: withLoadingCheck(async (user) => {
            const { data, error } = await supabase.rpc('get_linked_items', {
                p_table_name: 'projects',
                p_item_id: useProjectData.getState().project.id,
                p_target_types: ['tasks']
            })
            if (error) throw error;
            set({ tasks: data });
        }),
        loadNextTasks: withLoadingCheck(async (user) => {
            const { data, error } = await supabase.rpc('get_next_project_tasks', {
                p_project_id: useProjectData.getState().project.id
            })
            if (error) throw error;
            set({ tasks: data });
        }),


        setView: (view) => {
            projectActions.updateProject({ taskStyle: view });
            if (view === 'list')
                set({ tasks: get().tasks.sort((a, b) => a.due_date.localeCompare(b.due_date)) });
            set({ view });
        },
        addTask: withUser(async (user, task) => {
            const { data, error } = await supabase.from('tasks').insert({ ...task, completed: false }).select().single();
            if (error) throw error;
            get().setTasks([...get().tasks, { ...task, id: data.id }]);
        }),
        updateTask: withUser(async (user, taskId, updatedFields) => {
            const { data, error } = await supabase.from('tasks').update(updatedFields).eq('id', taskId).select().single();
            if (error) throw error;
            set({
                tasks: get().tasks.map(task =>
                    task.id === taskId ? { ...task, ...updatedFields } : task
                )
            });
        }),
        deleteTask: withUser(async (user, taskId) => {
            const { data, error } = await supabase.from('tasks').delete().eq('id', taskId).select().single();
            if (error) throw error;
            set({ tasks: get().tasks.filter(task => task.id !== taskId) });
        }),
        changeOrder: (taskId, newSpot) => {
            const task = get().tasks.find(t => t.id === taskId);
            const newTasks = get().tasks.filter(t => t.id !== taskId);
            newTasks.splice(newSpot, 0, task);
            set({ tasks: newTasks });
        },



        completeTaskByLabel: withUser(async (user, label) => {
            const task = get().tasks.find(t => t.title === label);
            if (!task || task.completed) return;
            get().completeTask(task.id);
        }),
        completeTask: async (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            const { data, error } = await supabase.from('tasks').update({ completed: true }).eq('id', taskId).select().single();
            if (error) throw error;
            if (!task) return;
            set({
                tasks: get().tasks.map(task =>
                    task.id === taskId ? { ...task, completed: true } : task
                )
            });
        },
        cancelTask: (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;
            get().updateTask(taskId, { completed: false });
        },


        addTaskToProject: async (task, projectId) => {
            const { data, error } = await supabase.from('tasks').insert(task).select().single();
            if (error) throw error;
            const { error: linkError } = await makeLink('tasks', data.id, 'projects', projectId);
            if (linkError) throw linkError;
        },
    }
});

export const useProjectTasks = createDataLoadingHook(useProjectTasksData, 'tasks', 'loadAllTasks');
export const useProjectNextTasks = createDataLoadingHook(useProjectTasksData, 'tasks', 'loadNextTasks');