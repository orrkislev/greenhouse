import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand";

export const useMeetings = create((set, get) => {
    const userId = () => useUser.getState().user.id;

    return {
        meetings: [],
        loaded: false,

        loadMeetings: async () => {
            if (get().loaded) return;
            const uid = userId();
            if (!uid) return;
            const meetingsRef = collection(db, `meetings`);
            const meetingsQuery = query(meetingsRef, where("participants", "array-contains", uid));
            onSnapshot(meetingsQuery, snapshot => {
                const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Meetings snapshot:", meetings);
                meetings.forEach(meeting => {
                    meeting.isCreator = meeting.created === uid;
                });
                set({ meetings, loaded: true });
            });
        },
    }
});

export const meetingsActions = {
    loadMeetings: () => useMeetings.getState().loadMeetings(),
    createMeeting: async (participants, day, start, end) => {
        const uid = useUser.getState().user.id;
        if (!uid) return;

        const meeting = {
            participants: [...participants, uid],
            day, start, end, created: uid,
        };
        const newMeetingDoc = await addDoc(collection(db, `meetings`), meeting);
        return newMeetingDoc;
    },
    updateMeeting: async (meetingId, updates) => {
        const meetingRef = doc(db, `meetings`, meetingId);
        await updateDoc(meetingRef, updates);
    },
    deleteMeeting: async (meetingId) => {
        const meetingRef = doc(db, `meetings`, meetingId);
        await deleteDoc(meetingRef);
    }
}