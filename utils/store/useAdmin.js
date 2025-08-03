import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { create } from "zustand"
import { db } from "@/utils/firebase/firebase";
import { createUser, deleteUser } from "@/utils/actions/admin actions";
import { projectTasksActions } from "@/utils/store/useProjectTasks";
import { format } from "date-fns";

export const useAdmin = create((set, get) => ({
    staff: [],
    groups: [],

    loadData: async () => {
        if (get().groups.length > 0) return;
        
        const groupsQuery = query(collection(db, "groups"), where("type", "==", 'class'));
        const snapshot = await getDocs(groupsQuery);
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const membersCollection = collection(db, "users");
        let allMembers = await getDocs(membersCollection);
        allMembers = allMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const studentsList = allMembers.filter(member => !member.roles || member.roles.includes('student'));
        const staffList = allMembers.filter(member => member.roles && member.roles.includes('staff'));
        groups.forEach(group => {
            group.students = studentsList.filter(student => student.class == group.id);
        });

        const majorsDoc = await getDoc(doc(db, 'school', 'majors'));
        const majors = majorsDoc.exists() ? majorsDoc.data().majors : [];

        set({
            staff: staffList,
            groups: groups,
            majors: majors,
        });
    },

    // ------------------------------
    // Users
    // ------------------------------
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
    createMember: async (memberData) => {
        await createUser(memberData.username, memberData.firstName, memberData.lastName);
        const memberRef = doc(db, "users", memberData.username);
        delete memberData.username;
        await updateDoc(memberRef, memberData);
        if (memberData.roles.includes('student')) {
            set(state => ({
                groups: state.groups.map(group => ({
                    ...group,
                    students: group.students.concat({ id: memberData.username, ...memberData })
                }))
            }));
        } else if (memberData.roles.includes('staff')) {
            set(state => ({
                staff: state.staff.concat({ id: memberData.username, ...memberData })
            }));
        }
    },
    deleteMember: async (member) => {
        await deleteUser(member.uid);
        await deleteDoc(doc(db, "users", member.id));
        set(state => ({
            staff: state.staff.filter(m => m.id !== member.id),
            groups: state.groups.map(group => ({ ...group, students: group.students.filter(student => student.id !== member.id) }))
        }));
    },

    // ------------------------------
    // Groups
    // ------------------------------
    assignMentorToClass: async (classId, mentorId) => {
        const group = get().groups.find(g => g.id === classId);
        if (!group) return;
        get().updateGroup(classId, { mentors: [...group.mentors, mentorId] });
        get().updateMember(mentorId, { class: classId });
    },
    removeMentorFromClass: async (classId, mentorId) => {
        const group = get().groups.find(g => g.id === classId);
        if (!group) return;
        get().updateGroup(classId, { mentors: group.mentors.filter(m => m !== mentorId) });
        get().updateMember(mentorId, { class: null });
    },
    createGroup: async (name, type, data = {}) => {
        const groupData = { name, type, open: false, mentors: [], ...data };
        const newDoc = await addDoc(collection(db, "groups"), groupData);
        groupData.id = newDoc.id;
        set(state => ({ groups: [...state.groups, groupData] }));
    },
    updateGroup: async (groupId, updates) => {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, updates);
        set(state => ({
            groups: state.groups.map(group => group.id === groupId ? { ...group, ...updates } : group)
        }));
    },


    // ------------------------------
    // Projects
    // ------------------------------
    loadProjects: async () => {
        const groups = get().groups;
        if (groups.flatMap(group => group.students).some(student => student.project)) return;
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
        const masterData = {
            id: master.id,
            firstName: master.firstName,
            lastName: master.lastName,
        }
        await updateDoc(studentRef, { master: masterData });
        set(state => ({
            groups: state.groups.map(group => ({
                ...group,
                students: group.students.map(student => {
                    if (student.id === studentId && student.projectId === projectId) {
                        return { ...student, project: { ...student.project, master: masterData } };
                    }
                    return student;
                })
            }))
        }));
        projectTasksActions.addTaskToStudentProject({
            title: 'לקבוע פגישה שבועית',
            description: `לקבוע פגישה שבועית עם ${master.firstName} ${master.lastName}`,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(new Date(), 'yyyy-MM-dd')
        }, studentId);
    },

    // ------------------------------
    // Majors
    // ------------------------------
    updateMajors: async (majors) => {
        await updateDoc(doc(db, 'school', 'majors'), { majors });
        set({ majors });
    },

    // ------------------------------
    // Messages
    // ------------------------------
    message: '',
    loadMessage: async () => {
        const message = await getDoc(doc(db,'school','messages'))
        set({ message: message.data().text });
    },
    updateMessage: async (text) => {
        await updateDoc(doc(db,'school','messages'), { text });
        set({ message: text });
    },
}));

export const adminActions = Object.fromEntries(
    Object.entries(useAdmin.getState()).filter(([key, value]) => typeof value === 'function')
);