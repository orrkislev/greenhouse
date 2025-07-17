import { db } from "@/utils/firebase/firebase";
import { and, collection, getDocs, query, where } from "firebase/firestore";

export async function getUserEventsForWeek(userId, week) {
    const eventsRef = collection(db, `users/${userId}/events`);
    const eventsQuery = query(eventsRef,
        and(
            where("date", ">=", week[0]),
            where("date", "<=", week[week.length - 1])
        )
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return events;  
}

export async function getUserGroupEntriesForWeek(group, userId, week){
    const eventsRef = collection(db, `groups/${group}/entries`);
    const eventsQuery = query(eventsRef,
        and(
            where("date", ">=", week[0]),
            where("date", "<=", week[week.length - 1]),
            where("members", "array-contains", userId)
        )
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return events;
}