'use client'

import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Staff_Students_List } from "./StaffGroup_Students";
import Button from "@/components/Button";
import WithLabel from "@/components/WithLabel";
import { adminActions, useAdmin } from "@/utils/store/useAdmin";
import { groupsActions } from "@/utils/store/useGroups";
import usePopper from "@/components/Popper";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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

export function AllStudentPicker({ unavailableStudents = [], onSelect }) {
    const classes = useAdmin(state => state.classes);
    const allMembers = useAdmin(state => state.allMembers);
    const {open, close, Popper, baseRef} = usePopper();

    const availableStudents = allMembers
        .filter(student => !unavailableStudents.some(s => s.student_id === student.id))
        .filter(student => student.role === 'student');

    return (
        <>
            <div className="text-stone-500" ref={baseRef}>
                <Button onClick={open}>
                    <Plus className="w-4 h-4" /> חניכים נוספים
                </Button>
            </div>

            <Popper>
                <Command>
                    <CommandInput placeholder="חפש חניכים" />
                    <CommandList>
                        <CommandEmpty>בחר חניכים</CommandEmpty>
                        {classes.map(group => (
                            <CommandGroup key={group.id} heading={group.name}>
                                {availableStudents.filter(student => student.groups.includes(group.id)).map(student => (
                                    <CommandItem key={student.id}
                                        onSelect={_ => onSelect(student)}
                                        value={student.first_name + ' ' + student.last_name}>
                                        {student.first_name} {student.last_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            ))}
                    </CommandList>
                </Command>
            </Popper>
        </>
    );
}