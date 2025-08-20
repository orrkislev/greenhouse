import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/store/useUser";
import { format } from "date-fns";
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

        loadTodayEvents: async () => {
            if (!userId()) return;
            const events = await get().getTodaysEventsForUser(userId());
            set({ events });
        },
        loadWeekEvents: async (week) => {
            if (!userId() || !week || week.length === 0) return;

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
            set((state) => ({ events: [...state.events, event] }));
        },
        removeGroupEvent: (eventId) => {
            set((state) => ({
                events: state.events.filter(event => event.id !== eventId)
            }));
        },

        getTodaysEventsForUser: async (userId) => {
            const eventsRef = collection(db, `users/${userId}/events`);
            const eventsQuery = query(eventsRef, where("date", "==", format(new Date(), "yyyy-MM-dd")));
            const eventsSnap = await getDocs(eventsQuery);
            const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return events;
        }
    }
});

export const eventsActions = Object.fromEntries(
    Object.entries(useEvents.getState()).filter(([key, value]) => typeof value === 'function')
);
eventsActions.getUserEventsForWeek = async (userId, week) => {
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventsQuery = query(eventsRef,
        where("date", ">=", week[0]),
        where("date", "<=", week[week.length - 1])
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return events;
}