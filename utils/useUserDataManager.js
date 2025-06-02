import { useEffect, useRef } from "react";
import { useUser } from "./store/user";
import { collection, getDocs, query, onSnapshot, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useUserSchedule } from "./store/scheduleDataStore";

export default function useUserDataManager() {
    const user = useUser((state) => state.user);

    const lastEvents = useRef([]);
    const events = useUserSchedule((state) => state.events);
    const setEvents = useUserSchedule((state) => state.setEvents);

    const tasks = useUserSchedule((state) => state.tasks);
    const setTasks = useUserSchedule((state) => state.setTasks);

    const dontUpdateFirebase = useRef(true);

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setTasks([]);
            return;
        }

        const userEventsCollection = collection(db, `users/${user.id}/events`);
        const userTasksCollection = collection(db, `users/${user.id}/tasks`);

        // get all events and tasks for the user
        (async () => {
            let userEvents = await getDocs(userEventsCollection)
            userEvents = userEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(userEvents);

            let userTasks = await getDocs(userTasksCollection)
            userTasks = userTasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            dontUpdateFirebase.current = true
            setTasks(userTasks);
        })();

        // const eventsQuery = query(userEventsCollection);
        // const tasksQuery = query(userTasksCollection);
        // subscribe to changes in events and tasks
        // const unsubscribeEvents = onSnapshot(eventsQuery, snapshot => {
        //     const updatedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //     dontUpdateFirebase.current = false;
        //     setEvents(updatedEvents);
        // });
        // const unsubscribeTasks = onSnapshot(tasksQuery, snapshot => {
        //     const updatedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //     setTasks(updatedTasks);
        // });

        // return () => {
        //     unsubscribeEvents();
        //     unsubscribeTasks();
        // }
    }, [user])

    // Update Firebase when events change (but not on initial load)
    useEffect(() => {
        if (!user) return;
        if (dontUpdateFirebase.current) {
            dontUpdateFirebase.current = false;
            lastEvents.current = events; // Initialize lastEvents on first load
            return;
        }

        const updateEvents = async () => {
            const eventsCollectionRef = collection(db, 'users', user.id, 'events');
            // Only update events that have changed
            for (const event of events) {
                const prevEvent = lastEvents.current.find(e => e.id === event.id);
                if (!prevEvent || JSON.stringify(prevEvent) !== JSON.stringify(event)) {
                    const eventDocRef = doc(eventsCollectionRef, event.id);
                    updateDoc(eventDocRef, event)
                        .catch((error) => {
                            console.error("Error updating event: ", error);
                        });
                }
            }
            // Update lastEvents after syncing
            lastEvents.current = events;
        };

        const timer = setTimeout(() => {
            if (!dontUpdateFirebase.current) updateEvents();
        }, 2000);

        return () => clearTimeout(timer);
    }, [events, user]);

    return null
}