import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand";

export const useGroupSchedule = create((set, get) => {
    const userId = () => useUser.getState().user.id;
    return {
        groups: [],
        getUserGroups: async () => {
            const userGroups = useUser.getState().user.groups;
            userGroups.forEach(group => get().getGroupData(group))
        },
        getGroupData: async (groupName) => {
            if (get().groups.some(g => g.name === groupName)) return;

            const groupDocRef = doc(db, "groups", groupName);
            const groupDoc = await getDoc(groupDocRef);
            if (groupDoc.exists()) {
                const groupData = { id: groupDoc.id, name: groupName, ...groupDoc.data() };
                groupData.isAdmin = groupData.admins && groupData.admins.includes(userId());
                set((state) => ({
                    groups: [...state.groups, groupData]
                }));
            }
        },
        joinGroup: async (groupName) => {
            const userDoc = doc(db, "users", userId());
            await updateDoc(userDoc, { groups: arrayUnion(groupName) })
            get().getGroupData(groupName);
        },
        leaveGroup: async (groupName) => {
            const userDoc = doc(db, "users", userId());
            await updateDoc(userDoc, { groups: arrayRemove(groupName) })
            set((state) => ({ groups: state.groups.filter(group => group.name !== groupName) }));
        },

        getAvailableGroups: async () => {
            const allGroupsCollection = collection(db, "groups");
            const groupsSnapshot = await getDocs(allGroupsCollection);
            const allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const userGroups = useUser.getState().user.groups;
            const availableGroups = allGroups.filter(group => !userGroups.includes(group.id));
            if (useUser.getState().user.roles.includes('staff')) {
                return availableGroups;
            } else {
                return availableGroups.filter(group => group.open);
            }
        },


        getWeeksEntries: async (week) => {
            const newGroupsData = [...get().groups];
            newGroupsData.forEach(group => {
                if (group.unsubscribe) {
                    group.unsubscribe();
                }
                const entriesRef = collection(db, 'groups', group.name, 'entries');
                const entriesQuery = query(
                    entriesRef,
                    where('date', '>=', week[0]),
                    where('date', '<=', week[week.length - 1])
                );
                const unsubscribe = onSnapshot(entriesQuery, snapshot => {
                    const entries = snapshot.docs.map(doc => ({ id: doc.id, group: group.name, ...doc.data() }));
                    const uid = userId();
                    entries.forEach(entry => {
                        entry.isMember = entry.members && entry.members.includes(uid);
                    });
                    set((state) => ({
                        groups: state.groups.map(g => g.name === group.name ? { ...g, entries } : g)
                    }));
                });
                group.unsubscribe = unsubscribe;
            });
            set({ groups: newGroupsData });
        },
    };
})

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