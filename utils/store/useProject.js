import { userActions, useUser } from "@/utils/store/useUser";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db, folkArtStyle, generateImage, storage } from "@/utils//firebase/firebase";
import { useTime } from "@/utils/store/useTime";
import { logsActions, useLogs } from "@/utils/store/useLogs";
import { LOG_RECORDS, LOG_TYPES } from "@/utils/constants/constants";
import { debounce } from "lodash";
import { projectTasksActions } from "@/utils/store/useProjectTasks";
import { format } from "date-fns";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createDataLoadingHook, createStore } from "./utils/createStore";


export const [useProjectData, projectActions] = createStore((set, get, withUser, withLoadingCheck) => {
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
        loadProject: withLoadingCheck(async (user) => {
            set({ project: null });
            if (!user.projectId) return;

            const projectRef = doc(db, 'users', user.id, 'projects', user.projectId);
            const projectSnapshot = await getDoc(projectRef);
            if (projectSnapshot.exists()) {
                const projectData = projectSnapshot.data();
                set({ project: { id: projectSnapshot.id, ...projectData } });
                get().checkTerm(useTime.getState().currTerm?.id);
            } else {
                set({ project: null });
            }
        }),
        checkTerm: async (termId) => {
            if (!termId) return;
            if (!get().project) return;
            if (!get().project.terms.includes(termId)) {
                set(state => ({ project: { ...state.project, isOld: true } }));
            }
        },
        continueProject: withUser(async (user) => {
            const project = get().project;
            if (!project) return;
            const projectRef = doc(db, 'users', user.id, 'projects', project.id);
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
        }),

        // ------------------------------
        // ------ CRUD Project -------
        // ------------------------------
        createProject: withUser(async (user) => {
            get().closeProject();

            const projectRef = collection(db, 'users', user.id, 'projects');
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

            setTimeout(() => {
                projectTasksActions.addTask({
                    title: 'למלא הצהרת כוונות',
                    label: 'הצהרת כוונות',
                    description: 'זה חשוב',
                    startDate: format(new Date(), 'yyyy-MM-dd'),
                    endDate: format(new Date(), 'yyyy-MM-dd')
                })
            }, 500)
        }),
        updateProject: withUser(async (user, updates, withDebounce = true) => {
            const project = get().project;
            if (!project) return;
            set({ project: { ...project, ...updates } });
            if (withDebounce) debouncedUpdateProject();
            else updateDoc(doc(db, 'users', user.id, 'projects', project.id), updates);
        }),

        closeProject: withUser(async (user) => {
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
        }),


        // ------------------------------
        // ------ Project Goals ---------
        // ------------------------------
        goals: {},
        loadGoals: withUser(async (user) => {
            const project = get().project;
            if (!project) return;
            const goalsRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'goals');
            const goalsSnapshot = await getDoc(goalsRef);
            if (goalsSnapshot.exists()) {
                set({ goals: goalsSnapshot.data() });
            }
        }),
        saveGoal: withUser(async (user, goalName, content) => {
            const project = get().project;
            if (!project) return;
            const goalsRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'goals');
            set(state => ({ goals: { ...state.goals, [goalName]: content } }));
            await setDoc(goalsRef, { [goalName]: content }, { merge: true });
        }),

        // ------------------------------
        // ------ Other Projects -------
        // ------------------------------
        otherProjects: [],
        loadOtherProjects: withUser(async (user) => {
            const otherProjectsRef = collection(db, 'users', user.id, 'projects');
            const otherProjectsSnapshot = await getDocs(otherProjectsRef);
            let otherProjects = otherProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            otherProjects = otherProjects.filter(project => project.id !== user.projectId);
            set({ otherProjects });
        }),

        // ------------------------------
        // ------ Project Library -------
        // ------------------------------
        library: [],
        loadProjectLibrary: withUser(async (user) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const projectLibrarySnapshot = await getDoc(projectLibraryRef);
            if (projectLibrarySnapshot.exists()) {
                set({ library: projectLibrarySnapshot.data().items || [] });
            }
        }),
        addLibraryItem: withUser(async (user, item) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            set(state => ({ library: [...state.library, item] }));
            await setDoc(projectLibraryRef, { items: arrayUnion(item) }, { merge: true });
        }),
        updateLibraryItem: withUser(async (user, itemIndex, text) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const newItems = get().library
            newItems[itemIndex] = text;
            set({ library: newItems });
            await setDoc(projectLibraryRef, { items: newItems }, { merge: true });
        }),
        deleteLibraryItem: withUser(async (user, itemIndex) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'library');
            const newItems = get().library;

            const item = newItems[itemIndex];
            if (item.url) {
                const storageRef = ref(storage, item.path);
                await deleteObject(storageRef);
            }

            newItems.splice(itemIndex, 1);
            set({ library: [...newItems] });
            await setDoc(projectLibraryRef, { items: newItems }, { merge: true });
        }),
        uploadLibraryItem: withUser(async (user, file) => {
            const project = get().project;
            if (!project) return;
            const storageRef = ref(storage, `projects/${user.id}/${project.id}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await get().addLibraryItem({ url, name: file.name, path: storageRef.fullPath });
        }),


        // -------------------------------------
        // ------ Project Library TLDraw -------
        // -------------------------------------
        tldraw: null,
        loadTldraw: withUser(async (user) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'tldraw');
            const projectLibrarySnapshot = await getDoc(projectLibraryRef);
            if (projectLibrarySnapshot.exists()) {
                const data = projectLibrarySnapshot.data();
                set({ tldraw: data || null });
            }
        }),
        saveTldraw: withUser(async (user, tldraw) => {
            const project = get().project;
            if (!project) return;
            const projectLibraryRef = doc(db, 'users', user.id, 'projects', project.id, 'documents', 'tldraw');
            set({ tldraw });
            await setDoc(projectLibraryRef, tldraw);
        }),

        // ------------------------------
        // ------ Project Image -------
        // ------------------------------
        createImage: withUser(async (user, name) => {
            const project = get().project;
            if (!project) return;

            // if (project.image === 'generating') return;
            await get().updateProject({ image: 'generating' })

            const imageData = await generateImage(name, folkArtStyle);
            if (!imageData) {
                await get().updateProject({ image: 'no image' })
                return;
            }

            const byteCharacters = atob(imageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });

            const storageRef = ref(storage, `projects/${user.id}/${project.id}/image`);
            await uploadBytes(storageRef, blob, { contentType: 'image/png' })
            const url = await getDownloadURL(storageRef);
            await get().updateProject({ image: url });
        }),
    }
});
export const useProject = createDataLoadingHook(useProjectData, 'project', 'loadProject');