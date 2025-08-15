'use client'

import { StudentCard } from "./StudentCard";
import { staffActions, useStaff } from "@/utils/store/useStaff";
import { Plug, Plus } from "lucide-react";
import { useEffect } from "react";

export default function StaffStudents() {
    const students = useStaff(state => state.students);
    const allStudents = useStaff(state => state.allStudents);

    useEffect(() => {
        staffActions.getMentoringStudents();
    }, []);

    const availableStudents = allStudents.filter(student => !students.some(s => s.id === student.id));

    return (
        <div className="flex flex-col gap-4">
            {students.length ? (
                <div className="flex flex-wrap gap-4">
                    {students.map((student) => (
                        <StudentCard key={student.id} student={student} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-stone-500 py-12">
                    אין לך חניכים בליווי אישי...
                </div>
            )}


            <div className="text-stone-500">
                {allStudents.length == 0 ? (
                    <button className="px-4 py-2 border border-stone-300 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors flex items-center gap-2"
                        onClick={() => staffActions.getAllStudents()}>
                        <Plus className="w-4 h-4" /> חניכים נוספים
                    </button>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {availableStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between border border-stone-300 p-2 cursor-pointer hover:bg-stone-200 transition-colors"
                                onClick={() => staffActions.addStudentToMentoring(student)}>
                                {student.firstName} {student.lastName}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
