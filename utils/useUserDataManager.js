import { useEffect, useRef } from "react";
import { useUser } from "./store/user";
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, or, where } from "firebase/firestore";
import { db } from "./firebase/firebase";
import { useUserSchedule } from "./store/scheduleDataStore";
import { useWeek } from "./store/scheduleDisplayStore";
import { formatDate } from "./utils";

export default function useUserDataManager() {
    const user = useUser((state) => state.user);
    const week = useWeek((state) => state.week);

    const lastEvents = useRef([]);
    const events = useUserSchedule((state) => state.events);
    const setEvents = useUserSchedule((state) => state.setEvents);

    const lastTasks = useRef([])
    const tasks = useUserSchedule((state) => state.tasks);
    const setTasks = useUserSchedule((state) => state.setTasks);

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setTasks([]);
            return;
        }
    }, [user])

    useEffect(() => {
        if (!user) return;
        if (!week || week.length === 0) return;

        const userEventsCollection = collection(db, `users/${user.id}/events`);
        const userTasksCollection = collection(db, `users/${user.id}/tasks`);

        // get all events and tasks for this week, in the user's collection
        (async () => {
            const eventsQuery = query(userEventsCollection,
                where('date', 'in', week.map(date => formatDate(date)))
            )
            let userEvents = await getDocs(eventsQuery);
            userEvents = userEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            lastEvents.current = events;
            setEvents(userEvents);

            const tasksQuery = query(userTasksCollection,
                or(
                    where('start', 'in', week.map(date => formatDate(date))),
                    where('end', 'in', week.map(date => formatDate(date)))
                )
            )
            let userTasks = await getDocs(tasksQuery);
            userTasks = userTasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            lastTasks.current = tasks;
            setTasks(userTasks);
        })();
    }, [user, week])







    // ---------- Update events in Firebase ----------
    // -----------------------------------------------
    useEffect(() => {
        if (!user) return;

        const updateEvents = async () => {
            const eventsCollectionRef = collection(db, 'users', user.id, 'events');

            // check for deleted events
            const currentEventIds = new Set(events.map(e => e.id));
            const deletedEvents = lastEvents.current.filter(e => !currentEventIds.has(e.id));
            for (const event of deletedEvents) {
                const eventDocRef = doc(eventsCollectionRef, event.id);
                await deleteDoc(eventDocRef);
            }

            for (const event of events) {
                const prevEvent = lastEvents.current.find(e => e.id === event.id);
                if (!prevEvent || JSON.stringify(prevEvent) !== JSON.stringify(event)) {
                    if (event.id) {
                        const eventDocRef = doc(eventsCollectionRef, event.id);
                        updateDoc(eventDocRef, event)
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
                setEvents(newEventsObj);
            }
        };

        const timer = setTimeout(() => {
            updateEvents();
        }, 1000);

        return () => clearTimeout(timer);
    }, [events, user]);



    // ---------- Update tasks in Firebase ----------
    // -----------------------------------------------
    useEffect(() => {
        if (!user) return;
        if (!tasks || tasks.length === 0) return;
        
        const updateTasks = async () => {
            const tasksCollectionRef = collection(db, 'users', user.id, 'tasks');

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

        setTimeout(() => {
            updateTasks();
        }, 1000);

    }, [tasks, user]);

}