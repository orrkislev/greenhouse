import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { userActions } from "@/utils/store/useUser";
import Avatar from "@/components/Avatar";
import { eventsActions } from "@/utils/store/useEvents";
import { groupsActions, groupUtils, useGroups } from "@/utils/store/useGroups";
import { useTime } from "@/utils/store/useTime";
import Button from "@/components/Button";
import { UserRoundX, VenetianMask } from "lucide-react";
import { staffActions } from "@/utils/store/useStaff";
import WithLabel from "@/components/WithLabel";

export default function StaffGroup_Students({ group }) {
    if (!group.students) return null;

    let displayStudents = group.students;
    if (group.type === 'class' || group.type === 'major') displayStudents = displayStudents.filter(student => student.roles.includes('student'));

    return <Staff_Students_List students={displayStudents} context={group.type} />
}


export function Staff_Students_List({ students, context }) {

    const [selectedStudent, setSelectedStudent] = useState(students[0])



    return (
        <div className="">
            <div className="float-right ml-4">
                <SelectedStudentCard student={selectedStudent} context={context} />
            </div>

            <div className="flex flex-wrap gap-2">
                {students
                    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'))
                    .map((student) => (
                        <StudentCard key={student.id}
                            student={student}
                            onSelect={() => setSelectedStudent(student)}
                            selected={selectedStudent && selectedStudent.id === student.id}
                        />
                    ))
                }
            </div>
        </div>
    )
}

function SelectedStudentCard({ student, context }) {
    const [data, setData] = useState(null)
    const groups = useGroups(state => state.groups);
    const today = useTime(state => state.today);

    useEffect(() => {
        setData({ ...student });
        (async () => {
            const events = await eventsActions.getTodaysEventsForUser(student.id);
            groupUtils.getUserGroupIds(student).forEach(groupId => groupsActions.loadGroupEvents(groupId, today, today));
            setData({ ...student, events });
        })()
    }, [student, today])

    const goToStudent = async (student) => {
        await userActions.switchToStudent(student.id, 'staff');
    }

    if (!data) return null;


    return (
        <div className="p-6 border border-stone-200 flex flex-col gap-6 justify-between">
            <div className="flex items-center gap-2">
                <Avatar user={data} className="w-16 h-16" />
                <div>
                    <div className="font-bold">{data.firstName} {data.lastName}</div>
                    <div className="text-xs text-stone-500">
                        {context === 'class' ? groups.find(g => g.id === data.major)?.name : groups.find(g => g.id === data.class)?.name}
                    </div>
                </div>
            </div>
            <WithLabel label="לוז היום">
                {data.events && data.events.length > 0 ? data.events.map(event => (
                    <div key={event.id} className="flex gap-3 items-center">
                        <div className="text-xs">ב{event.start}</div>
                        <div className="text-sm font-bold">{event.title}</div>
                    </div>
                )) : <div className="text-xs text-stone-500">אין אירועים היום</div>}
                {groups.filter(g => groupUtils.isMember(g, data)).map(group => (
                    <div key={group.id} className="flex gap-3 items-center">
                        <div className="text-sm font-semibold">ב{group.name}</div>
                        {group.events && group.events[today] && group.events[today].length > 0 ? group.events[today].map(event => (
                            <div key={event.id} className="flex gap-3 items-center">
                                <div className="text-xs">ב{event.start}</div>
                                <div className="text-sm">{event.title}</div>
                            </div>
                        )) : <div className="text-xs text-stone-500">אין אירועים היום</div>}
                    </div>
                ))}
            </WithLabel>

            <div className="flex gap-2">
                <Button data-role="edit" onClick={() => goToStudent(data)}>
                    להיות {data.firstName}
                    <VenetianMask className="w-4 h-4" />
                </Button>

                {context === 'master' && (
                    <Button data-role="delete" onClick={() => staffActions.removeStudentFromMentoring(data)}>
                        הסר
                        <UserRoundX className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}