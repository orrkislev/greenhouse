import { create } from "zustand";
import { userActions, useUser } from "./useUser";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useTime } from "./useTime";
import { useLogs } from "./useLogs";
import { LOG_RECORDS, LOG_TYPES } from "./constants/constants";
import { subscribeWithSelector } from "zustand/middleware";
import { debounce } from "lodash";

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
            const userId = useUser.getState().user.id;
            if (!userId) return;

            const projectRef = collection(db, 'users', userId, 'projects');
            const termId = useTime.getState().currTerm.id;
            const newProjectRef = await addDoc(projectRef, { terms: [termId] });
            set({ project: { id: newProjectRef.id, terms: [termId] } });
            userActions.updateUserDoc({ projectId: newProjectRef.id });

            useLogs.getState().addLog({
                type: LOG_TYPES.SYSTEM_NOTIFICATION,
                record: LOG_RECORDS.STARTED_PROJECT,
                text: "יצרתי פרויקט חדש",
                projectId: newProjectRef.id,
            });
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
        }
    }
}));


export const projectActions = Object.fromEntries(
    Object.entries(useProject.getState()).filter(([key, value]) => typeof value === 'function')
);



const onUserUpdate = (user) => useProject.getState().loadProject(user.projectId);
onUserUpdate(useUser.getState().user);
useUser.subscribe(state => state.user.projectId, onUserUpdate);

const onGanttTerm = (term) => useProject.getState().checkTerm(term?.id);
onGanttTerm(useTime.getState().currTerm);
useTime.subscribe(state => state.currTerm, onGanttTerm);