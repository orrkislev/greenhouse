import { db } from "@/utils/firebase/firebase";
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";

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

export async function createGroupObject(groupName, obj) {
    const collectionName = obj.type === 'event' ? 'events' : 'tasks';
    const collectionRef = collection(db, 'groups', groupName, collectionName)
    await addDoc(collectionRef, obj);
}

export async function updateGroupObject(groupName, objectType, obj) {
    const docRef = doc(db, 'groups', groupName, objectType, obj.id);
    await updateDoc(docRef, obj);
}
export async function removeGroupObject(groupName, objectType, objectId) {
    const docRef = doc(db, 'groups', groupName, objectType, objectId);
    await deleteDoc(docRef);
}

export async function getGroupScheduleForDay(groupName, dateString) {
    const tasksQuery = query(
        collection(db, 'groups', groupName, 'tasks'),
        where('date', '==', dateString)
    );
    const eventsQuery = query(
        collection(db, 'groups', groupName, 'events'),
        where('date', '==', dateString)
    );
    const [tasksSnapshot, eventsSnapshot] = await Promise.all([getDocs(tasksQuery), getDocs(eventsQuery)]);
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return {tasks, events};
}
export function subscribeToGroupScheduleForDay(groupName, dateString, callback) {
    const tasksQuery = query(
        collection(db, 'groups', groupName, 'tasks'),
        where('date', '==', dateString)
    );
    const eventsQuery = query(
        collection(db, 'groups', groupName, 'events'),
        where('date', '==', dateString)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, snapshot => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback({ type: 'tasks', data: tasks });
    });
    const unsubscribeEvents = onSnapshot(eventsQuery, snapshot => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback({ type: 'events', data: events });
    });
    return () => {
        unsubscribeTasks();
        unsubscribeEvents();
    };
}