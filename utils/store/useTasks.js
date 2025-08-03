import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/store/useUser";
import { format } from "date-fns";
import { addDoc, and, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand";
import { LOG_TYPES, TASK_FORMATS, TASK_STATUSES } from "@/utils/constants/constants";

export const useTasks = create((set, get) => {
    const userId = () => useUser.getState().user.id;
    const getRef = () => collection(db, `users/${userId()}/tasks`);

    return {
        tasks: [],
        clear: () => set({ tasks: [] }),

        loadTodayTasks: async () => {
            const uid = userId();
            if (!uid) return;
            const today = format(new Date(), 'yyyy-MM-dd');
            const tasksQuery = query(getRef(), and(
                where("date", "==", today),
            ));
            const tasksSnap = await getDocs(tasksQuery);
            const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ tasks });
        },
        loadWeekTasks: async (week) => {
            const uid = userId()
            if (!uid || !week || week.length === 0) return;

            const tasksQuery = query(getRef(),
                where("date", ">=", week[0]), where("date", "<=", week[week.length - 1]),
            );
            const tasksSnap = await getDocs(tasksQuery);
            const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ tasks });
        },
        createTask: async (task) => {
            const newDoc = await addDoc(getRef(), task);
            set((state) => ({ tasks: [...state.tasks, { ...task, id: newDoc.id }] }));
        },
        updateTask: (taskId, updatedTask) => {
            updateDoc(doc(getRef(), taskId), updatedTask);
            set((state) => {
                const updatedTasks = state.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                );
                return { tasks: updatedTasks };
            });
        },
        deleteTask: (taskId) => {
            deleteDoc(doc(getRef(), taskId));
            set((state) => ({
                tasks: state.tasks.filter(task => task.id !== taskId)
            }));
        },


        onLogTask: async (taskId, log) => {
            const task = useTasks.getState().tasks.find(t => t.id === taskId);
            if (!task) return;

            // Case 1: Log marks task complete
            if (log.type === LOG_TYPES.COMPLETE_TASK)
                get().setTaskStatus(taskId, TASK_STATUSES.COMPLETED);

            // Case 2: Log adds progress to a progress-based task
            else if (log.type === LOG_TYPES.TASK_PROGRESS && task.type === TASK_FORMATS.PROGRESS_BASED) {
                const current = task.progressCurrent || 0;
                const amount = log.amount || 1;
                const newProgress = current + amount;
                await get().updateTask(taskId, {
                    progressCurrent: newProgress
                });

                if (newProgress >= task.progressGoal) {
                    get().setTaskStatus(taskId, TASK_STATUSES.COMPLETED);
                }
            }

            // Apply task updates if any
            if (Object.keys(updates).length > 0) {
                await get().updateTask(taskId, updates);
            }
        },
        onLogRecord: async (recordId) => {
            const tasks = useTasks.getState().tasks.filter(t => t.dependency === recordId);
            tasks.forEach(task => get().setTaskStatus(task.id, TASK_STATUSES.COMPLETED));
        },
        setTaskStatus: async (taskId, status) => {
            await get().updateTask(taskId, { status });

            // If task is now completed, check for dependent tasks
            if (status === TASK_STATUSES.COMPLETED) {
                const dependentsQuery = query(getRef(),
                    where("dependency", "==", taskId),
                );
                const dependentsSnap = await getDocs(dependentsQuery);
                const dependents = dependentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                for (const dependent of dependents) {
                    await get().updateTask(dependent.id, { status: TASK_STATUSES.ACTIVE });
                }
                dependents.forEach(dependent => dependent.status = TASK_STATUSES.ACTIVE);
                set((state) => ({
                    tasks: [...state.tasks.filter(task => task.id !== dependent.id), ...dependents]
                }));
            }
        },
    }
});

export const tasksActions = Object.fromEntries(
    Object.entries(useTasks.getState()).filter(([key, value]) => typeof value === 'function')
);



useUser.subscribe(state => state.user,
    (user) => { if (!user) tasksActions.clear(); }
);
