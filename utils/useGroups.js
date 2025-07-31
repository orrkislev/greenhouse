import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { db } from "./firebase/firebase";
import { userActions, useUser } from "./useUser";
import { useTime } from "@/utils/useTime";

export const useGroups = create((set, get) => ({
    groups: [],
    clear: () => {
        set({ groups: [] })
    },

    // ----------- Group Loading -----------
    // -------------------------------------
    loadGroups: async () => {
        if (get().groups.length > 0) return;
        
        const user = useUser.getState().user;
        if (!user || !user.id) return;

        const userGroups = [];
        if (user.roles.includes('staff')) userGroups.push({ id: 'צוות', type: 'staff' });
        if (user.class) userGroups.push({ id: user.class, type: 'class' });
        if (user.major) userGroups.push({ id: user.major, type: 'major' });

        const currGroups = get().groups;
        const groupsToLoad = userGroups.filter(group => !currGroups.find(g => g.id === group.id));
        
        const newGroups = [];
        for (const group of groupsToLoad) {
            const groupDocRef = doc(db, "groups", group.id);
            const groupDoc = await getDoc(groupDocRef);
            if (groupDoc.exists()) {
                newGroups.push({ ...groupDoc.data(), id: groupDoc.id, type: group.type });
            }
        }
        newGroups.forEach(group => {
            group.isMentor = group.mentors && group.mentors.includes(user.id);
        })
        const oldGroups = currGroups.filter(g => !newGroups.find(g2 => g2.id === g.id));
        set({ groups: [...oldGroups, ...newGroups] });
    },
    updateGroup: async (group, updates) => {
        const groupDocRef = doc(db, "groups", group.id);
        await updateDoc(groupDocRef, updates);
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...group, ...updates } : g) }));
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
        if (!group || !group.id) return;
        const userId = useUser.getState().user?.id;
        if (group.unsubscribe) group.unsubscribe();
        const entriesRef = collection(db, 'groups', group.id, 'entries');
        const entriesQuery = query(entriesRef,
            where('date', '>=', start),
            where('date', '<=', end)
        );
        group.unsubscribe = onSnapshot(entriesQuery, snapshot => {
            const entries = snapshot.docs.map(doc => ({ id: doc.id, group: group.id, ...doc.data() }));
            entries.forEach(entry => { entry.isMember = entry.members && entry.members.includes(userId); });
            set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, entries } : g) }));
        });
        set((state) => ({
            groups: state.groups.map(g => g.id === group.id ? group : g)
        }));
    },

    // ----------- Group Students Management -----------
    // -------------------------------------------------
    loadClassStudents: async (group) => {
        if (group.students) return;

        let queryFilter = null
        if (group.type === 'class') queryFilter = where("class", "==", group.id);
        else if (group.type === 'major') queryFilter = where("major", "==", group.id);
        else if (group.type === 'staff') queryFilter = where("roles", "array-contains", "staff");
        if (!queryFilter) return;

        const snapshot = await getDocs(query(collection(db, "users"), queryFilter));
        const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, students } : g) }));
    }
})
);

export const groupsActions = Object.fromEntries(
    Object.entries(useGroups.getState()).filter(([key, value]) => typeof value === 'function')
);
groupsActions.createGroupEntry = async (groupId, obj) => {
    const collectionRef = collection(db, 'groups', groupId, 'entries');
    await addDoc(collectionRef, obj);
}
groupsActions.updateGroupEntry = (groupId, obj) => {
    const docRef = doc(db, 'groups', groupId, 'entries', obj.id);
    return updateDoc(docRef, obj);
}
groupsActions.removeGroupEntry = (groupId, objId) => {
    const docRef = doc(db, 'groups', groupId, 'entries', objId);
    return deleteDoc(docRef);
}
groupsActions.joinGroupEntry = (groupId, objId, userId) => {
    const docRef = doc(db, 'groups', groupId, 'entries', objId);
    return updateDoc(docRef, { members: arrayUnion(userId) });
}
groupsActions.leaveGroupEntry = (groupId, objId, userId) => {
    const docRef = doc(db, 'groups', groupId, 'entries', objId);
    return updateDoc(docRef, { members: arrayRemove(userId) });
}
groupsActions.getAllGroups = async () => {
    const groupsRef = collection(db, "groups");
    const snapshot = await getDocs(groupsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
groupsActions.getUserGroupEntriesForWeek = async (groupId, userId, week) => {
    const eventsRef = collection(db, `groups/${groupId}/entries`);
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