import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase/firebase";
import { format } from "date-fns";

export const useGantt = create((set, get) => ({
    events: [],
    terms: [],
    currTerm: null,

    initialLoad: async () => {
        const ganttInfo = doc(db, 'school', 'gantt')
        const ganttSnapshot = await getDoc(ganttInfo);
        if (!ganttSnapshot.exists()) {
            console.error("Gantt info not found");
            return;
        }
        const ganttData = ganttSnapshot.data();
        const terms = ganttData.terms || [];
        const currDate = format(new Date(), 'yyyy-MM-dd');
        const currTerm = terms.find(term => term.start <= currDate && term.end >= currDate) || null;
        set({ terms, currTerm });
    },

    loadRangeEvents: async (start, end) => {
        const eventsCollection = collection(db, 'school', 'gantt', 'events')
        const eventsQuery = query(eventsCollection, where('start', '>=', start), where('start', '<=', end));
        const eventsSnapshot = await getDocs(eventsQuery);
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set(state => ({ events: [...state.events, ...events] }));
    },

    updateEvent: async (eventId, updates) => {
        const eventRef = doc(db, 'school', 'gantt', 'events', eventId);
        await updateDoc(eventRef, updates);
        set(state => ({
            events: state.events.map(event => event.id === eventId ? { ...event, ...updates } : event)
        }));
    },
    createEvent: async (eventData) => {
        const eventsCollection = collection(db, 'school', 'gantt', 'events');
        const newEventRef = doc(eventsCollection);
        await addDoc(newEventRef, eventData);
        set(state => ({
            events: [...state.events, { id: newEventRef.id, ...eventData }]
        }));
    },
    deleteEvent: async (eventId) => {
        const eventRef = doc(db, 'school', 'gantt', 'events', eventId);
        await deleteDoc(eventRef);
        set(state => ({
            events: state.events.filter(event => event.id !== eventId)
        }));
    }
}));

export const ganttActions = {
    initialLoad: useGantt.getState().initialLoad,
    loadRangeEvents: useGantt.getState().loadRangeEvents,
    updateEvent: useGantt.getState().updateEvent,
    deleteEvent: useGantt.getState().deleteEvent,
    createEvent: useGantt.getState().createEvent
};