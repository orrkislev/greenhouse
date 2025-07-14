import { useEffect, useRef } from "react";
import { useUser } from "../../../utils/useUser";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, or, where, and } from "firebase/firestore";
import { db } from "../../../utils/firebase/firebase";
import { useUserSchedule } from "./useUserSchedule";
import { useWeek } from "./useWeek";

export default function useUserDataManager() {
    const userId = useUser((state) => state.user.id);
    const week = useWeek((state) => state.week);

    const lastEvents = useRef([]);
    const events = useUserSchedule((state) => state.events);
    const setEvents = useUserSchedule((state) => state.setEvents);

    const lastTasks = useRef([])
    const tasks = useUserSchedule((state) => state.tasks);
    const setTasks = useUserSchedule((state) => state.setTasks);

    useEffect(() => {
        if (!userId) {
            setEvents([]);
            setTasks([]);
            return;
        }
    }, [userId])

    useEffect(() => {
        if (!userId) return;
        if (!week || week.length === 0) return;

        const userEventsCollection = collection(db, `users/${userId}/events`);
        const userTasksCollection = collection(db, `users/${userId}/tasks`);

        // get all events and tasks for this week, in the user's collection
        (async () => {
            const eventsQuery = query(userEventsCollection,
                and(
                    where('date', '>=', week[0]),
                    where('date', '<=', week[week.length - 1])
                )
            )
            let userEvents = await getDocs(eventsQuery);
            userEvents = userEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            lastEvents.current = events;
            setEvents(userEvents);

            const tasksQuery = query(userTasksCollection,
                or(
                    and(
                        where('start', '>=', week[0]),
                        where('start', '<=', week[week.length - 1])
                    ),
                    and(
                        where('end', '>=', week[0]),
                        where('end', '<=', week[week.length - 1])
                    ),
                    and(
                        where('start', '<=', week[0]),
                        where('end', '>=', week[week.length - 1])
                    )
                )
            )
            let userTasks = await getDocs(tasksQuery);
            userTasks = userTasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            lastTasks.current = tasks;
            setTasks(userTasks);
        })();
    }, [userId, week])







    // ---------- Update events in Firebase ----------
    // -----------------------------------------------
    useEffect(() => {
        console.log('useEffect for events');
        if (!userId) return;

        const updateEvents = async () => {
            const eventsCollectionRef = collection(db, 'users', userId, 'events');

            // check for deleted events
            const currentEventIds = new Set(events.map(e => e.id));
            const deletedEvents = lastEvents.current.filter(e => !currentEventIds.has(e.id));
            for (const event of deletedEvents) {
                console.log("Deleting event", event);
                const eventDocRef = doc(eventsCollectionRef, event.id);
                await deleteDoc(eventDocRef);
            }

            for (const event of events) {
                const prevEvent = lastEvents.current.find(e => e.id === event.id);
                // get the event data, without the id
                if (prevEvent && prevEvent.id) {
                    const { id, ...eventData } = event;
                    const { id: prevId, ...prevEventData } = prevEvent;
                    if (JSON.stringify(prevEventData) !== JSON.stringify(eventData)) {
                        const eventDocRef = doc(eventsCollectionRef, event.id);
                        updateDoc(eventDocRef, eventData)
                            .catch((error) => {
                                console.error("Error updating event: ", error);
                            });
                    }
                }
            }

            lastEvents.current = events;

            if (events.some(event => !event.id)) {
                const newEventsObj = [...events]
                for (const event of newEventsObj) {
                    if (event.id) continue;
                    const newEventDoc = await addDoc(eventsCollectionRef, event);
                    event.id = newEventDoc.id;
                }
                lastEvents.current = newEventsObj;
                // setEvents(newEventsObj);
            }
        };

        const timer = setTimeout(updateEvents, 1000);
        return () => clearTimeout(timer);
    }, [events, userId]);



    // ---------- Update tasks in Firebase ----------
    // -----------------------------------------------
    useEffect(() => {
        if (!userId) return;
        if (!tasks || tasks.length === 0) return;

        const updateTasks = async () => {
            console.log("Updating tasks in Firebase", tasks);
            return
            const tasksCollectionRef = collection(db, 'users', userId, 'tasks');

            // check for deleted tasks
            const currentTaskIds = new Set(tasks.map(t => t.id));
            const deletedTasks = lastTasks.current.filter(t => !currentTaskIds.has(t.id));
            for (const task of deletedTasks) {
                const taskDocRef = doc(tasksCollectionRef, task.id);
                await deleteDoc(taskDocRef);
            }

            for (const task of tasks) {
                const prevTask = lastTasks.current.find(t => t.id === task.id);
                if (!prevTask || JSON.stringify(prevTask) !== JSON.stringify(task)) {
                    if (task.id) {
                        const taskDocRef = doc(tasksCollectionRef, task.id);
                        updateDoc(taskDocRef, task)
                            .catch((error) => {
                                console.error("Error updating task: ", error);
                            });
                    }
                }
            }

            lastTasks.current = tasks;

            if (tasks.some(task => !task.id)) {
                const newTasksObj = [...tasks]
                for (const task of newTasksObj) {
                    if (task.id) continue;
                    const newTaskDoc = await addDoc(tasksCollectionRef, task);
                    task.id = newTaskDoc.id;
                }
                lastTasks.current = newTasksObj;
                setTasks(newTasksObj);
            }

        };

        const timer = setTimeout(updateTasks, 1000);
        return () => clearTimeout(timer);
    }, [tasks, userId]);

}