import { StudentCard } from "./StudentCard";
import { useEffect, useState } from "react";
import { userActions } from "@/utils/store/useUser";
import Avatar from "@/components/Avatar";
import { eventsActions, eventSelectors, useRecurringEvents, useEventsData } from "@/utils/store/useEvents";
import { groupsActions, groupUtils, useGroups } from "@/utils/store/useGroups";
import { daysOfWeek, useTime } from "@/utils/store/useTime";
import Button from "@/components/Button";
import { UserRoundX, VenetianMask, Calendar, Pencil, CheckCircle, Circle, Plus } from "lucide-react";
import { mentorshipsActions } from "@/utils/store/useMentorships";
import WithLabel from "@/components/WithLabel";
import usePopper from "@/components/Popper";
import { EditMeeting } from "./StaffGroup_Meetings";
import { AllStudentPicker } from "./StaffStudents";
import { projectActions } from "@/utils/store/useProject";
import GroupTaskModal from "@/components/GroupTaskModal";
import { motion } from "motion/react";

export default function StaffGroup_Students({ group }) {
    if (!group.members) return null;

    const students = group.members.filter(member => member?.role === 'student');

    return (
        <div className="flex flex-col gap-4">
            <Staff_Students_List students={students} context={group.type} group={group} />
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

    const onSelect = (student) => {
        groupsActions.addMember(group.id, student);
    }

    return (
        <div className="flex flex-col md:block">
            <div className="md:float-right md:ml-4 mb-4 md:mb-0">
                {selectedStudent != null && <SelectedStudentCard student={selectedStudent} context={context} group={group} onClose={() => setSelectedStudent(null)} />}
            </div>

            <div className="flex flex-wrap gap-2">
                {students
                    .sort((a, b) => a.first_name.localeCompare(b.first_name, 'he'))
                    .map((student) => (
                        <StudentCard key={student.id}
                            student={student}
                            group={group}
                            onSelect={() => setSelectedStudent(student)}
                            selected={selectedStudent && selectedStudent.id === student.id}
                        />
                    ))
                }
            </div>
            {group.type === 'club' && <AllStudentPicker unavailableStudents={students} onSelect={onSelect} />}
        </div>
    )
}


export function SelectedStudentCard({ student, context, group, onClose }) {
    const [data, setData] = useState(null)
    const groups = useGroups(state => state.groups);
    const events = useEventsData(state => state.events);
    const today = useTime(state => state.today);

    useEffect(() => {
        setData({ ...student });
        (async () => {
            const userEvents = await eventsActions.getTodaysEventsForUser(student.id);
            const groupIds = groupUtils.getUserGroupIds(student);
            if (groupIds.length > 0) {
                await eventsActions.loadGroupEvents(groupIds, today, today);
            }
            const project = await projectActions.getProjectForStudent(student.id);
            setData({ ...student, events: userEvents, project: project.length > 0 ? project[0] : null });
        })()
    }, [student, today])

    const goToStudent = (student) => {
        userActions.switchToStudent(student);
    }

    if (!data) return null;

    const clickRemove = () => {
        if (context === 'club') {
            groupsActions.removeMember(group.id, data.id);
        } else {
            mentorshipsActions.deactivateMentorship(data);
        }
        if (onClose) onClose();
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

            <SelectedStudentCard_Tasks student={data} group={group} />

            <WithLabel label="פרויקט">
                {data.project ? (
                    <div className="text-xs">{data.project.title}</div>
                ) : <div className="text-xs text-muted-foreground">אין פרויקט </div>}
            </WithLabel>

            <WithLabel label="לוז היום">
                {data.events && data.events.scheduledEvents.length > 0 ? data.events.scheduledEvents.map(event => (
                    <div key={event.id} className="flex gap-3 items-center">
                        <div className="text-xs">{event.start.split(":").slice(0,2).join(":")}</div>
                        <div className="text-sm font-bold">{event.title}</div>
                    </div>
                )) : <div className="text-xs text-muted-foreground">אין אירועים היום</div>}
                {groups.filter(g => groupUtils.isMember(g, data)).map(group => {
                    const groupEvents = eventSelectors.getGroupEventsForDate(events, group.id, today);
                    return (
                        <div key={group.id} className="flex gap-3 items-center">
                            <div className="text-sm font-semibold">ב{group.name}</div>
                            {groupEvents.length > 0 ? groupEvents.map(event => (
                                <div key={event.id} className="flex gap-3 items-center">
                                    <div className="text-xs">ב{event.start}</div>
                                    <div className="text-sm">{event.title}</div>
                                </div>
                            )) : <div className="text-xs text-muted-foreground">אין אירועים היום</div>}
                        </div>
                    );
                })}
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

function SelectedStudentCard_Tasks({ student, group }) {
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
    const groups = useGroups(state => state.groups);
    const currentGroup = groups.find(g => g.id === group.id);
    const tasks = currentGroup?.tasks || [];

    const studentTasks = tasks.filter(t =>
        t.assigned_to?.length === 0 || !t.assigned_to || t.assigned_to.includes(student.id)
    );

    return (
        <WithLabel label="משימות">
            <div className="flex flex-col gap-1">
                {studentTasks.map(task => {
                    const done = task.completed_by?.includes(student.id);
                    return (
                        <div key={task.id} className="flex items-center gap-2 text-xs">
                            {done
                                ? <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                                : <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                            }
                            <span className={done ? 'line-through text-muted-foreground' : ''}>{task.title}</span>
                        </div>
                    );
                })}
                <button
                    onClick={() => setIsNewTaskOpen(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1 w-fit"
                >
                    <Plus className="w-3 h-3" /> משימה חדשה
                </button>
            </div>
            <GroupTaskModal task={null} group={group} isOpen={isNewTaskOpen} onClose={() => setIsNewTaskOpen(false)} initialAssignedTo={[student.id]} />
        </WithLabel>
    );
}

function SelectedStudentCard_Meeting({ student }) {
    const { open, close, Popper, baseRef } = usePopper();
    const events = useRecurringEvents();
    const meeting = events.find(event => event.day_of_the_week && event.participants?.find(participant => participant?.id === student.id || participant === student.id));

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