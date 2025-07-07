import { db } from "@/utils/firebase/firebase";
import { parseDate } from "@/utils/utils";
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export async function getAllGroups(){
    const groupsSnapshot = await getDocs(collection(db,"groups"));
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

export function updateGroupSchedule(groupName, dateString, text) {
    const docRef = doc(db, 'groups', groupName, 'schedule', dateString);
    return setDoc(docRef, {
        text,
        date: parseDate(dateString)
    }, { merge: true })
}

export async function getGroupSchedule(groupName, dateString) {
    const docRef = doc(db, 'groups', groupName, 'schedule', dateString);
    const scheduleDoc = await getDoc(docRef);
    if (scheduleDoc.exists()) {
        return scheduleDoc.data().text || null;
    }
    return null;
}