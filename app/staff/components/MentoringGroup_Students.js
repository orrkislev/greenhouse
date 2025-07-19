import Events from "@/app/schedule/components/events/Events";
import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { getUserEventsForWeek, getUserGroupEntriesForWeek } from "@/app/schedule/utils/firebase actions";

export default function MentoringGroup_Students({ group, mode, styles }) {
    const [selectedStudent, setSelectedStudent] = useState(null)

    if (!group.students) return null;

    const onSelect = (student) => {
        setSelectedStudent(prev => prev && prev.id === student.id ? null : student);
    }

    return (
        <>
            <div className="p-4">
                <div className="flex flex-wrap gap-2">
                    {group.students
                        .sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'))
                        .map((student) => (
                            <StudentCard
                                key={student.id}
                                student={student}
                                mode={mode}
                                styles={styles}
                                onSelect={() => onSelect(student)}
                            />
                        ))
                    }
                </div>
            </div>

            {selectedStudent && (
                <div className="p-4 border-t">
                    <StudentSchedule student={selectedStudent} />
                </div>
            )}
        </>
    );
}



function StudentSchedule({ student }) {
    const week = useWeek(state => state.week);
    const [events, setEvents] = useState([]);
    useEffect(() => {
        if (!student || !week) return;
        (async () => {
            const studentEvents = await getUserEventsForWeek(student.id, week);
            for (const group of student.groups || []) {
                const studentGroupEvents = await getUserGroupEntriesForWeek(group, student.id, week);

                studentEvents.push(...studentGroupEvents.map(event => ({
                    ...event,
                    start: event.timeRange.start,
                    end: event.timeRange.end,
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