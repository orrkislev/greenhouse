import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { db } from "./firebase/firebase";
import { createUser, deleteUser } from "@/utils/admin actions";

export const useAdmin = create((set, get) => ({
    staff: [],
    groups: [],

    initialize: async () => {
        const groupsQuery = query(collection(db, "groups"), where("type", "==", 'class'));
        const snapshot = await getDocs(groupsQuery);
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const membersCollection = collection(db, "users");
        let allMembers = await getDocs(membersCollection);
        allMembers = allMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
        const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
        console.log({ groups, studentsList, staffList });
        groups.forEach(group => {
            group.students = studentsList.filter(student => student.className == group.id);
            group.mentors = group.mentors.map(mentorId => staffList.find(staff => staff.id === mentorId)).filter(Boolean);
        });

        set({
            staff: staffList,
            groups: groups,
        });
    },
    updateMember: async (memberId, updates) => {
        const memberRef = doc(db, "users", memberId);
        await updateDoc(memberRef, updates);
        set(state => ({
            staff: state.staff.map(member => member.id === memberId ? { ...member, ...updates } : member),
            groups: state.groups.map(group => ({
                ...group,
                students: group.students.map(student => student.id === memberId ? { ...student, ...updates } : student)
            }))
        }));
    },

    createStudent: async (firstName, lastName, username, group) => {
        try {
            await createUser(username, firstName, lastName);
            const userDocRef = doc(db, 'users', username);
            const userData = { firstName, lastName, className: group, groups: [group], roles: ['student'] };
            updateDoc(userDocRef, userData);
            set(state => ({
                groups: state.groups.map(g => {
                    g.students = (g.students || []).concat({ id: username, ...userData });
                    return g;
                }),
            }));
            return;
        } catch (error) {
            return error;
        }
    },
    createStaff: async (firstName, lastName, username, job) => {
        try {
            await createUser(username, firstName, lastName);
            const userDocRef = doc(db, 'users', username);
            updateDoc(userDocRef, {
                firstName,
                lastName,
                job,
                roles: ['staff'],
            });
            set(state => ({
                staff: [...state.staff, { id: userDocRef.id, firstName, lastName, username, job, roles: ['staff'] }]
            }));
            return
        } catch (error) {
            return error.message;
        }
    },
    removeMember: async (memberId, username) => {
        await deleteUser(memberId);
        await deleteDoc(doc(db, 'users', username));
        set(state => ({
            staff: state.staff.filter(member => member.id !== username),
            groups: state.groups.map(group => ({
                ...group,
                students: group.students.filter(student => student.id !== username)
            }))
        }));
    },

    addMentorToGroup: async (groupId, mentorId) => {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, { mentors: arrayUnion(mentorId) });
        const staffMember = useAdmin.getState().staff.find(mentor => mentor.id === mentorId);
        if (staffMember) {
            set(state => ({
                groups: state.groups.map(group => {
                    if (group.id === groupId) group.mentors.push(staffMember);
                    return group;
                })
            }));
        }
    },
    removeMentorFromGroup: async (groupId, mentorId) => {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, { mentors: arrayRemove(mentorId) });
        set(state => ({
            groups: state.groups.map(group => {
                if (group.id === groupId) group.mentors = group.mentors.filter(mentor => mentor.id !== mentorId);
                return group;
            })
        }));
    },

    createClass: async (name, year) => {
        const groupData = { name, year, type: 'class', open: false, mentors: [] };
        const newDoc = await addDoc(collection(db, "groups"), groupData);
        groupData.id = newDoc.id;
        set(state => ({ groups: [...state.groups, groupData] }));
    },
    updateClass: async (classId, updates) => {
        const classRef = doc(db, "groups", classId);
        await updateDoc(classRef, updates);
        set(state => ({
            groups: state.groups.map(group => group.id === classId ? { ...group, ...updates } : group)
        }));
    },


    loadProjects: async () => {
        const groups = get().groups;
        if (groups.flatMap(group => group.students).some(student => student.project)) return
        for (const group of groups) {
            const studentsWithProjectIds = group.students.filter(student => student.projectId);
            for (const student of studentsWithProjectIds) {
                const projectRef = doc(db, "users", student.id, "projects", student.projectId);
                const projectSnapshot = await getDoc(projectRef);
                if (projectSnapshot.exists()) {
                    const projectData = projectSnapshot.data();
                    set(state => ({
                        groups: state.groups.map(g => {
                            if (g.id === group.id) {
                                g.students = g.students.map(s => s.id === student.id ? { ...s, project: projectData } : s);
                            }
                            return g;
                        })
                    }));
                }
            }
        }
    },
    assignMasterToProject: async (studentId, projectId, master) => {
        const studentRef = doc(db, "users", studentId, "projects", projectId);
        await updateDoc(studentRef, { master });
        set(state => ({
            groups: state.groups.map(group => ({
                ...group,
                students: group.students.map(student => {
                    if (student.id === studentId && student.projectId === projectId) {
                        return { ...student, project: { ...student.project, master } };
                    }
                    return student;
                })
            }))
        }));
    },
}));

export const adminActions = Object.fromEntries(
    Object.entries(useAdmin.getState()).filter(([key, value]) => typeof value === 'function')
);