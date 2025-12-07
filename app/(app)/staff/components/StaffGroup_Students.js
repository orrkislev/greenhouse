import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { userActions } from "@/utils/store/useUser";
import Avatar from "@/components/Avatar";
import { eventsActions } from "@/utils/store/useEvents";
import { groupsActions, groupUtils, useGroups } from "@/utils/store/useGroups";
import { daysOfWeek, useTime } from "@/utils/store/useTime";
import Button from "@/components/Button";
import { UserRoundX, VenetianMask, Calendar, Pencil } from "lucide-react";
import { mentorshipsActions } from "@/utils/store/useMentorships";
import WithLabel from "@/components/WithLabel";
import usePopper from "@/components/Popper";
import { EditMeeting } from "./StaffGroup_Meetings";
import { meetingUtils, useMeetings } from "@/utils/store/useMeetings";
import { AllStudentPicker } from "./StaffStudents";
import { projectActions } from "@/utils/store/useProject";
import { motion } from "motion/react";

export default function StaffGroup_Students({ group }) {
    if (!group.members) return null;

    const students = group.members.filter(member => member.role === 'student');

    const onSelect = (student) => {
        groupsActions.addMember(group.id, student);
    }

    return (
        <div className="flex flex-col gap-4">
            <Staff_Students_List students={students} context={group.type} group={group} />
            {group.type === 'club' && <AllStudentPicker unavailableStudents={students} onSelect={onSelect} />}
        </div>
    )
}


export function Staff_Students_List({ students, context, group }) {
    const [selectedStudent, setSelectedStudent] = useState(null)

    useEffect(() => {
        if (students.length > 0) {
            setSelectedStudent(students.sort((a, b) => a.first_name.localeCompare(b.first_name, 'he'))[0])
        }
    }, [students])

    return (
        <div className="flex flex-col md:block">
            <div className="md:float-right md:ml-4 mb-4 md:mb-0">
                {selectedStudent != null && <SelectedStudentCard student={selectedStudent} context={context} group={group} />}
            </div>

            <div className="flex flex-wrap gap-2">
                {students
                    .sort((a, b) => a.first_name.localeCompare(b.first_name, 'he'))
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


function SelectedStudentCard({ student, context, group }) {
    const [data, setData] = useState(null)
    const groups = useGroups(state => state.groups);
    const today = useTime(state => state.today);

    useEffect(() => {
        setData({ ...student });
        (async () => {
            const events = await eventsActions.getTodaysEventsForUser(student.id);
            groupUtils.getUserGroupIds(student).forEach(groupId => groupsActions.loadGroupEvents(groupId, today, today));
            const project = await projectActions.getProjectForStudent(student.id);
            setData({ ...student, events, project });
        })()
    }, [student, today])

    const goToStudent = async (student) => {
        await userActions.switchToStudent(student.id, 'staff');
    }

    if (!data) return null;

    const clickRemove = () => {
        if (context === 'club') {
            groupsActions.removeMember(group.id, data.id);
        } else {
            mentorshipsActions.deleteMentorship(data);
        }
    }

    return (
        <motion.div key={student.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-muted p-4 md:p-6 border border-border flex flex-col gap-4 md:gap-6 justify-between">

            <div className="flex items-center gap-2">
                <Avatar user={data} className="w-12 h-12 md:w-16 md:h-16" />
                <div>
                    <div className="font-bold text-sm md:text-base">{data.first_name} {data.last_name}</div>
                    <div className="text-xs text-muted-foreground">
                        {context === 'class' ? groups.find(g => g.id === data.major)?.name : groups.find(g => g.id === data.class)?.name}
                    </div>
                </div>
            </div>
            <WithLabel label="פרויקט">
                {data.project ? (
                    <div className="text-xs">{data.project.title}</div>
                ) : <div className="text-xs text-muted-foreground">אין פרויקט </div>}
            </WithLabel>
            <WithLabel label="לוז היום">
                {data.events && data.events.length > 0 ? data.events.map(event => (
                    <div key={event.id} className="flex gap-3 items-center">
                        <div className="text-xs">ב{event.start}</div>
                        <div className="text-sm font-bold">{event.title}</div>
                    </div>
                )) : <div className="text-xs text-muted-foreground">אין אירועים היום</div>}
                {groups.filter(g => groupUtils.isMember(g, data)).map(group => (
                    <div key={group.id} className="flex gap-3 items-center">
                        <div className="text-sm font-semibold">ב{group.name}</div>
                        {group.events && group.events[today] && group.events[today].length > 0 ? group.events[today].map(event => (
                            <div key={event.id} className="flex gap-3 items-center">
                                <div className="text-xs">ב{event.start}</div>
                                <div className="text-sm">{event.title}</div>
                            </div>
                        )) : <div className="text-xs text-muted-foreground">אין אירועים היום</div>}
                    </div>
                ))}
            </WithLabel>

            <SelectedStudentCard_Meeting student={data} />

            <div className="flex flex-col md:flex-row gap-2">
                <Button data-role="edit" onClick={() => goToStudent(data)}>
                    להיות {data.first_name}
                    <VenetianMask className="w-4 h-4" />
                </Button>

                {(context === 'master' || context === 'club') && (
                    <Button data-role="delete" onClick={clickRemove}>
                        הסר
                        <UserRoundX className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </motion.div>
    )
}

function SelectedStudentCard_Meeting({ student }) {
    const { open, close, Popper, baseRef } = usePopper();
    const meetings = useMeetings(state => state.meetings);

    const meeting = meetings.find(meeting => meetingUtils.hasUser(meeting, student));

    return (
        <WithLabel label="פגישה קבועה" icon={Calendar}>
            <Button onClick={open} ref={baseRef}>
                {meeting && <div className="text-xs">ימי {daysOfWeek[meeting.day_of_the_week - 1]} בשעה {meeting.start.split(':')[0]}:{meeting.start.split(':')[1]}</div>}
                {!meeting && <div className="text-xs text-muted-foreground">אין פגישה קבועה</div>}
                <Pencil className="w-4 h-4" />
            </Button>
            <Popper>
                <EditMeeting student={student} meeting={meeting} onClose={close} />
            </Popper>
        </WithLabel>
    )
}