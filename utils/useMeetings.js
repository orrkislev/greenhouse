import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { collection, getDocs, query, where } from "firebase/firestore";
import { create } from "zustand";

export const useMeetings = create((set, get) => {
    const userId = () => useUser.getState().user.id;

    return {
        meetings: [],

        loadMeetings: async () => {
            const uid = userId();
            if (!uid) return;
            const meetingsRef = collection(db, `meetings`);
            const meetingsQuery = query(meetingsRef, where("participants", "array-contains", uid));
            const meetingsSnap = await getDocs(meetingsQuery);
            const meetings = meetingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            meetings.forEach(meeting => {
                meeting.isCreator = meeting.created === uid;
            });
            set({ meetings });
        },
    }
});

export function createMeeting(participants, day, start, end){
    const uid = useUser.getState().user.id;
    if (!uid) return;

    const meeting = {
        participants: [...participants, uid],
        day, start, end, created: uid,
    };

    return addDoc(collection(db, `meetings`), meeting);
}