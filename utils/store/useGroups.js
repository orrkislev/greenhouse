import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { db } from "@/utils//firebase/firebase";
import { useUser } from "@/utils/store/useUser";
import { dateRange, useTime } from "@/utils/store/useTime";
import { useEffect } from "react";

export const useGroups = create((set, get) => ({
    groups: [],
    loading: false,

    // ----------- Group Loading -----------
    // -------------------------------------
    loadGroups: async () => {
        if (get().loading) return;
        set({ loading: true });
        const groupIds = groupUtils.getUserGroupIds();
        await Promise.all(groupIds.map(groupId => get().loadGroup(groupId)));
        set({ loading: false });
    },
    loadAllGroups: async () => {
        if (get().loading) return;
        set({ loading: true });
        const groupsRef = collection(db, "groups");
        const snapshot = await getDocs(groupsRef);
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const currentGroups = get().groups;
        const onlyNewGroups = groups.filter(g => !currentGroups.find(g2 => g2.id === g.id));
        set({ groups: [...currentGroups, ...onlyNewGroups] });
        set({ loading: false });
    },
    loadGroup: async (groupId) => {
        const stateGroup = get().groups.find(g => g.id === groupId);
        if (stateGroup) return stateGroup;

        const groupDoc = await getDoc(doc(db, "groups", groupId));
        if (groupDoc.exists()) {
            const group = { ...groupDoc.data(), id: groupDoc.id };
            set((state) => ({ groups: [...state.groups, group] }));
            return group;
        }

        return null;
    },
    updateGroup: async (group, updates) => {
        const groupDocRef = doc(db, "groups", group.id);
        await updateDoc(groupDocRef, updates);
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...group, ...updates } : g) }));
    },

    // ----------- Group Events Management -----------
    // ------------------------------------------------
    updateWeek: async () => {
        const week = useTime.getState().week;
        if (!week || week.length === 0) return;
        for (const group of get().groups) {
            await get().loadGroupEvents(group.id, week[0], week[week.length - 1]);
        }
    },
    loadTodayEvents: async () => {
        const today = useTime.getState().today;
        const groups = get().groups;
        for (const group of groups) {
            await get().loadGroupEvents(group.id, today, today);
        }
    },
    loadGroupEvents: async (groupId, start, end) => {
        if (!groupId) return;

        let stateGroup = get().groups.find(g => g.id === groupId);
        if (!stateGroup) stateGroup = await get().loadGroup(groupId);

        const eventsRef = collection(db, 'groups', groupId, 'events');
        const newEvents = stateGroup.events ? { ...stateGroup.events } : {};
        await Promise.all(dateRange(start, end).map(async date => {
            if (newEvents[date]) return;
            const snapshot = await getDocs(query(eventsRef, where('date', '==', date)));
            const events = snapshot.docs.map(doc => ({ id: doc.id, group: groupId, ...doc.data() }));
            newEvents[date] = events;
        }));
        set((state) => ({ groups: state.groups.map(g => g.id === groupId ? { ...g, events: newEvents } : g) }));
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
        const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        const students = members.filter(m => m.roles.includes('student'));
        const mentors = members.filter(m => m.roles.includes('staff'));
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, students, mentors } : g) }));
    },

    // ----------- Group Tasks Management -----------
    // ----------------------------------------------
    loadGroupTasks: async (group) => {
        const user = useUser.getState().user;
        if (!user || !user.id) return;

        if (group.tasks) return;

        const tasksRef = collection(db, 'groups', group.id, 'tasks');
        const tasksQuery = query(tasksRef, where('active', '==', true));
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks } : g) }));
    },
    createGroupTask: async (group, task) => {
        const tasksRef = collection(db, 'groups', group.id, 'tasks');
        const newDoc = await addDoc(tasksRef, task);
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: [...g.tasks, { ...task, id: newDoc.id }] } : g) }));
    },
    updateGroupTask: async (group, task, updates) => {
        const taskDocRef = doc(db, 'groups', group.id, 'tasks', task.id);
        await updateDoc(taskDocRef, updates);
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? { ...t, ...updates } : t) } : g) }));
    },
    deleteGroupTask: async (group, task) => {
        const taskDocRef = doc(db, 'groups', group.id, 'tasks', task.id);
        await deleteDoc(taskDocRef);
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.filter(t => t.id !== task.id) } : g) }));
    },
    completeTask: async (group, task, userId) => {
        const taskDocRef = doc(db, 'groups', group.id, 'tasks', task.id);
        await updateDoc(taskDocRef, { completedBy: arrayUnion(userId) });
        task.completedBy = [...(task.completedBy || []), userId];
        set((state) => ({ groups: state.groups.map(g => g.id === group.id ? { ...g, tasks: g.tasks.map(t => t.id === task.id ? task : t) } : g) }));
    }
})
);

