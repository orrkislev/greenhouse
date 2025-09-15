import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/store/useUser";
import { format } from "date-fns";
import { addDoc, and, collection, deleteDoc, doc, getDocs, or, query, updateDoc, where } from "firebase/firestore";
import { debounce } from "lodash";
import { createStore, createDataLoadingHook, withLoadingCheck } from "./utils/createStore";
import { useTime } from "./useTime";


export const [useEventsData, eventsActions] = createStore((set, get, withUser, withLoadingCheck) => {
    const getRef = () => {
        const userId = useUser.getState().user.id;
        return collection(db, `users/${userId}/events`);
    }

    const debouncedUpdateEvents = debounce(async () => {
        const { events } = get();
        const ref = getRef();
        for (const event of events) {
            if (event._dirty && event.id) {
                console.log('saving event to firestore', event);
                const { id, _dirty, ...data } = event;
                await updateDoc(doc(ref, id), data);
                event._dirty = false;
            }
        }
        set({ events: [...events] });
    }, 1000);

    return {
        events: [],

        loadTodayEvents: withLoadingCheck(async (user) => {
            set({ events: [] });
            const events = await get().getTodaysEventsForUser(user.id);
            set({ events });
        }), 
        loadWeekEvents: withLoadingCheck(async (user, week) => {
            set({ events: [] });
            if (!week) week = useTime.getState().week;
            if (!week || week.length === 0) return;

            const eventsRef = collection(db,'users',user.id,'events')
            const eventsQuery = query(eventsRef,
                and(
                    where("date", ">=", week[0]),
                    where("date", "<=", week[week.length - 1])
                )
            );
            const eventsSnap = await getDocs(eventsQuery);
            const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            set({ events });
        }),

        // ------------------------------
        // ---- CRUD Events -------------
        // ------------------------------
        addEvent: async (event) => {
            const newDoc = await addDoc(getRef(), event);
            event.id = newDoc.id;
            set((state) => ({
                events: [...state.events, event]
            }));
        },
        updateEvent: (eventId, updatedEvent) => {
            console.log('updating event', eventId, updatedEvent);
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
            const ref = getRef();
            await deleteDoc(doc(ref, eventId));
            set((state) => ({
                events: state.events.filter(event => event.id !== eventId)
            }));
        },

        // -----------------------------------
        // ---- Other Users ( for staff ) ----
        // -----------------------------------
        getTodaysEventsForUser: async (userId) => {
            const eventsRef = collection(db, `users/${userId}/events`);
            const eventsQuery = query(eventsRef, where("date", "==", format(new Date(), "yyyy-MM-dd")));
            const eventsSnap = await getDocs(eventsQuery);
            const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return events;
        }
    }
});

export const useTodayEvents = createDataLoadingHook(useEventsData, 'events', 'loadTodayEvents');
export const useWeekEvents = createDataLoadingHook(useEventsData, 'events', 'loadWeekEvents');
