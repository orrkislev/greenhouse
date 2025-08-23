import { db } from "@/utils/firebase/firebase";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, or, query, updateDoc, where } from "firebase/firestore";
import { createDataLoadingHook, createStore } from "./utils/createStore";

export const [useMeetingsData, meetingsActions] = createStore((set, get, withUser, withLoadingCheck) => {
    return {
        meetings: [],

        loadMeetings: withLoadingCheck(async (user) => {
            const meetingsRef = collection(db, `meetings`);
            const meetingsQuery = query(meetingsRef, or(where("staff", "==", user.id), where("student", "==", user.id)));
            const meetingsSnap = await getDocs(meetingsQuery);
            const meetings = meetingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            set({ meetings });
        }),

        createMeeting: withUser(async (user, otherUser, day, start, end) => {
            const meeting = {
                staff: user.id,
                staffName: user.firstName + " " + user.lastName,
                student: otherUser.id,
                studentName: otherUser.firstName + " " + otherUser.lastName,
                day, start, end,
            };
            const newMeetingDoc = await addDoc(collection(db, `meetings`), meeting);
            set({ meetings: [...get().meetings, { id: newMeetingDoc.id, ...meeting }] });
        }),

        updateMeeting: async (meetingId, updates) => {
            const meetingRef = doc(db, `meetings`, meetingId);
            await updateDoc(meetingRef, updates);
            set({ meetings: get().meetings.map(meeting => meeting.id === meetingId ? { ...meeting, ...updates } : meeting) });
        },
        deleteMeeting: async (meetingId) => {
            const meetingRef = doc(db, `meetings`, meetingId);
            await deleteDoc(meetingRef);
            set({ meetings: get().meetings.filter(meeting => meeting.id !== meetingId) });
        }
    }
});

export const useMeetingsToday = createDataLoadingHook(useMeetingsData, 'meetings', 'loadTodayMeetings');
export const useMeetings = createDataLoadingHook(useMeetingsData, 'meetings', 'loadMeetings');