import { create } from "zustand";
import { projectActions, useProject } from "./useProject";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, limit, query, updateDoc, where } from "firebase/firestore";
import { format } from "date-fns";
import { useTime } from "./useTime";
import { logsActions } from "./useLogs";
import { LOG_TYPES } from "./constants/constants";

export const useProjectTasks = create((set, get) => {
    const getCollectionRef = () => {
        const projectRef = useProject.getState().getProjectRef();
        if (!projectRef) return null;
        return collection(projectRef, 'tasks');
    }

    return {
        tasks: [],
        view: 'list',


        loadAllTasks: async () => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return
            const querySnapshot = await getDocs(collectionRef);
            const tasksDocs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            const tasks = useProject.getState().project?.tasks?.map(taskId => tasksDocs.find(task => task.id === taskId)).filter(e => e) || [];
            tasks.push(...tasksDocs.filter(task => !tasks.find(t => t.id === task.id)));
            set({ tasks, view: useProject.getState().project?.taskStyle || 'list' });
        },
        loadNextTasks: async () => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return
            const view = useProject.getState().project?.taskStyle || 'list';
            let docs
            if (view === 'list') {
                const snapshot = await getDocs(query(collectionRef, where('completed', '==', false) ));
                docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } else if (view === 'weekly') {
                const week = useTime.getState().week;
                const overdueSnapshot = await getDocs(query(collectionRef,
                    where('completed', '==', false),
                    where('startDate', '<', week[0]),
                ));
                const overdueDocs = overdueSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'overdue' }));
                const weekSnapshot = await getDocs(query(collectionRef,
                    where('completed', '==', false),
                    where('startDate', '>=', week[0]),
                    where('startDate', '<=', week[5]),
                ));
                const weekDocs = weekSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'week' }));
                docs = [...overdueDocs, ...weekDocs];
            } else if (view === 'calendar') {
                const today = format(new Date(), 'yyyy-MM-dd');
                const overdue = await getDocs(query(collectionRef,
                    where('completed', '==', false),
                    where('startDate', '<', today),
                ));
                const overDueDocs = overdue.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'overdue' }));
                const todaySnapshot = await getDocs(query(collectionRef,
                    where('completed', '==', false),
                    where('startDate', '==', today),
                ));
                const todayDocs = todaySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'today' }));
                const nextSnapshot = await getDocs(query(collectionRef,
                    where('completed', '==', false),
                    where('startDate', '>', today),
                    orderBy('startDate', 'asc'),
                    limit(1)
                ));
                const nextDocs = nextSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'next' }));
                docs = [...overDueDocs, ...todayDocs, ...nextDocs];
            }
            const tasks = useProject.getState().project?.tasks?.map(taskId => docs.find(task => task.id === taskId)).filter(e => e) || [];
            tasks.push(...docs.filter(task => !tasks.find(t => t.id === task.id)));
            set({ tasks, view });
        },




        setTasks: async (tasks) => {
            projectActions.updateProject({ tasks: tasks.map(task => task.id) });
            set({ tasks });
        },
        setView: (view) => {
            projectActions.updateProject({ taskStyle: view });
            if (view === 'list')
                set({ tasks: get().tasks.sort((a, b) => a.startDate.localeCompare(b.startDate)) });
            set({ view });
        },
        addTask: async (task) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const newDoc = await addDoc(collectionRef, task)
            get().setTasks([...get().tasks, { ...task, id: newDoc.id }]);
        },
        updateTask: async (taskId, updatedFields) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const taskRef = doc(collectionRef, taskId);
            await updateDoc(taskRef, updatedFields);
            get().setTasks(get().tasks.map(task =>
                task.id === taskId ? { ...task, ...updatedFields } : task
            ));
        },
        deleteTask: async (taskId) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const taskRef = doc(collectionRef, taskId);
            await deleteDoc(taskRef);
            get().setTasks(get().tasks.filter(task => task.id !== taskId));
        },
        changeOrder: (taskId, newSpot) => {
            const task = get().tasks.find(t => t.id === taskId);
            const newTasks = get().tasks.filter(t => t.id !== taskId);
            newTasks.splice(newSpot, 0, task);
            get().setTasks(newTasks);
        },



        completeTask: (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;
            get().updateTask(taskId, { completed: true });
            logsActions.addLog({
                type: LOG_TYPES.COMPLETE_TASK,
                text: `השלמתי את המשימה ${task.title} בפרויקט`,
                taskId: task.id,
                projectId: useProject.getState().project.id,
            });
        },
        cancelTask: (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;
            get().updateTask(taskId, { completed: false });
            logsActions.addLog({
                type: LOG_TYPES.CANCEL_TASK,
                text: `ביטלתי את המשימה ${task.title} בפרויקט`,
                taskId: task.id,
                projectId: useProject.getState().project.id,
            });
        }
    }
});

export const projectTasksActions = Object.fromEntries(
    Object.entries(useProjectTasks.getState()).filter(([key, value]) => typeof value === 'function')
);