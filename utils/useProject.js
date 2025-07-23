import { create } from "zustand";
import { useUser } from "./useUser";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useGantt } from "./useGantt";

export const useProject = create((set, get) => ({
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
            get().checkTerm(useGantt.getState().currTerm?.id);
        } else {
            set({ project: null });
        }
    },
    checkTerm: async (termId) => {
        if (!termId) return;
        if (!get().project) return;
        if (!get().project.terms.includes(termId)) {
            set(state => ({ project: { ...state.project, idOld: true } }));
        }
    },
    continueProject: async () => {
        const project = get().project;
        const userId = useUser.getState().user.id;
        if (!userId || !project) return;
        const projectRef = doc(db, 'users', userId, 'projects', project.id);
        const termId = useGantt.getState().currTerm.id;
        await updateDoc(projectRef, { terms: arrayUnion(termId) });
        delete project.idOld;
        set({ project: { ...project, terms: [...project.terms, termId] } });
    },

    createProject: async () => {
        const userId = useUser.getState().user.id;
        if (!userId) return;

        const projectRef = collection(db, 'users', userId, 'projects');
        const termId = useGantt.getState().currTerm.id;
        const newProjectRef = await addDoc(projectRef, { terms: [termId] });
        set({ project: { id: newProjectRef.id, terms: [termId] } });
        useUser.getState().updateUserDoc({ projectId: newProjectRef.id });
    },
    updateProject: async (updates) => {
        const userId = useUser.getState().user.id;
        if (!userId || !get().project) return;
        const projectRef = doc(db, 'users', userId, 'projects', get().project.id);
        await updateDoc(projectRef, updates);
        set(state => ({
            project: { ...state.project, ...updates }
        }));
    },
}));


export const projectActions = {
    setProject: useProject.getState().setProject,
    loadProject: useProject.getState().loadProject,
    checkTerm: useProject.getState().checkTerm,
    continueProject: useProject.getState().continueProject,
    createProject: useProject.getState().createProject,
    updateProject: useProject.getState().updateProject
};



const onUserUpdate = (user) => useProject.getState().loadProject(user.projectId);
onUserUpdate(useUser.getState().user);
useUser.subscribe(state => state.user.projectId, onUserUpdate);

const onGanttTerm = (term) => useProject.getState().checkTerm(term?.id);
onGanttTerm(useGantt.getState().currTerm);
useGantt.subscribe(state => state.currTerm, onGanttTerm);