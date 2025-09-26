
import { useTime } from "@/utils/store/useTime";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils//firebase/firebase";
import { createDataLoadingHook, createStore } from "./utils/createStore";

export const [useNotesData, notesActions] = createStore((set, get, withUser, withLoadingCheck) => ({
    userNotes: {},
    loadUserNotesForWeek: withLoadingCheck(async (user) => {
        set({ userNotes: {} });
        const week = useTime.getState().week;
        if (!week || week.length === 0) return

        const notesCollection = doc(db, 'users', user.id, 'notes', week[0])
        const notesDoc = await getDoc(notesCollection)
        if (notesDoc.exists()) {
            set({ userNotes: notesDoc.data() })
        }
    }),
    saveUserNote: withUser(async (user, note, date) => {
        const week = useTime.getState().week;
        if (!week || week.length === 0) return

        const notesCollection = doc(db, 'users', user.id, 'notes', week[0])
        set((state) => ({ userNotes: { ...state.userNotes, [date]: note } }))
        await setDoc(notesCollection, { [date]: note }, { merge: true })
    }),
}));
export const useNotes = createDataLoadingHook(useNotesData, 'userNotes', 'loadUserNotesForWeek');