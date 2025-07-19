import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { addDoc, and, collection, deleteDoc, doc, getDocs, or, query, updateDoc, where } from "firebase/firestore";
import { debounce } from "lodash";
import { create } from "zustand";

export const useEvents = create((set, get) => {
    const userId = () => useUser.getState().user.id;
    const getRef = (collectionName) => collection(db, `users/${userId()}/${collectionName}`);

    const debouncedUpdateEvents = debounce(async () => {
        const { events } = get();
        const ref = getRef("events");
        for (const event of events) {
            if (event._dirty && event.id) {
                const { id, _dirty, ...data } = event;
                await updateDoc(doc(ref, id), data);
                event._dirty = false;
            }
        }
        set({ events: [...events] });
    }, 1000);

    return {

        events: [],

        loadWeekEvents: async (week) => {
            const uid = useUser.getState().user.id;
            if (!uid || !week || week.length === 0) return;

            const eventsRef = getRef("events");
            const eventsQuery = query(eventsRef,
                and(
                    where("date", ">=", week[0]),
                    where("date", "<=", week[week.length - 1])
                )
            );
            const eventsSnap = await getDocs(eventsQuery);
            const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            set({ events });
        },
        addEvent: async (event) => {
            const newDoc = await addDoc(getRef("events"), event);
            event.id = newDoc.id;
            set((state) => ({
                events: [...state.events, event]
            }));
        },
        updateEvent: (eventId, updatedEvent) => {
            updatedEvent._dirty = true;
            set((state) => {
                const updatedEvents = state.events.map(event =>
                    event.id === eventId ? { ...event, ...updatedEvent } : event
                );
                return { events: updatedEvents };
            });
            debouncedUpdateEvents();
        },
        deleteEvent: async (eventId) => {
            const ref = getRef("events");
            await deleteDoc(doc(ref, eventId));
            set((state) => ({
                events: state.events.filter(event => event.id !== eventId)
            }));
        },
        addGroupEvent: event => {
            const newEvent = {
                group: event.group,
                start: event.timeRange.start,
                end: event.timeRange.end,
                title: event.title,
                date: event.date,
                id: event.id,
            }
            set((state) => ({ events: [...state.events, newEvent] }));
        },
        removeGroupEvent: (eventId) => {
            set((state) => ({
                events: state.events.filter(event => event.id !== eventId)
            }));
        },
    }
});

export const eventsActions = {
    loadWeekEvents: (week) => useEvents.getState().loadWeekEvents(week),
    addEvent: (event) => useEvents.getState().addEvent(event),
    updateEvent: (eventId, updatedEvent) => useEvents.getState().updateEvent(eventId, updatedEvent),
    deleteEvent: (eventId) => useEvents.getState().deleteEvent(eventId),
    addGroupEvent: (event) => useEvents.getState().addGroupEvent(event),
    removeGroupEvent: (eventId) => useEvents.getState().removeGroupEvent(eventId),
}
