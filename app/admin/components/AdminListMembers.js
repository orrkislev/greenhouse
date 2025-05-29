import { db } from "@/utils/firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function AdminListMembers() {
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        (async () => {
            const membersCollection = collection(db, "users");
            let allMembers = await getDocs(membersCollection);
            allMembers = allMembers.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const studentsList = allMembers.filter(member => member.roles.includes('student'));
            const staffList = allMembers.filter(member => member.roles.includes('staff'));
            setStudents(studentsList);
            setStaff(staffList);
        })()
    }, [])

    return (
        <div>
            <h2 className="text-xl font-bold">List of Students ({students.length})</h2>
            <ul className="list-disc pl-5">
                {students.map(student => (
                    <li key={student.id} className="py-1">{student.name} ({student.email})</li>
                ))}
            </ul>
            <h2 className="text-xl font-bold mt-5">List of Staff ({staff.length})</h2>
            <ul className="list-disc pl-5">
                {staff.map(member => (
                    <li key={member.id} className="py-1">{member.firstName} {member.lastName}</li>
                ))}
            </ul>
        </div>
    );
}
