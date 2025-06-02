import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export function updateEvent(eventId, updatedEvent) {
    console.log("Updating event:", eventId, updatedEvent);
    const user = auth.currentUser;
    if (!user) return;

    const eventsCollectionRef = collection(db, 'users', user.uid, 'events');
    const eventDocRef = doc(eventsCollectionRef, eventId);
    updateDoc(eventDocRef, updatedEvent)
        .catch((error) => {
            console.error("Error updating event: ", error);
        });
}
export function deleteEvent(eventId) {
    const user = auth.currentUser;
    if (!user) return;

    const eventsCollectionRef = collection(db, 'users', user.uid, 'events');
    const eventDocRef = doc(eventsCollectionRef, eventId);

    deleteDoc(eventDocRef)
        .catch((error) => {
            console.error("Error deleting event: ", error);
        });
}
