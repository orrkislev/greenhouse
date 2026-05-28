import { create } from "zustand";
import { createStoreActions, withUser } from "./utils/storeUtils";
import { supabase } from "../supabase/client";
import { useUser } from "./useUser";
import { toastsActions } from "./useToasts";
import { format } from "date-fns";

export const usePlanning = create((set, get) => {
    useUser.subscribe(state => state.user?.id, () => {
        set({ personalTasks: [], assignedTasks: [] });
    });

    return {
        personalTasks: [],
        assignedTasks: [],

        loadAllTasks: withUser(async (user) => {
            const [personalRes, assignedRes] = await Promise.all([
                supabase
                    .from('tasks')
                    .select('*')
                    .eq('student_id', user.id)
                    .is('group_id', null)
                    .neq('status', 'archived')
                    .neq('status', 'closed')
                    .order('position', { ascending: true }),
                supabase
                    .from('tasks')
                    .select('*')
                    .contains('assigned_to', [user.id])
                    .neq('status', 'archived')
                    .neq('status', 'closed'),
            ]);

            if (personalRes.error) toastsActions.addFromError(personalRes.error, 'שגיאה בטעינת משימות אישיות');
            if (assignedRes.error) toastsActions.addFromError(assignedRes.error, 'שגיאה בטעינת משימות מוקצות');

            // Exclude tasks that are linked to projects or study_paths (those belong to other sections)
            const candidateIds = (personalRes.data || []).map(t => t.id);
            let linkedTaskIds = new Set();
            if (candidateIds.length > 0) {
                const [linksA, linksB] = await Promise.all([
                    supabase.from('links').select('a_id')
                        .eq('a_table', 'tasks').in('b_table', ['projects', 'study_paths']).in('a_id', candidateIds),
                    supabase.from('links').select('b_id')
                        .eq('b_table', 'tasks').in('a_table', ['projects', 'study_paths']).in('b_id', candidateIds),
                ]);
                (linksA.data || []).forEach(l => linkedTaskIds.add(l.a_id));
                (linksB.data || []).forEach(l => linkedTaskIds.add(l.b_id));
            }

            const personalTasks = (personalRes.data || []).filter(t =>
                !linkedTaskIds.has(t.id) && !t.metadata?.english
            );

            set({
                personalTasks,
                assignedTasks: assignedRes.data || [],
            });
        }),

        addPersonalTask: withUser(async (user, title) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert({ title, student_id: user.id, status: 'todo', created_by: user.id })
                .select()
                .single();
            if (error) { toastsActions.addFromError(error, 'שגיאה ביצירת משימה'); return; }
            set({ personalTasks: [...get().personalTasks, data] });
        }),

        addPersonalTaskWithDate: withUser(async (user, title, dateStr) => {
            const { data, error } = await supabase
                .from('tasks')
                .insert({ title, student_id: user.id, status: 'todo', created_by: user.id, planned_date: dateStr })
                .select()
                .single();
            if (error) { toastsActions.addFromError(error, 'שגיאה ביצירת משימה'); return; }
            set({ personalTasks: [...get().personalTasks, data] });
        }),

        deletePersonalTask: withUser(async (user, taskId) => {
            const task = get().personalTasks.find(t => t.id === taskId);
            if (!task || task.student_id !== user.id || task.group_id) return;
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) { toastsActions.addFromError(error, 'שגיאה במחיקת משימה'); return; }
            set({ personalTasks: get().personalTasks.filter(t => t.id !== taskId) });
        }),

        setPlannedDate: async (taskId, dateStr) => {
            const { error } = await supabase
                .from('tasks')
                .update({ planned_date: dateStr || null })
                .eq('id', taskId);
            if (error) { toastsActions.addFromError(error, 'שגיאה בעדכון תאריך תכנון'); return; }

            const updateTask = t => t.id === taskId ? { ...t, planned_date: dateStr || null } : t;
            set({
                personalTasks: get().personalTasks.map(updateTask),
                assignedTasks: get().assignedTasks.map(updateTask),
            });
        },

        completePersonalTask: async (taskId) => {
            const task = get().personalTasks.find(t => t.id === taskId);
            if (!task) return;
            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
            if (error) { toastsActions.addFromError(error, 'שגיאה בעדכון סטטוס משימה'); return; }
            set({ personalTasks: get().personalTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) });
        },
    };
});

export const planningActions = createStoreActions(usePlanning);

export function useTodayPlannedTasks() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const personal = usePlanning(state => state.personalTasks);
    const assigned = usePlanning(state => state.assignedTasks);
    return [...personal, ...assigned].filter(t => t.planned_date === today && t.status !== 'completed');
}
