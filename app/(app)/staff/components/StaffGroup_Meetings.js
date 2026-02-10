
import Button from "@/components/Button";
import { CalendarCheck, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import usePopper from "@/components/Popper";
import { eventsActions, useRecurringEvents } from "@/utils/store/useEvents";

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

const addMinutes = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const total = hours * 60 + mins + minutes;
    const nextHours = Math.floor(total / 60) % 24;
    const nextMins = total % 60;
    return `${String(nextHours).padStart(2, '0')}:${String(nextMins).padStart(2, '0')}`;
}

export default function StaffGroup_Meetings({ group }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const events = useRecurringEvents();

    if (!group.members) return null;
    const students = group.members.filter(member => member.role === 'student');

    const studentsWithMeetings = []
    const studentsWithoutMeetings = []
    students.forEach(student => {
        const meeting = events.find(e => e.participants && e.participants.includes(student.id));
        if (meeting) studentsWithMeetings.push({ ...student, meeting: meeting });
        else studentsWithoutMeetings.push(student);
    });

    studentsWithMeetings.sort((a, b) => a.meeting.start - b.meeting.start);
    studentsWithoutMeetings.sort((a, b) => a.first_name.localeCompare(b.first_name));

    return (
        <div className={`p-2 md:p-4 border-y`}>
            <div className="flex items-center gap-4" onClick={() => setIsCollapsed(!isCollapsed)}>
                <h4 className={`font-bold text-base md:text-lg`}>שיחות אישיות</h4>
                {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>

            {!isCollapsed && (
                <>
                    {/* Mobile view - single column */}
                    <div className="md:hidden flex flex-col gap-4">
                <div>
                    <div className="bg-muted px-2 py-1 text-sm font-semibold mb-2">
                        חניכים ללא שיחה מתוכננת
                    </div>
                    <div className="flex flex-col gap-2">
                        {studentsWithoutMeetings.map(student => (
                            <StudentMeetingSlot key={student.id} student={student} />
                        ))}
                    </div>
                </div>
                {daysOfWeek.map((day, index) => (
                    <div key={day}>
                        <div className="bg-muted px-2 py-1 text-sm font-semibold mb-2">
                            יום {day}
                        </div>
                        <div className="flex flex-col gap-2">
                            {studentsWithMeetings.filter(s => s.meeting?.day_of_the_week === index + 1).map(student => (
                                <StudentMeetingSlot key={student.id} student={student} meeting={student.meeting} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop view - grid */}
            <div className="hidden md:block">
                <div>
                    <div className="bg-muted px-2 py-1 text-sm">
                        חניכים ללא שיחה מתוכננת
                    </div>
                    {daysOfWeek.map((day, index) => (
                        <div key={day} className="bg-muted text-sm flex items-center justify-center">
                            {day}
                        </div>
                    ))}


                    <div>
                        {studentsWithoutMeetings.map(student => (
                            <StudentMeetingSlot key={student.id} student={student} />
                        ))}
                    </div>

                    {daysOfWeek.map((day, index) => (
                        <div key={day} className="bg-muted flex flex-col gap-2">
                            {studentsWithMeetings.filter(s => s.meeting?.day_of_the_week === index + 1).map(student => (
                                <StudentMeetingSlot key={student.id} student={student} meeting={student.meeting} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
                </>
            )}
        </div>
    );
}

const displayTime = time => time.split(':')[0] + ':' + time.split(':')[1]

function StudentMeetingSlot({ student, meeting }) {
    const { open, close, Popper, baseRef } = usePopper();

    return (
        <>
            <div className="bg-accent px-2 py-1 border border-border flex gap-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                onClick={open}
                ref={baseRef}
            >
                <span className="">{student.first_name} {student.last_name}</span>
                {meeting && (
                    <span className="text-muted-foreground">
                        {displayTime(meeting.start)}
                    </span>
                )}
            </div>
            <Popper>
                <EditMeeting student={student} meeting={meeting} onClose={close} />
            </Popper>
        </>
    );
}

export function EditMeeting({ student, meeting, onClose }) {
    const [startTime, setStartTime] = useState(meeting ? meeting.start : '09:30');
    const [day, setDay] = useState(meeting ? meeting.day_of_the_week : 1);

    const onDelete = () => {
        eventsActions.deleteEvent(meeting);
        onClose();
    }

    const onSave = () => {
        const formatTime = (time) => time.split(':')[0] + ':' + time.split(':')[1];
        const formattedStart = formatTime(startTime);
        const formattedEnd = addMinutes(formattedStart, 30);
        if (meeting) {
            eventsActions.saveEvent({
                id: meeting.id,
                start: formattedStart,
                end: formattedEnd,
                day_of_the_week: day,
                repeat_weekly: true,
                participants: [student.id],
            });
        } else {
            eventsActions.addEvent({
                title: 'פגישה',
                repeat_weekly: true,
                day_of_the_week: day,
                start: formattedStart,
                end: formattedEnd,
                participants: [student.id],
            });
        }
        onClose();
    }

    return (
        <div className="flex flex-col gap-2">
            <h4 className="font-bold text-base md:text-lg">שיחה עם {student.first_name}</h4>
            {!meeting && (
                <>
                    <p className="text-sm text-muted-foreground">אין שיחה מתוכננת כרגע.</p>
                    <p className="text-sm text-muted-foreground">ניתן לתאם שיחה חדשה עם החניך.</p>
                </>
            )}
            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="border border-border rounded px-2 py-1 w-full text-sm md:text-base">
                {daysOfWeek.map((day, index) => (
                    <option key={day} value={index + 1}>{day}</option>
                ))}
            </select>
            <div className="flex flex-col md:flex-row gap-2 md:justify-end">
                <Button onClick={onSave} data-role="save">
                    שמירה <CalendarCheck className="w-4 h-4" />
                </Button>
                {meeting && (
                    <Button onClick={onDelete} data-role="delete">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}