import { db } from "@/utils/firebase/firebase";
import { useUser } from "@/utils/useUser";
import { formatDate } from "@/utils/utils";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useStaffStudentsData() {
    const user = useUser((state) => state.user);
    const groups = user?.groups || [];

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const addStudents = async (newStudentsToAdd) => {
        const newStudents = newStudentsToAdd.filter(s1 => students.find(s2 => s2.id === s1.id) === undefined);
        if (newStudents.length === 0) return;

        setStudents((prevStudents) => {
            return [...prevStudents, ...newStudents];
        });
    }

    useEffect(() => {
        const studentsMissingEvents = students.filter(s => s.events === undefined || s.events.length === 0);
        if (studentsMissingEvents.length === 0) return;

        (async () => {
            const todayFormatted = formatDate(new Date());
            for (let i = 0; i < studentsMissingEvents.length; i++) {
                const student = studentsMissingEvents[i];
                const studentEventCollection = collection(db, 'users', student.id, 'events');
                const studentEventsQuery = query(studentEventCollection, where('date', '==', todayFormatted));
                const studentEventsSnapshot = await getDocs(studentEventsQuery);
                const studentEvents = studentEventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                student.events = studentEvents;
            }

            setStudents((prevStudents) => {
                return prevStudents.map(s => {
                    const updatedStudent = studentsMissingEvents.find(s1 => s1.id === s.id);
                    if (updatedStudent) return { ...s, events: updatedStudent.events };
                    return s;
                });
            })
        })();
    }, [students]);

    useEffect(() => {
        if (!groups) return
        const fetchData = async () => {
            if (groups.length > 0) {
                const q = query(collection(db, 'users'), where('className', 'in', groups));
                const usersSnapshot = await getDocs(q);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                addStudents(usersData);
            }
        }

        try {
            fetchData();
        } catch (error) {
            console.error("Error fetching groups or students:", error);
        } finally {
            setLoading(false);
        }
    }, [groups]);

    return { students, loading };
}
