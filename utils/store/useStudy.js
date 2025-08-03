import { create } from "zustand";
import { userActions, useUser } from "./useUser";
import { collection, updateDoc, deleteDoc, addDoc, getDocs, doc } from "firebase/firestore";
import { db } from '@/utils/firebase/firebase'

export const useStudy = create((set, get) => ({
    paths: [],

    loadPaths: async () => {
        const user = useUser.getState().user;
        if (!user) return;
        const study = collection(db, 'users', user.id, 'study')
        const querySnapshot = await getDocs(study)
        const paths = querySnapshot.docs.map(doc => doc.data())
        set({ paths })
    },

    addPath: async (path) => {
        const user = useUser.getState().user;
        if (!user.id) return;
        const study = collection(db, 'users', user.id, 'study')
        const docRef = await addDoc(study, path)
        path.id = docRef.id
        userActions.updateUserDoc({ study: user.study ? [...user.study, path.id] : [path.id] })
        set(state => ({ paths: [...state.paths, path] }))
    },
    deletePath: async (pathId) => {
        const user = useUser.getState().user;
        if (!user.id) return;
        userActions.updateUserDoc({ study: user.study.filter(id => id !== pathId) })
        set(state => ({ paths: state.paths.filter(path => path.id !== pathId) }))
    },
    updatePath: async (pathId, pathData) => {
        const user = useUser.getState().user;
        if (!user.id) return;
        await updateDoc(doc(db, 'users', user.id, 'study', pathId), pathData)
        set(state => ({ paths: state.paths.map(path => path.id === pathId ? { ...path, ...pathData } : path) }))
    },

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
}));


export const studyActions = Object.fromEntries(
    Object.entries(useStudy.getState()).filter(([key, value]) => typeof value === 'function')
);