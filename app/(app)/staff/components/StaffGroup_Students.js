import Events from "@/app/(app)/schedule/components/events/Events";
import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { useTime } from "@/utils/store/useTime";
import { groupsActions } from "@/utils/store/useGroups";
import { eventsActions } from "@/utils/store/useEvents";
import { userActions } from "@/utils/store/useUser";
import Avatar from "@/components/Avatar";

export default function StaffGroup_Students({ group }) {
    const [selectedStudent, setSelectedStudent] = useState(null)

    if (!group.students) return null;

    const onSelect = (student) => {
        setSelectedStudent(prev => prev && prev.id === student.id ? null : student);
    }

    const goToStudent = async (student) => {
        await userActions.switchToStudent(student.id, 'staff');
        window.location.href = '/';
    }

    let displayStudents = group.students;
    if (group.type === 'class' || group.type === 'major') displayStudents = displayStudents.filter(student => student.roles.includes('student'));


    return (
        <div className="flex gap-4">
            {selectedStudent && (
                <div className="p-4 border border-stone-200 flex flex-col gap-2 cursor-pointer hover:bg-stone-100" onClick={() => goToStudent(selectedStudent)}>
                    <div className="flex items-center gap-2">
                        <Avatar user={selectedStudent} />
                        <div className="font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</div>
                    </div>
                    <div>מה יש לו היום</div>
                    <div>מה הפרויקט שלו והמשימות</div>
                    <div>איזה דברים הוא לומד</div>
                    <div className="text-xl">אפשר ללחוץ כאן</div>
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
                const studentGroupEvents = await groupsActions.getUserGroupEventsForWeek(group, student.id, week);

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