export const groupsActions = Object.fromEntries(
    Object.entries(useGroups.getState()).filter(([key, value]) => typeof value === 'function')
);
groupsActions.createGroupEvent = async (groupId, obj) => {
    const collectionRef = collection(db, 'groups', groupId, 'events');
    await addDoc(collectionRef, obj);
}
groupsActions.updateGroupEvent = (groupId, obj) => {
    const docRef = doc(db, 'groups', groupId, 'events', obj.id);
    return updateDoc(docRef, obj);
}
groupsActions.removeGroupEvent = (groupId, objId) => {
    const docRef = doc(db, 'groups', groupId, 'events', objId);
    return deleteDoc(docRef);
}
groupsActions.joinGroupEvent = (groupId, objId, userId) => {
    const docRef = doc(db, 'groups', groupId, 'events', objId);
    return updateDoc(docRef, { members: arrayUnion(userId) });
}
groupsActions.leaveGroupEvent = (groupId, objId, userId) => {
    const docRef = doc(db, 'groups', groupId, 'events', objId);
    return updateDoc(docRef, { members: arrayRemove(userId) });
}
groupsActions.getAllGroups = async () => {
    const groupsRef = collection(db, "groups");
    const snapshot = await getDocs(groupsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
groupsActions.getUserGroupEventsForWeek = async (groupId, userId, week) => {
    const eventsRef = collection(db, `groups/${groupId}/events`);
    const eventsQuery = query(eventsRef,
        where("date", ">=", week[0]),
        where("date", "<=", week[week.length - 1]),
        where("members", "array-contains", userId)
    );
    const eventsSnap = await getDocs(eventsQuery);
    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return events;
}


export const groupUtils = {
    isMentor: (group, user) => {
        if (!user) user = useUser.getState().user;
        if (!user.roles.includes('staff')) return false;
        if (group.type === 'class') return user.class === group.id;
        if (group.type === 'major') return user.major === group.id;
        return false;
    },
    isMember: (group, user) => {
        if (!user) user = useUser.getState().user;
        return (group.type === 'class' && user.class === group.id) ||
            (group.type === 'major' && user.major === group.id) ||
            (group.type === 'staff' && user.roles.includes('staff'));
    },
    isGroupEventMember: (event, user) => {
        if (!user) user = useUser.getState().user;
        return event.members && event.members.includes(user.id);
    },

    getUserGroupIds: (user) => {
        if (!user) user = useUser.getState().user;
        if (!user.id) return [];
        const groups = []
        if (user.roles.includes('staff')) groups.push('צוות');
        if (user.class) groups.push(user.class);
        if (user.major) groups.push(user.major);
        return groups;
    }
}

export const useMemberGroups = () => {
    const groups = useGroups(state => state.groups);
    useEffect(() => {
        groupsActions.loadGroups()
    }, [])
    return groups.filter(g => groupUtils.isMember(g, useUser.getState().user));
}
export const useMentorGroups = () => {
    const groups = useGroups(state => state.groups);
    useEffect(() => {
        groupsActions.loadGroups()
    }, [])
    const mentoring = groups.filter(g => groupUtils.isMentor(g, useUser.getState().user));
    return mentoring;
}
export const useInvolvedGroups = () => {
    const groups = useGroups(state => state.groups);
    useEffect(() => {
        groupsActions.loadGroups()
    }, [])
    return groups.filter(g => groupUtils.isMember(g, useUser.getState().user) || groupUtils.isMentor(g, useUser.getState().user));
}