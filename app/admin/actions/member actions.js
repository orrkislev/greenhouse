import { collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import { createUser } from "./createUser";
import { db } from "@/utils/firebase/firebase";

export async function getAllMembers() {
    const membersCollection = collection(db, "users");
    let allMembers = await getDocs(membersCollection);
    allMembers = allMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
    const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
    return { students: studentsList, staff: staffList };
}

export async function subscribeToMembers(callback) {
    const membersCollection = collection(db, "users");
    const unsubscribeMembers = onSnapshot(membersCollection, snapshot => {
        const allMembers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
        const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
        callback({ students: studentsList, staff: staffList });
    });
    return unsubscribeMembers;
}

export async function createStudent(firstName, lastName, username, pin, group) {
    await createUser(username, pin, firstName, lastName);
    updateUserData(username, {
        firstName,
        lastName,
        className: group,
        groups: [group],
        roles: ['student'],
    });
}

export async function createStaff(firstName, lastName, username, pin, job) {
    await createUser(username, pin, firstName, lastName);
    updateUserData(username, {
        firstName,
        lastName,
        job,
        roles: ['staff'],
        groups: ['צוות']
    });
}

export async function updateUserData(username, data) {
    const userRef = doc(db, "users", username);
    await setDoc(userRef, data, { merge: true });
}
