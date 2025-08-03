import { create } from "zustand";
import { useUser } from "@/utils/store/useUser";
import { useTime } from "@/utils/store/useTime";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils//firebase/firebase";

export const useNotes = create((set, get) => ({
    userNotes: {},
    loadUserNotesForWeek: async () => {
        const user = useUser.getState().user;
        if (!user) return

        const week = useTime.getState().week;
        if (!week || week.length === 0) return

        const notesCollection = doc(db, 'users', user.id, 'notes', week[0])
        const notesDoc = await getDoc(notesCollection)
        if (notesDoc.exists()) {
            set({ userNotes: notesDoc.data() })
        }
    },
    saveUserNote: async (note, date) => {
        const user = useUser.getState().user;
        if (!user) return

        const week = useTime.getState().week;
        if (!week || week.length === 0) return

        const notesCollection = doc(db, 'users', user.id, 'notes', week[0])
        await setDoc(notesCollection, { [date]: note }, { merge: true })
        set((state) => ({ userNotes: { ...state.userNotes, [date]: note } }))
    },
}));

export const notesActions = Object.fromEntries(
    Object.entries(useNotes.getState()).filter(([key, value]) => typeof value === 'function')
)