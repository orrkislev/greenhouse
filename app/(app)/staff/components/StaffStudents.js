'use client'

import { groupsActions, useGroups } from "@/utils/store/useGroups";
import { staffActions, useStaff } from "@/utils/store/useStaff";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Staff_Students_List } from "./StaffGroup_Students";

export default function StaffStudents() {
    const students = useStaff(state => state.students);
    const allStudents = useStaff(state => state.allStudents);
    const groups = useGroups(state => state.groups);

    useEffect(() => {
        staffActions.getMentoringStudents();
    }, []);

    const loadAllStudents = async () => {
        await staffActions.getAllStudents();
        await groupsActions.loadAllGroups();
    }

    const availableStudents = allStudents.filter(student => !students.some(s => s.id === student.id));

    return (
        <div className="flex flex-col gap-4">
            {students.length ? (
                <Staff_Students_List students={students} context={'master'} />
            ) : (
                <div className="text-center text-stone-500 py-12">
                    אין לך חניכים בליווי אישי...
                </div>
            )}


            <div className="text-stone-500">
                {allStudents.length == 0 ? (
                    <button className="px-4 py-2 border border-stone-300 text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors flex items-center gap-2"
                        onClick={loadAllStudents}>
                        <Plus className="w-4 h-4" /> חניכים נוספים
                    </button>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {groups.filter(g => g.type === 'class').map(group => {
                            const studentsInGroup = availableStudents.filter(student => student.class === group.id);
                            if (studentsInGroup.length > 0) return (
                                <div key={group.id}>
                                    {group.name}
                                    <div className="flex gap-2 flex-wrap">
                                        {studentsInGroup.sort((a, b) => a.firstName.localeCompare(b.firstName)).map(student => (
                                            <div key={student.id} className="flex items-center justify-between border border-stone-300 p-2 cursor-pointer hover:bg-stone-200 transition-colors"
                                                onClick={() => staffActions.addStudentToMentoring(student)}
                                            >
                                                {student.firstName} {student.lastName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
