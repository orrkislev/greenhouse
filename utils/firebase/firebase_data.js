import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export function updateEvent(eventId, updatedEvent) {
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


export async function initProject() {
    const user = auth.currentUser;
    console.log(user ? 'User is logged in' : 'No user is logged in');
    if (!user) return;

    const projectsCollectionRef = collection(db, 'users', user.uid, 'projects');
    console.log("Projects collection reference:", projectsCollectionRef);
    const newProject = await addDoc(projectsCollectionRef, {
        createdAt: new Date(),
    }).catch((error) => console.error("Error creating new project: ", error));
    if (!newProject) return;

    console.log("New project created with ID:", newProject.id);

    const userDoc = doc(db, 'users', user.uid);
    await updateDoc(userDoc, {
        currentProject: newProject.id
    }).catch((error) => console.error("Error updating user with new project: ", error));
    return newProject.id;
}

export async function getProject(projectId) {
    const user = auth.currentUser;
    if (!user) return null;

    const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId);
    const projectSnapshot = await getDoc(projectDocRef).catch((error) => {
        console.error("Error fetching project: ", error);
        return null;
    })
    if (!projectSnapshot.exists()) {
        console.error("Project does not exist");
        return null;
    }
    return {
        id: projectSnapshot.id,
        ...projectSnapshot.data()
    };
}