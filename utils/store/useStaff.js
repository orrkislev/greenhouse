import { create } from "zustand";
import { useUser } from "@/utils/store/useUser";
import { arrayRemove, arrayUnion, collection, collectionGroup, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/utils//firebase/firebase";

export const useStaff = create((set, get) => ({
    students: [],
    allStudents: [],

    getMentoringStudents: async () => {
        console.log('getMentoringStudents');
        const user = useUser.getState().user;
        if (!user.id || !user.roles.includes('staff')) return;
        const projectsQuery = query(
            collectionGroup(db, "projects"),
            where("master.id", "==", user.id),
            where("status", "==", "active")
        );
        const querySnapshot = await getDocs(projectsQuery);

        const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const studentsIDs = querySnapshot.docs.map(doc => doc.ref.parent.parent.id);
        if (user.students) studentsIDs.push(...user.students);
        console.log('user', user);
        console.log('studentsIDs', studentsIDs);

        let allStudents = []
        while (studentsIDs.length > 0) {
            const first30 = studentsIDs.splice(0, 30);
            const students = await getDocs(query(collection(db, "users"), where("__name__", "in", first30)));
            allStudents.push(...students.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                projectId: projects.find(project => project.userId === doc.id)?.id
            })));
        }
        allStudents = allStudents.filter(student => student.roles.includes('student'));

        set({ students: allStudents });
    },

    getAllStudents: async () => {
        if (get().allStudents.length > 0) return;
        const students = await getDocs(query(collection(db, "users"), where("roles", "array-contains", "student")));
        set({ allStudents: students.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    },

    addStudentToMentoring: async (student) => {
        const user = useUser.getState().user;
        if (!user.id || !user.roles.includes('staff')) return;
        await updateDoc(doc(db, "users", user.id), {students: arrayUnion(student.id)});
        set({ students: [...get().students, student] });
    },

    removeStudentFromMentoring: async (student) => {
        const user = useUser.getState().user;
        if (!user.id || !user.roles.includes('staff')) return;
        await updateDoc(doc(db, "users", user.id), { students: arrayRemove(student.id) });
        set({ students: get().students.filter(s => s.id !== student.id) });
    }
}));


export const staffActions = Object.fromEntries(
    Object.entries(useStaff.getState()).map(([key, value]) => [key, useStaff.getState()[key]])
);