import { db } from "@/utils/firebase/firebase";
import { parseDate } from "@/utils/utils";
import { doc, getDoc, setDoc } from "firebase/firestore";

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