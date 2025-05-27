import { use, useEffect } from "react";
import { useUser } from "./store/user";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useUserSchedule } from "./store/scheduleDataStore";

export default function useUserDataManager() {
    const user = useUser((state) => state.user);
    const setEvents = useUserSchedule((state) => state.setEvents);
    const setTasks = useUserSchedule((state) => state.setTasks);

    useEffect(() => {
        // getUserData();
    }, [user])


    // const getUserData = async () => {
    //     if (!user) return null;
    //     const userEventsCollection = collection(db, `users/${user.uid}/events`);
    //     const userTasksCollection = collection(db, `users/${user.uid}/tasks`);

    //     // get all events and tasks for the user
    //     let userEvents = await getDocs(userEventsCollection)
    //     userEvents = userEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //     setEvents(userEvents);

    //     let userTasks = await getDocs(userTasksCollection)
    //     userTasks = userTasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    //     setTasks(userTasks);
    // }

    return null
}