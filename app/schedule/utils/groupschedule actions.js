import { db } from "@/utils/firebase/firebase";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";

export async function getAllGroups() {
    const groupsSnapshot = await getDocs(collection(db, "groups"));
    return groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function joinGroup(userId, groupName) {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
        groups: arrayUnion(groupName)
    })
}
export async function leaveGroup(userId, groupName) {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
        groups: arrayRemove(groupName)
    })
}


export async function getGroupData(groupName) {
    const groupDoc = doc(db, "groups", groupName);
    const groupData = await getDoc(groupDoc);
    if (groupData.exists()) return { id: groupData.id, ...groupData.data() };
    throw new Error(`Group ${groupName} not found`);
}

export function isGroupAdmin(group, userId) {
    return group.admins.includes(userId);
}









export async function getGroupEntriesForWeek(groupName, week) {
    const entriesRef = collection(db, 'groups', groupName, 'entries');
    const entriesQuery = query(
        entriesRef,
        where('date', '>=', week[0]),
        where('date', '<=', week[week.length - 1])
    );
    const entriesSnapshot = await getDocs(entriesQuery);
    const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, group: groupName, ...doc.data() }));
    const subscribe = (callback) => {
        const unsubscribe = onSnapshot(entriesQuery, snapshot => {
            const updatedEntries = snapshot.docs.map(doc => ({ id: doc.id, group: groupName, ...doc.data() }));
            callback(updatedEntries);
        });
        return unsubscribe;
    };
    return { entries, subscribe };
}
export async function createGroupEntry(groupName, obj) {
    const collectionRef = collection(db, 'groups', groupName, 'entries');
    await addDoc(collectionRef, obj);
}
export async function updateGroupEntry(groupName, obj) {
    const docRef = doc(db, 'groups', groupName, 'entries', obj.id);
    await updateDoc(docRef, obj);
}
export async function removeGroupEntry(groupName, objId) {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    await deleteDoc(docRef);
}
export async function joinGroupEntry(groupName, objId, userId) {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    await updateDoc(docRef, {
        members: arrayUnion(userId)
    });
}
export async function leaveGroupEntry(groupName, objId, userId) {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    await updateDoc(docRef, {
        members: arrayRemove(userId)
    });
}