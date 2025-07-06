import { db } from "@/utils/firebase/firebase";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";

export async function createGroup(name) {
    // validate the group name
    if (!name || !name.trim()) throw new Error("Name is required");

    // check if the group already exists
    const groupRef = doc(db, "groups", name);
    const groupSnapshot = await getDoc(groupRef);
    if (groupSnapshot.exists()) throw new Error("Group already exists");
    
    // create the group document
    const res = await setDoc(doc(db, "groups", name), {
        name,
        open: false,
    });

    return res;
}


export async function getAllGroups() {
    const groupsCollection = collection(db, "groups");
    const snapshot = await getDocs(groupsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function subscribeToGroups(callback) {
    const groupsCollection = collection(db, "groups");
    const unsubscribe = onSnapshot(groupsCollection, snapshot => {
        const allGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(allGroups);
    });
    return unsubscribe;
}

export async function addAdmin(groupName, username){
    const groupRef = doc(db, "groups", groupName);
    await updateDoc(groupRef, {
        admins: arrayUnion(username)
    });
}
export async function removeAdmin(groupName, username) {
    const groupRef = doc(db, "groups", groupName);
    await updateDoc(groupRef, {
        admins: arrayRemove(username)
    });
}