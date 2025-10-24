'use client'

import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Staff_Students_List } from "./StaffGroup_Students";
import Button from "@/components/Button";
import WithLabel from "@/components/WithLabel";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";

export default function StaffStudents() {
    const mentorships = useMentorships(state => state.mentorships);

    useEffect(() => {
        mentorshipsActions.getMentorships();
    }, []);

    const onSelect = (student) => {
        mentorshipsActions.createMentorship(student, 'הנחייה חדשה');
    }

    return (
        <div className="flex flex-col gap-4">
            {mentorships.length ? (
                <Staff_Students_List students={mentorships.map(m => m.student)} context={'master'} />
            ) : (
                <div className="text-center text-stone-500 py-12">
                    אין לך חניכים בליווי אישי...
                </div>
            )}

            <AllStudentPicker onSelect={onSelect} />
        </div>
    );
}

export function AllStudentPicker({ unavailableStudents=[], onSelect }) {
    const classes = useAdmin(state => state.classes);
    const allMembers = useAdmin(state => state.allMembers);
    
    const loadAllStudents = async () => {
        await adminActions.loadData();
    }

    const availableStudents = allMembers
        .filter(student => !unavailableStudents.some(s => s.student_id === student.id))
        .filter(student => student.role === 'student');

    return (
        <div className="text-stone-500">
            {availableStudents.length == 0 ? (
                <Button onClick={loadAllStudents}>
                    <Plus className="w-4 h-4" /> חניכים נוספים
                </Button>
            ) : (
                <div className="flex gap-4 flex-wrap">
                    {classes.sort((a, b) => a.name.localeCompare(b.name, 'he')).map(cls => (
                        <WithLabel key={cls.id} label={cls.name}>
                            <div className="flex gap-2 flex-wrap">
                                {availableStudents
                                    .filter(student => student.groups.includes(cls.id))
                                    .sort((a, b) => a.first_name.localeCompare(b.first_name, 'he'))
                                    .map(student => (
                                    <Button key={student.id} data-role="save" onClick={() => onSelect(student)} >
                                        {student.first_name} {student.last_name}
                                    </Button>
                                ))}
                            </div>
                        </WithLabel>
                    ))}
                </div>
            )}
        </div>
    );
}
