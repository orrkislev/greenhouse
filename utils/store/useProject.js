import { create } from "zustand";
import { userActions, useUser } from "@/utils/store/useUser";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils//firebase/firebase";
import { useTime } from "@/utils/store/useTime";
import { logsActions, useLogs } from "@/utils/store/useLogs";
import { LOG_RECORDS, LOG_TYPES } from "@/utils/constants/constants";
import { subscribeWithSelector } from "zustand/middleware";
import { debounce } from "lodash";
import { projectTasksActions } from "@/utils/store/useProjectTasks";
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
        loadProject: async () => {
            const user = useUser.getState().user;
            if (!user || !user.projectId) return;
            if (get().project && get().project.id === user.projectId) return;

            set({ project: null });

            const projectRef = doc(db, 'users', user.id, 'projects', user.projectId);
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
                title: 'למלא הצהרת כוונות',
                label: 'הצהרת כוונות',
                description: 'זה חשוב',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd')
            })
        },
        updateProject: async (updates, withDebounce = true) => {
            const project = get().project;
            const user = useUser.getState().user;
            if (!project || !user.id) return;
            set({ project: { ...project, ...updates } });
            if (withDebounce) debouncedUpdateProject();
            else updateDoc(doc(db, 'users', user.id, 'projects', project.id), updates);
        },

        closeProject: async () => {
            const project = get().project;
            if (!project) return;
            await get().updateProject({ status: "closed" }, false);
            logsActions.addLog({
                type: LOG_TYPES.SYSTEM_NOTIFICATION,
                record: LOG_RECORDS.CLOSED_PROJECT,
                text: "סגרתי את הפרויקט",
                projectId: get().project.id,
            });

            await userActions.updateUserDoc({ projectId: null });
            set({ project: null });
        },


        // ------ Project Goals ------
        goals: {},
        loadGoals: async () => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const goalsRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'goals');
            const goalsSnapshot = await getDoc(goalsRef);
            if (goalsSnapshot.exists()) {
                set({ goals: goalsSnapshot.data() });
            }
        },
        saveGoal: async (goalName, content) => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const goalsRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'goals');
            await setDoc(goalsRef, { [goalName]: content }, { merge: true });
            set(state => ({ goals: { ...state.goals, [goalName]: content } }));
        },

        // ------ Other Projects ------
        otherProjects: [],
        loadOtherProjects: async () => {
            const user = useUser.getState().user;
            if (!user.id) return
            const otherProjectsRef = collection(db, 'users', user.id, 'projects');
            const otherProjectsSnapshot = await getDocs(otherProjectsRef);
            let otherProjects = otherProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            otherProjects = otherProjects.filter(project => project.id !== user.projectId);
            set({ otherProjects });
        },

        // ------ Project Library ------
        library: [],
        loadProjectLibrary: async () => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const projectLibrarySnapshot = await getDoc(projectLibraryRef);
            if (projectLibrarySnapshot.exists()) {
                set({ library: projectLibrarySnapshot.data().items || [] });
            }
        },
        addLibraryItem: async (item) => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            await setDoc(projectLibraryRef, { items: arrayUnion(item) }, { merge: true });
            set(state => ({ library: [...state.library, item] }));
        },
        updateLibraryItem: async (itemIndex, text) => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const newItems = get().library
            newItems[itemIndex] = text;
            await setDoc(projectLibraryRef, { items: newItems }, { merge: true });
            set({ library: newItems });
        },
        deleteLibraryItem: async (itemIndex) => {
            const user = useUser.getState().user;
            const project = get().project;
            if (!user.id || !project) return
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const newItems = get().library;
            newItems.splice(itemIndex, 1);
            await setDoc(projectLibraryRef, { items: newItems }, { merge: true });
            set({ library: [...newItems] });
        }
    }
}));


export const projectActions = Object.fromEntries(
    Object.entries(useProject.getState()).filter(([key, value]) => typeof value === 'function')
);