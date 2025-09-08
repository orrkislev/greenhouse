import { projectActions, useProjectData } from "@/utils/store/useProject";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, limit, query, updateDoc, where, arrayUnion, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { useTime } from "@/utils/store/useTime";
import { logsActions } from "@/utils/store/useLogs";
import { LOG_TYPES } from "@/utils/constants/constants";
import { useUser } from "@/utils/store/useUser";
import { db } from "@/utils//firebase/firebase";
import { createDataLoadingHook, createStore } from "./utils/createStore";

export const [useProjectTasksData, projectTasksActions] = createStore((set, get, withUser, withLoadingCheck) => {
    const getCollectionRef = () => {
        const userId = useUser.getState().user?.id;
        const projectId = useProjectData.getState().project?.id;
        if (!userId || !projectId) return null
        return collection(db, 'users', userId, 'projects', projectId, 'tasks')
    }

    return {
        tasks: [],
        view: 'list',
        loaded: false,

        loadAllTasks: withLoadingCheck(async (user) => {
            set({tasks: []})
            if (get().loaded === 'all') return;
            const collectionRef = getCollectionRef();
            if (!collectionRef) return
            const querySnapshot = await getDocs(collectionRef);
            const tasksDocs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            const tasks = useProjectData.getState().project?.tasks?.map(taskId => tasksDocs.find(task => task.id === taskId)).filter(e => e) || [];
            tasks.push(...tasksDocs.filter(task => !tasks.find(t => t.id === task.id)));
            set({ tasks, view: useProjectData.getState().project?.taskStyle || 'list', loaded: 'all' });
        }),
        loadNextTasks: withLoadingCheck(async (user) => {
            set({tasks: []})
            if (get().loaded === 'next') return;

            const collectionRef = getCollectionRef();
            if (!collectionRef) return

            const view = useProjectData.getState().project?.taskStyle || 'list';
            let docs
            if (view === 'list') {
                const snapshot = await getDocs(query(collectionRef, where('completed', '==', false)));
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
                    limit(2)
                ));
                const nextDocs = nextSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, mark: 'next' }));
                docs = [...overDueDocs, ...todayDocs, ...nextDocs];
            }
            const tasks = useProjectData.getState().project?.tasks?.map(taskId => docs.find(task => task.id === taskId)).filter(e => e) || [];
            tasks.push(...docs.filter(task => !tasks.find(t => t.id === task.id)));
            set({ tasks, view, loaded: 'next' });
        }),




        setTasks: withUser(async (user, tasks) => {
            projectActions.updateProject({ tasks: tasks.map(task => task.id) });
            set({ tasks });
        }),
        setView: (view) => {
            projectActions.updateProject({ taskStyle: view });
            if (view === 'list')
                set({ tasks: get().tasks.sort((a, b) => a.startDate.localeCompare(b.startDate)) });
            set({ view });
        },
        addTask: withUser(async (user, task) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const newDoc = await addDoc(collectionRef, { ...task, completed: false });
            get().setTasks([...get().tasks, { ...task, id: newDoc.id }]);
        }),
        updateTask: withUser(async (user, taskId, updatedFields) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const taskRef = doc(collectionRef, taskId);
            await updateDoc(taskRef, updatedFields);
            get().setTasks(get().tasks.map(task =>
                task.id === taskId ? { ...task, ...updatedFields } : task
            ));
        }),
        deleteTask: withUser(async (user, taskId) => {
            const collectionRef = getCollectionRef();
            if (!collectionRef) return;
            const taskRef = doc(collectionRef, taskId);
            await deleteDoc(taskRef);
            get().setTasks(get().tasks.filter(task => task.id !== taskId));
        }),
        changeOrder: (taskId, newSpot) => {
            const task = get().tasks.find(t => t.id === taskId);
            const newTasks = get().tasks.filter(t => t.id !== taskId);
            newTasks.splice(newSpot, 0, task);
            get().setTasks(newTasks);
        },



        completeTaskByLabel: withUser(async (user, label) => {
            const task = get().tasks.find(t => t.label === label);
            if (!task || task.completed) return;
            get().completeTask(task.id);
        }),
        completeTask: (taskId) => {
            const task = get().tasks.find(t => t.id === taskId);
            if (!task) return;
            get().updateTask(taskId, { completed: true });
            logsActions.addLog({
                type: LOG_TYPES.COMPLETE_TASK,
                text: `השלמתי את המשימה ${task.title} בפרויקט`,
                taskId: task.id,
                projectId: useProjectData.getState().project.id,
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
                projectId: useProjectData.getState().project.id,
            });
        },


        addTaskToStudentProject: withUser(async (user, task, studentId) => {
            const userDoc = await getDoc(doc(db, 'users', studentId));
            if (!userDoc.exists()) return;
            const userData = userDoc.data();
            if (!userData.projectId) return;
            const projectRef = doc(db, 'users', studentId, 'projects', userData.projectId);
            const tasksCollection = collection(projectRef, 'tasks');
            const newDoc = await addDoc(tasksCollection, task);
            await updateDoc(projectRef, {
                tasks: arrayUnion(newDoc.id)
            });
        }),
    }
});

export const useProjectTasks = createDataLoadingHook(useProjectTasksData, 'tasks', 'loadAllTasks');
export const useProjectNextTasks = createDataLoadingHook(useProjectTasksData, 'tasks', 'loadAllTasks');