'use client'

import { StudentCard } from "./StudentCard";
import { useStaff } from "@/utils/store/useStaff";

export default function StaffStudents() {
    const students = useStaff(state => state.students);

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
