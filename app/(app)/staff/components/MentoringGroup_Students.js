import Events from "@/app/(app)/schedule/components/events/Events";
import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { useTime } from "@/utils/useTime";
import { groupsActions } from "@/utils/useGroups";
import { eventsActions } from "@/utils/useEvents";
import { useRouter } from "next/navigation";
import { userActions } from "@/utils/useUser";

export default function MentoringGroup_Students({ group }) {
    const router = useRouter();
    const [selectedStudent, setSelectedStudent] = useState(null)

    if (!group.students) return null;

    const onSelect = (student) => {
        setSelectedStudent(prev => prev && prev.id === student.id ? null : student);
    }

    const goToStudent = async (student) => {
        await userActions.switchToStudent(student.id, 'staff');
        router.push('/')
    }

    let displayStudents = group.students;
    if (group.type === 'class' || group.type === 'major') displayStudents = displayStudents.filter(student => student.roles.includes('student'));
    if (selectedStudent) {
        displayStudents = displayStudents.filter(student => student.id !== selectedStudent.id);
    }


    return (
        <div className="flex gap-4">
            {selectedStudent && (
                <div className="p-4 border border-gray-200" onClick={() => goToStudent(selectedStudent)}>
                    <div>{selectedStudent.firstName} {selectedStudent.lastName}</div>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {displayStudents
                    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'))
                    .map((student) => (
                        <StudentCard key={student.id}
                            student={student}
                            onSelect={() => onSelect(student)}
                            selected={selectedStudent && selectedStudent.id === student.id}
                        />
                    ))
                }
            </div>
        </div>
    );
}



function StudentSchedule({ student }) {
    const week = useTime(state => state.week);
    const [events, setEvents] = useState([]);
    useEffect(() => {
        if (!student || !week) return;
        (async () => {
            const studentEvents = await eventsActions.getUserEventsForWeek(student.id, week);
            for (const group of student.groups || []) {
                const studentGroupEvents = await groupsActions.getUserGroupEntriesForWeek(group, student.id, week);

                studentEvents.push(...studentGroupEvents.map(event => ({
                    ...event,
                    group: group,
                })));
            }
            setEvents(studentEvents)
        })();
    }, [student, week]);

    return (
        <Events
            events={events}
            edittable={false}
            week={week}
            withLabel={false}
        />
    )

}