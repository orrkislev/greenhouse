'use client'

import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Staff_Students_List } from "./StaffGroup_Students";
import Button from "@/components/Button";
import WithLabel from "@/components/WithLabel";

export default function StaffStudents() {
    const mentorships = useMentorships(state => state.mentorships);
    const allStudents = useMentorships(state => state.allStudents);

    useEffect(() => {
        mentorshipsActions.getMentorships();
    }, []);

    const loadAllStudents = async () => {
        await mentorshipsActions.getAllStudents();
    }

    const availableStudents = allStudents.filter(student => !mentorships.some(s => s.student_id === student.id));

    return (
        <div className="flex flex-col gap-4">
            {mentorships.length ? (
                <Staff_Students_List students={mentorships.map(m => m.student)} context={'master'} />
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
                        <WithLabel label="כל החניכים">
                            <div className="flex gap-2 flex-wrap">
                                {availableStudents.sort((a, b) => a.first_name.localeCompare(b.first_name)).map(student => (
                                    <Button key={student.id} data-role="save" onClick={() => mentorshipsActions.createMentorship(student, 'הנחייה חדשה')} >
                                        {student.first_name} {student.last_name}
                                    </Button>
                                ))}
                            </div>
                        </WithLabel>
                    </div>
                )}
            </div>
        </div>
    );
}
