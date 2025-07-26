import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "./firebase/firebase";
import { userActions, useUser } from "./useUser";
import { useTime } from "@/utils/useTime";

export const useGroups = create(persist(
    (set, get) => ({
        groups: [],
        clear: () => {
            console.log("Clearing groups...");
            set({ groups: [] })
        },

        // ----------- Group Loading -----------
        // -------------------------------------
        loadUserGroups: async () => {
            const groups = get().groups;
            const userGroups = useUser.getState().user.groups || [];
            const groupsToLoad = userGroups.filter(group => !groups.find(g => g.id === group));
            for (const group of groupsToLoad) {
                await get().loadGroup(group);
            }
            get().updateWeek();
        },
        loadMentoringGroups: async () => {
            const userId = useUser.getState().user?.id;
            console.log("Loading mentoring groups for user:", userId);
            if (!userId) return;
            const groupsQuery = query(
                collection(db, "groups"),
                where("mentors", "array-contains", userId)
            );
            const snapshot = await getDocs(groupsQuery);
            console.log("Mentoring groups loaded:", snapshot.docs.length);
            const mentoringGroups = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, isMentor: true }));
            set({ groups: [...get().groups.filter(g => mentoringGroups.find(mg => mg.id === g.id)), ...mentoringGroups] });
        },
        loadGroup: async (group) => {
            if (get().groups.find(g => g.id === group)) return;
            set(state => ({
                groups: [...state.groups, { id: group }]
            }));
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
                    groups: [...state.groups.map(g => g.id === groupData.id ? groupData : g)]
                }));
            }
        },

        // ----------- Group Management --------
        // -------------------------------------
        joinGroup: async (groupName) => {
            userActions.updateUserDoc({
                groups: useUser.getState().user.groups.concat(groupName)
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
            userActions.updateUserDoc({
                groups: arrayRemove(groupName)
            });
        },

        // ----------- Group Entries Management -----------
        // ------------------------------------------------
        updateWeek: async () => {
            const week = useTime.getState().week;
            if (!week || week.length === 0) return;
            for (const group of get().groups) {
                get().loadGroupEntries(group, week[0], week[week.length - 1]);
            }
        },
        loadTodayEntries: async () => {
            const today = useTime.getState().today;
            const groups = get().groups;
            for (const group of groups) {
                get().loadGroupEntries(group, today, today);
            }
        },
        loadGroupEntries: async (group, start, end) => {
            if (!group || !group.name) return;
            const userId = useUser.getState().user?.id;
            if (group.unsubscribe) group.unsubscribe();
            const entriesRef = collection(db, 'groups', group.name, 'entries');
            const entriesQuery = query(entriesRef,
                where('date', '>=', start),
                where('date', '<=', end)
            );
            group.unsubscribe = onSnapshot(entriesQuery, snapshot => {
                const entries = snapshot.docs.map(doc => ({ id: doc.id, group: group.name, ...doc.data() }));
                entries.forEach(entry => { entry.isMember = entry.members && entry.members.includes(userId); });
                set((state) => ({ groups: state.groups.map(g => g.name === group.name ? { ...g, entries } : g) }));
            });
            set((state) => ({
                groups: state.groups.map(g => g.name === group.name ? group : g)
            }));
        },

        // ----------- Group Students Management -----------
        // -------------------------------------------------
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

export const groupsActions = Object.fromEntries(
    Object.entries(useGroups.getState()).filter(([key, value]) => typeof value === 'function')
);
groupsActions.createGroupEntry = async (groupName, obj) => {
    const collectionRef = collection(db, 'groups', groupName, 'entries');
    await addDoc(collectionRef, obj);
}
groupsActions.updateGroupEntry = (groupName, obj) => {
    const docRef = doc(db, 'groups', groupName, 'entries', obj.id);
    return updateDoc(docRef, obj);
}
groupsActions.removeGroupEntry = (groupName, objId) => {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    return deleteDoc(docRef);
}
groupsActions.joinGroupEntry = (groupName, objId, userId) => {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    return updateDoc(docRef, { members: arrayUnion(userId) });
}
groupsActions.leaveGroupEntry = (groupName, objId, userId) => {
    const docRef = doc(db, 'groups', groupName, 'entries', objId);
    return updateDoc(docRef, { members: arrayRemove(userId) });
}
groupsActions.getAllGroups = async () => {
    const groupsRef = collection(db, "groups");
    const snapshot = await getDocs(groupsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
groupsActions.getUserGroupEntriesForWeek = async (group, userId, week) => {
    const eventsRef = collection(db, `groups/${group}/entries`);
    const eventsQuery = query(eventsRef,
        where("date", ">=", week[0]),
        where("date", "<=", week[week.length - 1]),
        where("members", "array-contains", userId)
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return events;
}



useUser.subscribe(state => state.user?.id, groupsActions.clear)
useUser.subscribe(state => state.user?.groups,
    (userGroups) => {
        if (userGroups && userGroups.length > 0)
            groupsActions.loadUserGroups();
    }
);
groupsActions.loadUserGroups();
useTime.subscribe(state => state.week,
    (week) => {
        if (week && week.length > 0) groupsActions.updateWeek();
    }
);
groupsActions.updateWeek();