import { useEffect } from "react";
import { useUser } from "./store/user";
import { collection, getDocs, query, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useUserSchedule } from "./store/scheduleDataStore";

export default function useUserDataManager() {
    const user = useUser((state) => state.user);
    const setEvents = useUserSchedule((state) => state.setEvents);
    const setTasks = useUserSchedule((state) => state.setTasks);

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
            setTasks(userTasks);
        })();

        const eventsQuery = query(userEventsCollection);
        const tasksQuery = query(userTasksCollection);

        // subscribe to changes in events and tasks
        const unsubscribeEvents = onSnapshot(eventsQuery, snapshot => {
            const updatedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(updatedEvents);
        });
        const unsubscribeTasks = onSnapshot(tasksQuery, snapshot => {
            const updatedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(updatedTasks);
        });


        return () => {
            unsubscribeEvents();
            unsubscribeTasks();
        }
    }, [user])


    const getUserData = async () => {

    }

    return null
}