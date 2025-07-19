import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { addDoc, and, collection, deleteDoc, doc, getDocs, or, query, updateDoc, where } from "firebase/firestore";
import { debounce } from "lodash";
import { create } from "zustand";

export const useEvents = create((set, get) => {
    const userId = () => useUser.getState().user.id;
    const getRef = (collectionName) => collection(db, `users/${userId()}/${collectionName}`);

    const debouncedUpdateEvents = debounce(async () => {
        const { events } = get();
        const ref = getRef("events");
        for (const event of events) {
            if (event._dirty && event.id) {
                const { id, _dirty, ...data } = event;
                await updateDoc(doc(ref, id), data);
                event._dirty = false;
            }
        }
        set({ events: [...events] });
    }, 1000);

    return {
        events: [],

        loadWeekTasks: async (week) => {
            const uid = userId()
            if (!uid || !week || week.length === 0) return;

            const tasksRef = getRef("tasks");
            const tasksQuery = query(tasksRef,
                or(
                    and(where("start", ">=", week[0]), where("start", "<=", week[week.length - 1])),
                    and(where("end", ">=", week[0]), where("end", "<=", week[week.length - 1])),
                    and(where("start", "<=", week[0]), where("end", ">=", week[week.length - 1]))
                )
            );
            const tasksSnap = await getDocs(tasksQuery);
            const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ tasks });
        },
        addTask: async (task) => {
            const newDoc = await addDoc(getRef("tasks"), task);
            task.id = newDoc.id;
            set((state) => ({
                tasks: [...state.tasks, task]
            }));
        },
        updateTask: (taskId, updatedTask) => {
            updateDoc(doc(getRef("tasks"), taskId), updatedTask);
            set((state) => {
                const updatedTasks = state.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                );
                return { tasks: updatedTasks };
            });
        },
        deleteTask: (taskId) => {
            deleteDoc(doc(getRef("tasks"), taskId));
            set((state) => ({
                tasks: state.tasks.filter(task => task.id !== taskId)
            }));
        },
        addGroupTask: task => {
            task.start = task.date
            task.end = task.date;
            set((state) => {
                const exists = state.tasks.some(t => t.id === task.id);
                if (exists) {
                    return {
                        tasks: state.tasks.map(t => t.id === task.id ? { ...t, ...task } : t)
                    };
                } else {
                    return { tasks: [...state.tasks, task] };
                }
            });
        },
        removeGroupTask: (taskId) => {
            set((state) => ({
                tasks: state.tasks.filter(task => task.id !== taskId)
            }));
        },
    }
});

