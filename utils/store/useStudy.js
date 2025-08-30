import { userActions } from "./useUser";
import { collection, updateDoc, deleteDoc, addDoc, getDoc, doc } from "firebase/firestore";
import { db, generateImage, storage } from '@/utils/firebase/firebase'
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { examplePaths, newPathData } from "@/app/(app)/learn/components/example study paths";
import { useEffect } from "react";
import { createDataLoadingHook, createStore } from "./utils/createStore";

export const [useStudy, studyActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    paths: [],
    sideContext: [],

    loadPaths: withLoadingCheck(async (user) => {
        if (!user.study) return;

        const paths = []
        for (const studyId of user.study) {
            const studyDoc = await getDoc(doc(db, 'users', user.id, 'study', studyId))
            if (studyDoc.exists()) {
                paths.push({ ...studyDoc.data(), id: studyDoc.id });
            }
        }
        set({ paths })
    }),

    addNewPath: () => {
        // const selectedPath = examplePaths[Math.floor(Math.random() * examplePaths.length)]
        get().addPath(newPathData())
    },

    addPath: withUser(async (user, path) => {
        const study = collection(db, 'users', user.id, 'study')
        const docRef = await addDoc(study, path)
        path.id = docRef.id
        userActions.updateUserDoc({ study: user.study ? [...user.study, path.id] : [path.id] })
        set(state => ({ paths: [...state.paths, path] }))
    }),
    deletePath: withUser(async (user, pathId) => {
        const pathRef = doc(db, 'users', user.id, 'study', pathId)
        await deleteDoc(pathRef)
        userActions.updateUserDoc({ study: user.study ? user.study.filter(id => id !== pathId) : [] })
        set(state => ({ paths: state.paths.filter(path => path.id !== pathId) }))
    }),
    updatePath: withUser(async (user, pathId, pathData) => {
        await updateDoc(doc(db, 'users', user.id, 'study', pathId), pathData)
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, ...pathData } : path) }))
    }),

    addSubject: async (pathId, subject) => {
        const path = get().paths.find(path => path.id === pathId)
        path.subjects.push(subject)
        get().updatePath(pathId, path)
    },
    updateSubject: async (pathId, subjectId, subjectData) => {
        const path = get().paths.find(path => path.id === pathId)
        const subject = path.subjects.find(subject => subject.id === subjectId)
        Object.assign(subject, subjectData)
        get().updatePath(pathId, path)
    },
    deleteSubject: async (pathId, subjectId) => {
        const path = get().paths.find(path => path.id === pathId)
        path.subjects = path.subjects.filter(subject => subject.id !== subjectId)
        get().updatePath(pathId, path)
    },
    addStep: async (pathId, subjectId, step) => {
        const path = get().paths.find(path => path.id === pathId)
        const subject = path.subjects.find(subject => subject.id === subjectId)
        subject.steps.push(step)
        get().updatePath(pathId, path)
    },
    updateStep: async (pathId, subjectId, stepId, stepData) => {
        const path = get().paths.find(path => path.id === pathId)
        const subject = path.subjects.find(subject => subject.id === subjectId)
        const step = subject.steps.find(step => step.id === stepId)
        Object.assign(step, stepData)
        get().updatePath(pathId, path)
    },
    deleteStep: async (pathId, subjectId, stepId) => {
        const path = get().paths.find(path => path.id === pathId)
        const subject = path.subjects.find(subject => subject.id === subjectId)
        subject.steps = subject.steps.filter(step => step.id !== stepId)
        get().updatePath(pathId, path)
    },

    // ------------------------------
    addSource: async (pathId, source) => {
        const path = get().paths.find(path => path.id === pathId)
        if (!path.sources) path.sources = []
        path.sources.push({ text: source, id: crypto.randomUUID() })
        get().updatePath(pathId, path)
    },
    updateSource: async (pathId, sourceId, sourceData) => {
        const path = get().paths.find(path => path.id === pathId)
        const source = path.sources.find(source => source.id === sourceId)
        if (!source) return;
        Object.assign(source, sourceData)
        get().updatePath(pathId, path)
    },
    deleteSource: async (pathId, sourceId) => {
        const path = get().paths.find(path => path.id === pathId)
        if (!path.sources) return;
        path.sources = path.sources.filter(source => source.id !== sourceId)
        get().updatePath(pathId, path)
    },


    // ------------------------------
    createImage: withUser(async (user, path, name) => {

        await get().updatePath(path.id, { image: null })

        const imageData = await generateImage(name);
        if (!imageData) return;

        const byteCharacters = atob(imageData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        const storageRef = ref(storage, `studyPaths/${user.id}/${path.id}`);
        await uploadBytes(storageRef, blob, { contentType: 'image/png' })
        const url = await getDownloadURL(storageRef);
        await get().updatePath(path.id, { image: url });
    }),


    // ------------------------------
    loadSideContext: async () => {
        const docRef = doc(db, 'school', 'study')
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return;
        set({ sideContext: docSnap.data().sideContext });
    },
    saveSideContext: async (sideContext) => {
        const docRef = doc(db, 'school', 'study')
        await updateDoc(docRef, { sideContext });
        set({ sideContext });
    }
}));
export const useStudyPaths = createDataLoadingHook(useStudy, 'paths', 'loadPaths');


export function useStudySideContext() {
    const sideContext = useStudy(state => state.sideContext);
    useEffect(() => {
        studyActions.loadSideContext();
    }, []);
    return sideContext
}
