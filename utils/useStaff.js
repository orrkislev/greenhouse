import { create } from "zustand";
import { useUser } from "./useUser";
import { collection, collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase/firebase";

export const useStaff = create((set) => ({
    students: [],

    getMentoringStudents: async () => {
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


        const allStudents = []
        while (studentsIDs.length > 0) {
            const first30 = studentsIDs.splice(0, 30);
            const students = await getDocs(query(collection(db, "users"), where("__name__", "in", first30)));
            allStudents.push(...students.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                projectId: projects.find(project => project.userId === doc.id)?.id
            })));
        }
        set({ students: allStudents });
    },
}));


export const staffActions = Object.fromEntries(
    Object.entries(useStaff.getState()).map(([key, value]) => [key, useStaff.getState()[key]])
);