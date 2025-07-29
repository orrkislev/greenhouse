import { create } from "zustand";
import { userActions, useUser } from "./useUser";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useTime } from "./useTime";
import { logsActions, useLogs } from "./useLogs";
import { LOG_RECORDS, LOG_TYPES } from "./constants/constants";
import { subscribeWithSelector } from "zustand/middleware";
import { debounce } from "lodash";
import { projectTasksActions } from "./useProjectTasks";
import { format } from "date-fns";


export const useProject = create(subscribeWithSelector((set, get) => {
    const debouncedUpdateProject = debounce(async () => {
        const { project } = get();
        const userId = useUser.getState().user.id;
        if (!userId || !get().project) return;
        const projectRef = doc(db, 'users', userId, 'projects', get().project.id);
        await updateDoc(projectRef, project);
    }, 1000);

    return {
        project: null,

        setProject: (project) => set({ project }),
        loadProject: async (projectId) => {
            if (!projectId) return;
            if (get().project && get().project.id === projectId) return;
            const userId = useUser.getState().user.id;
            if (!userId) return;

            set({ project: null });

            const projectRef = doc(db, 'users', userId, 'projects', projectId);
            const projectSnapshot = await getDoc(projectRef);
            if (projectSnapshot.exists()) {
                const projectData = projectSnapshot.data();
                set({ project: { id: projectSnapshot.id, ...projectData } });
                get().checkTerm(useTime.getState().currTerm?.id);
            } else {
                set({ project: null });
            }
        },
        checkTerm: async (termId) => {
            if (!termId) return;
            if (!get().project) return;
            if (!get().project.terms.includes(termId)) {
                set(state => ({ project: { ...state.project, isOld: true } }));
            }
        },
        continueProject: async () => {
            const project = get().project;
            const userId = useUser.getState().user.id;
            if (!userId || !project) return;
            const projectRef = doc(db, 'users', userId, 'projects', project.id);
            const termId = useTime.getState().currTerm.id;
            await updateDoc(projectRef, { terms: arrayUnion(termId) });
            delete project.isOld;
            set({ project: { ...project, terms: [...project.terms, termId] } });

            useLogs.getState().addLog({
                type: LOG_TYPES.SYSTEM_NOTIFICATION,
                record: LOG_RECORDS.STARTED_PROJECT,
                text: "בחרתי להמשיך את הפרויקט הנוכחי",
                projectId: project.id,
            });
        },

        createProject: async () => {
            get().closeProject();

            const userId = useUser.getState().user.id;
            if (!userId) return;

            const projectRef = collection(db, 'users', userId, 'projects');
            const termId = useTime.getState().currTerm.id;
            const newProjectRef = await addDoc(projectRef, { terms: [termId] });
            set({ project: { id: newProjectRef.id, terms: [termId], status: "active" } });

            userActions.updateUserDoc({ projectId: newProjectRef.id });

            useLogs.getState().addLog({
                type: LOG_TYPES.SYSTEM_NOTIFICATION,
                record: LOG_RECORDS.CREATED_PROJECT,
                text: "יצרתי פרויקט חדש",
                projectId: newProjectRef.id,
            });

            projectTasksActions.addTask({
                title: 'למלא הצהרת כוונת',
                description: 'זה חשוב',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd')
            })
        },
        updateProject: async (updates) => {
            set(state => ({ project: { ...state.project, ...updates } }));
            debouncedUpdateProject();
        },


        getProjectRef: () => {
            const userId = useUser.getState().user?.id;
            const projectId = get().project?.id;
            if (!userId || !projectId) return null
            return doc(db, 'users', userId, 'projects', projectId);
        },

        closeProject: async () => {
            const project = get().project;
            if (!project) return;
            await get().updateProject({ status: "closed" });
            logsActions.addLog({
                type: LOG_TYPES.SYSTEM_NOTIFICATION,
                record: LOG_RECORDS.CLOSED_PROJECT,
                text: "סגרתי את הפרויקט",
                projectId: get().project.id,
            });

            await userActions.updateUserDoc({ projectId: null });
            set({ project: null });
        }
    }
}));


export const projectActions = Object.fromEntries(
    Object.entries(useProject.getState()).filter(([key, value]) => typeof value === 'function')
);



useUser.subscribe(state => state.user?.projectId, (pid) => projectActions.loadProject(pid));
projectActions.loadProject(useUser.getState().user?.projectId);

const onGanttTerm = (term) => projectActions.checkTerm(term?.id);
onGanttTerm(useTime.getState().currTerm);
useTime.subscribe(state => state.currTerm, onGanttTerm);