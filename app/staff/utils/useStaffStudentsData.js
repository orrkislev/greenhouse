import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { format } from "date-fns";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useStaffStudentsData() {
    const groups = useUser(state => state.user?.groups);

    const [students, setStudents] = useState([]);

    const addStudents = async (newStudentsToAdd) => {
        const newStudents = newStudentsToAdd.filter(s1 => students.find(s2 => s2.id === s1.id) === undefined);
        if (newStudents.length === 0) return;

        for (const student of newStudents) {
            console.log("Adding student:", student);
            const collectionRef = collection(db, "users", student.id, "events");
            const todayDate = format(new Date(), "yyyy-MM-dd");
            const eventsQuery = query(collectionRef, where("date", "==", todayDate));
            const eventsSnapshot = await getDocs(eventsQuery);
            const events = eventsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            student.events = events;
        }

        setStudents((prevStudents) => {
            return [...prevStudents, ...newStudents];
        });
    }

    useEffect(() => {
        console.log("Fetching students for groups:", groups);
        if (!groups || groups.length === 0) {
            return;
        }
        
        (async () => {
            const allStudents = [];
            for (const group of groups) {
                const groupQuery = query(
                    collection(db, "users"),
                    where("className", "==", group),
                );

                const groupSnapshot = await getDocs(groupQuery);
                const groupStudents = groupSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                allStudents.push(...groupStudents);
            }

            await addStudents(allStudents);
        })();
    }, [groups]);

    return { students };
}
