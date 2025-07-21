import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "./firebase/firebase";
import { useUser } from "./useUser";
import { useWeek } from "@/app/schedule/utils/useWeek";

export const useGroups = create(persist(
    (set, get) => ({
        groups: [],
        loadUserGroups: async () => {
            set({ groups: [] });
            try {
                const userGroups = useUser.getState().user.groups;
                userGroups.forEach(group => get().loadGroup(group))
            } catch (error) {
                console.error('Error loading user groups:', error);
            }
        },
        loadGroup: async (group) => {
            if (get().groups.find(g => g.id === group)) return;
            const groupDocRef = doc(db, "groups", group);
            const groupDoc = await getDoc(groupDocRef);
            if (groupDoc.exists()) {
                const groupData = { ...groupDoc.data(), id: groupDoc.id };
                const userGroups = useUser.getState().user?.groups;
                groupData.isMember = userGroups && userGroups.includes(groupData.id);

                const userID = useUser.getState().user?.id;
                groupData.isAdmin = userID && groupData.admins && groupData.admins.includes(userID);
                groupData.isMentor = userID && groupData.mentors && groupData.mentors.includes(userID);
                set(state => ({
                    groups: [...state.groups, groupData]
                }));
                await get().updateGroupsEntries(groupData.name);
            }
        },
        joinGroup: async (groupName) => {
            useUser.getState().updateUserDoc({
                groups: arrayUnion(groupName)
            });
        },
        leaveGroup: async (groupName) => {
            set((state) => ({
                groups: state.groups.map(group => {
                    if (group.id === groupName) {
                        return { ...group, isMember: false };
                    }
                    return group;
                })
            }));
            useUser.getState().updateUserDoc({
                groups: arrayRemove(groupName)
            });
        },

        updateWeek: async (week) => {
            const groups = get().groups;
            for (const group of groups) {
                await get().updateGroupsEntries(group.name, week);
            }
        },
        updateGroupsEntries: async (groupName, week) => {
            const group = get().groups.find(g => g.name === groupName);
            if (!group) return

            if (!week) week = useWeek.getState().week;
            if (!week || week.length === 0) return;

            if (!(group.isMember || group.isAdmin || group.isMentor)) return;

            if (group.unsubscribe) group.unsubscribe();
            const entriesRef = collection(db, 'groups', group.name, 'entries');
            const entriesQuery = query(
                entriesRef,
                where('date', '>=', week[0]),
                where('date', '<=', week[week.length - 1])
            );
            const unsubscribe = onSnapshot(entriesQuery, snapshot => {
                const entries = snapshot.docs.map(doc => ({ id: doc.id, group: group.name, ...doc.data() }));
                const userId = useUser.getState().user?.id;
                if (userId) {
                    entries.forEach(entry => {
                        entry.isMember = entry.members && entry.members.includes(userId);
                    });
                }
                set((state) => ({
                    groups: state.groups.map(g => g.name === group.name ? { ...g, entries } : g)
                }));
            });
            group.unsubscribe = unsubscribe;
            set((state) => ({
                groups: state.groups.map(g => g.name === group.name ? group : g)
            }));
        },
        getGroupStudents: async (groupId) => {
            const group = get().groups.find(g => g.id === groupId);
            if (!group) return;
            if (group.students) return;
            
            const studentQuery = query(
                collection(db, "users"),
                where("className", "==", groupId)
            )
            const snapshot = await getDocs(studentQuery);
            const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            set((state) => ({
                groups: state.groups.map(group => group.id === groupId ? { ...group, students } : group)
            }));
        }
    }),
    {
        name: "groups-storage",
        partialize: (state) => ({ groups: state.groups }),
    }
));

export const groupsActions = {
    loadUserGroups: () => useGroups.getState().loadUserGroups(),
    loadGroup: (group) => useGroups.getState().loadGroup(group),
    joinGroup: (groupName) => useGroups.getState().joinGroup(groupName),
    leaveGroup: (groupName) => useGroups.getState().leaveGroup(groupName),
    updateWeek: (week) => useGroups.getState().updateWeek(week),
    updateGroupsEntries: (groupName, week) => useGroups.getState().updateGroupsEntries(groupName, week),
    getGroupStudents: (groupId) => useGroups.getState().getGroupStudents(groupId),
    createGroupEntry: async (groupName, obj) => {
        const collectionRef = collection(db, 'groups', groupName, 'entries');
        await addDoc(collectionRef, obj);
    },
    updateGroupEntry: (groupName, obj) => {
        const docRef = doc(db, 'groups', groupName, 'entries', obj.id);
        return updateDoc(docRef, obj);
    },
    removeGroupEntry: (groupName, objId) => {
        const docRef = doc(db, 'groups', groupName, 'entries', objId);
        return deleteDoc(docRef);
    },
    joinGroupEntry: (groupName, objId, userId) => {
        const docRef = doc(db, 'groups', groupName, 'entries', objId);
        return updateDoc(docRef, {
            members: arrayUnion(userId)
        });
    },
    leaveGroupEntry: (groupName, objId, userId) => {
        const docRef = doc(db, 'groups', groupName, 'entries', objId);
        return updateDoc(docRef, {
            members: arrayRemove(userId)
        });
    }
};