'use client'

import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { SelectedStudentCard } from "./StaffGroup_Students";
import Button from "@/components/Button";
import usePopper from "@/components/Popper";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { timeActions, useTime } from "@/utils/store/useTime";
import WithLabel from "@/components/WithLabel";
import Avatar from "@/components/Avatar";
import { userActions } from "@/utils/store/useUser";

export default function StaffStudents() {
    const mentorships = useMentorships(state => state.mentorships);
    const projectMentorships = useMentorships(state => state.projectMentorships);
    const terms = useTime(state => state.terms);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        mentorshipsActions.getMentorships();
        timeActions.loadTerms();
    }, []);

    const onSelect = (student) => {
        mentorshipsActions.createMentorship(student, 'הנחייה חדשה');
    }

    const projectsByTerm = projectMentorships.reduce((acc, project) => {
        const term = terms.find(term => term.id === project.term?.[0])?.name || 'אחרת'
        if (!acc[term]) acc[term] = [];
        acc[term].push(project);
        return acc;
    }, {});

    const goToProject = (project) => {
        setSelectedStudent(project.student);
        // userActions.switchToStudent(project.student.id, '/project?id=' + project.id);
    }
    const goToStudent = (student) => {
        setSelectedStudent(student);
        // userActions.switchToStudent(student.id);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                {selectedStudent != null && <SelectedStudentCard student={selectedStudent} context="master" onClose={() => setSelectedStudent(null)} />}

                <div className="flex flex-col gap-4">
                    <GoToAnyStudentPicker />
                    <WithLabel label="חניכים בליווי אישי">
                        <div className="flex gap-2 flex-wrap">
                            {mentorships.length ? (
                                <>
                                    {mentorships.map(m => (
                                        <div key={m.student.id} className="flex flex-col gap-1 bg-muted p-2 rounded-md border border-border cursor-pointer hover:bg-primary-100 transition-colors hover:border-primary-200"
                                            onClick={() => goToStudent(m.student)}
                                        >
                                            <Avatar user={m.student} />
                                            <div className="text-xs text-muted-foreground">{m.student.first_name} {m.student.last_name}</div>
                                        </div>
                                    ))}
                                </>
                                // <Staff_Students_List students={mentorships.map(m => m.student)} context={'master'} />
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    אין לך חניכים בליווי אישי...
                                </div>
                            )}
                        </div>
                        <AllStudentPicker onSelect={onSelect} />
                    </WithLabel>

                    <div className="h-px border-b border-stone-300 w-full border-dashed my-4" />


                    {projectMentorships.length > 0 ? (
                        <>
                            {Object.keys(projectsByTerm).map(term => (
                                <WithLabel key={term} label={`פרויקטים בתקופת ה${term}`}>
                                    <div className="flex gap-2 flex-wrap">
                                        {projectsByTerm[term].map(project => (
                                            <div key={project.id} className="flex flex-col gap-1 bg-muted p-2 rounded-md border border-border cursor-pointer hover:bg-primary-100 transition-colors hover:border-primary-200"
                                                onClick={() => goToProject(project)}
                                            >
                                                <div className="text-sm">{project.title}</div>
                                                <div className="text-xs text-muted-foreground">{project.student.first_name} {project.student.last_name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </WithLabel>
                            ))}
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            אין לך חניכים בליווי פרויקט...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AllStudentPicker({ unavailableStudents = [], onSelect }) {
    const allStudents = useMentorships(state => state.allStudents);
    const { open, Popper, baseRef } = usePopper({
        onOpen: async () => {
            await mentorshipsActions.getAllStudents();
        }
    });

    // Filter out students who are already in mentorships
    const unavailableIds = unavailableStudents.map(s => s.id);
    const availableStudents = allStudents.filter(student => !unavailableIds.includes(student.id));

    return (
        <>
            <Button onClick={open} ref={baseRef} className='mt-4'>
                <Plus className="w-4 h-4" /> חניכים נוספים
            </Button>

            <Popper>
                <Command>
                    <CommandInput placeholder="חפש חניכים" />
                    <CommandList>
                        {availableStudents.length === 0 ? (
                            <CommandEmpty>טוען חניכים...</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {availableStudents.map(student => (
                                    <CommandItem key={student.id}
                                        onSelect={_ => onSelect(student)}
                                        value={student.first_name + ' ' + student.last_name}>
                                        {student.first_name} {student.last_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </Popper>
        </>
    );
}

export function GoToAnyStudentPicker() {
    const allStudents = useMentorships(state => state.allStudents);
    const { open, close, Popper, baseRef } = usePopper({
        onOpen: async () => {
            await mentorshipsActions.getAllStudents();
        }
    });

    const handleSelect = (student) => {
        close();
        userActions.switchToStudent(student.id);
    };

    return (
        <>
            <Button onClick={open} ref={baseRef} variant="outline">
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> חיפוש תלמיד להיות
                </div>
            </Button>

            <Popper>
                <Command>
                    <CommandInput placeholder="חפש תלמיד..." />
                    <CommandList>
                        {allStudents.length === 0 ? (
                            <CommandEmpty>טוען תלמידים...</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {allStudents.sort((a, b) => a.first_name.localeCompare(b.first_name)).map(student => (
                                    <CommandItem key={student.id}
                                        onSelect={_ => handleSelect(student)}
                                        value={student.first_name + ' ' + student.last_name}>
                                        {student.first_name} {student.last_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </Popper>
        </>
    );
}