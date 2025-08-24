'use client'

import { groupsActions, useGroups } from "@/utils/store/useGroups";
import { staffActions, useStaff } from "@/utils/store/useStaff";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Staff_Students_List } from "./StaffGroup_Students";
import Button from "@/components/Button";
import WithLabel from "@/components/WithLabel";

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
                    <Button onClick={loadAllStudents}>
                        <Plus className="w-4 h-4" /> חניכים נוספים
                    </Button>
                ) : (
                    <div className="flex gap-4 flex-wrap">
                        {groups.filter(g => g.type === 'class').map(group => {
                            const studentsInGroup = availableStudents.filter(student => student.class === group.id);
                            if (studentsInGroup.length > 0) return (
                                <WithLabel key={group.id} label={group.name}>
                                    <div className="flex gap-2 flex-wrap">
                                        {studentsInGroup.sort((a, b) => a.firstName.localeCompare(b.firstName)).map(student => (
                                            <Button key={student.id} data-role="save" onClick={() => staffActions.addStudentToMentoring(student)} >
                                                {student.firstName} {student.lastName}
                                            </Button>
                                        ))}
                                    </div>
                                </WithLabel>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
