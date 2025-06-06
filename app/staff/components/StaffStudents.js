'use client'

import { useUser } from "@/utils/store/user";
import { StudentCard } from "./StudentCard";

export default function StaffStudents() {
    const user = useUser((state) => state.user);
    const students = user?.students || [];

    if (!students.length) {
        return (
            <div className="text-center text-gray-500 py-12">
                אין חניכים להצגה
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students.map((student) => (
                <StudentCard key={student.id} student={student} />
            ))}
        </div>
    );
}
