import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand";

export const useMeetings = create((set, get) => {
    const userId = () => useUser.getState().user.id;

    return {
        meetings: [],
        loaded: false,

        loadTodayMeetings: async () => {
            const uid = userId();
            if (!uid) return;
            const dayOfTheWeek = new Date().getDay();
            const meetingsRef = collection(db, `meetings`);
            const meetingsQuery = query(meetingsRef, where("day", "==", dayOfTheWeek), where("participants", "array-contains", uid));
            const meetingsSnap = await getDocs(meetingsQuery);
            const meetings = meetingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            meetings.forEach(meeting => {
                meeting.isCreator = meeting.created === uid;
            });
            set({ meetings });
        },
        loadMeetings: async () => {
            if (get().loaded) return;
            const uid = userId();
            if (!uid) return;
            const meetingsRef = collection(db, `meetings`);
            const meetingsQuery = query(meetingsRef, where("participants", "array-contains", uid));
            onSnapshot(meetingsQuery, snapshot => {
                const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                meetings.forEach(meeting => {
                    meeting.isCreator = meeting.created === uid;
                });
                set({ meetings, loaded: true });
            });
        },

        createMeeting: async (participants, day, start, end) => {
            const uid = userId();
            if (!uid) return;

            const meeting = {
                participants: [...participants, uid],
                day, start, end, created: uid,
            };
            const newMeetingDoc = await addDoc(collection(db, `meetings`), meeting);
            set(state => ({
                meetings: [...state.meetings, { id: newMeetingDoc.id, ...meeting }],
            }));
        },
    }
});


export const meetingsActions = Object.fromEntries(
    Object.entries(useMeetings.getState()).filter(([key, value]) => typeof value === 'function')
);
meetingsActions.updateMeeting = async (meetingId, updates) => {
    const meetingRef = doc(db, `meetings`, meetingId);
    await updateDoc(meetingRef, updates);
};
meetingsActions.deleteMeeting = async (meetingId) => {
    const meetingRef = doc(db, `meetings`, meetingId);
    await deleteDoc(meetingRef);
};