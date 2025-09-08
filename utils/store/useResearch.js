import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { userActions } from "./useUser";
import { createDataLoadingHook, createStore } from "./utils/createStore";
import { db } from "../firebase/firebase";
import { createGoogleDoc } from "../actions/google actions";
import { useTime } from "./useTime";

export const [useResearchData, researchActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    research: null,
    allResearch: [],

    setResearch: (research) => set({ research }),

    loadResearch: withLoadingCheck(async (user) => {
        set({ research: null, allResearch: [] });
        const currentResearchId = user.researchId;
        if (!currentResearchId) return;
        get().loadResearchById(currentResearchId)
    }),

    loadResearchById: withUser(async (user, researchId) => {
        const allResearch = get().allResearch;
        const hasResearch = allResearch.find(research => research.id === researchId);
        if (hasResearch) {
            set({ research: hasResearch });
            return;
        }

        const docRef = doc(db, "users", user.id, "research", researchId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const research = { ...docSnap.data(), id: docSnap.id };
        set({ research });
    }),

    newResearch: withUser(async (user) => {
        const ref = collection(db, "users", user.id, "research");
        const newDocData = {
            title: 'חקר חדש',
        }
        const newDoc = await addDoc(ref, newDocData);
        userActions.updateUserDoc({
            researchId: newDoc.id
        })
        const newResearchData = { ...newDocData, id: newDoc.id }
        set({ research: newResearchData, allResearch: [...get().allResearch, newResearchData] });
    }),

    updateResearch: withUser(async (user, updates) => {
        if (!get().research) return;
        const docRef = doc(db, "users", user.id, "research", user.researchId);
        await updateDoc(docRef, updates);
        set({ research: { ...get().research, ...updates } });
    }),

    deleteResearch: withUser(async (user, researchId) => {
        console.log('deleteResearch', user.id, researchId)
        const docRef = doc(db, "users", user.id, "research", researchId);
        await deleteDoc(docRef);
        if (user.researchId === researchId) {
            userActions.updateUserDoc({ researchId: null })
        }
        set({ research: null, allResearch: get().allResearch.filter(research => research.id !== researchId) });
    }),






    createGoogleDoc: withUser(async (user) => {
        if (!get().research) return;
        const currTerm = useTime.getState().currTerm;
        const research = get().research;
        if (!research || research.docUrl) return;
        const docUrl = await createGoogleDoc({
            refreshToken: user.googleRefreshToken,
            name: 'חקר ' + research.title,
            title: research.title,
            subtitle: 'עבודת חקר של ' + user.firstName + ' ' + user.lastName + ', תקופת ' + currTerm.name
        });
        get().updateResearch({ docUrl });
    }),

    loadAllResearch: withUser(async (user) => {
        const ref = collection(db, "users", user.id, "research");
        const docs = await getDocs(ref);
        set({ allResearch: docs.docs.map(doc => ({ ...doc.data(), id: doc.id })) });
    }),

    addSection: withUser(async (user, sectionType) => {
        if (!get().research) return;
        const docRef = doc(db, "users", user.id, "research", user.researchId);
        const sections = get().research.sections || [];
        const newSections = [...sections, { type: sectionType, content: {}, order: sections.length, id: crypto.randomUUID() }];
        await updateDoc(docRef, { sections: newSections });
        set({ research: { ...get().research, sections: newSections } });
    }),
    updateSection: withUser(async (user, sectionId, contentUpdates) => {
        if (!get().research) return;
        const docRef = doc(db, "users", user.id, "research", user.researchId);
        const sections = get().research.sections;
        const sectionIndex = sections.findIndex(section => section.id === sectionId);
        const newSections = [...sections];
        newSections[sectionIndex].content = { ...sections[sectionIndex].content, ...contentUpdates };
        await updateDoc(docRef, { sections: newSections });
        set({ research: { ...get().research, sections: newSections } });
    }),
    removeSection: withUser(async (user, sectionId) => {
        if (!get().research) return;
        const docRef = doc(db, "users", user.id, "research", user.researchId);
        const sections = get().research.sections;
        const newSections = sections.filter(section => section.id !== sectionId);
        newSections.sort((a, b) => a.order - b.order).forEach((section, index) => section.order = index);
        await updateDoc(docRef, { sections: newSections });
        set({ research: { ...get().research, sections: newSections } });
    }),
}));

export const useResearch = createDataLoadingHook(useResearchData, 'research', 'loadResearch');
export const useAllResearch = createDataLoadingHook(useResearchData, 'allResearch', 'loadAllResearch');