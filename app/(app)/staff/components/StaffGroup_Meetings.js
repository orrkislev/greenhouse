
import { ScheduleSection } from "@/app/(app)/schedule/components/Layout";
import Button from "@/components/Button";
import TimeRange from "@/components/TimeRange";
import { meetingsActions, meetingUtils, useMeetings } from "@/utils/store/useMeetings";
import { CalendarCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import usePopper from "@/components/Popper";

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

export default function StaffGroup_Meetings({ group }) {
    const meetings = useMeetings();

    if (!group.members) return null;
    const students = group.members.filter(member => member.role === 'student');

    const studentsWithMeetings = []
    const studentsWithoutMeetings = []
    students.forEach(student => {
        const meeting = meetings.find(m => meetingUtils.hasUser(m, student));
        if (meeting) studentsWithMeetings.push({ ...student, meeting: meeting });
        else studentsWithoutMeetings.push(student);
    });

    studentsWithMeetings.sort((a, b) => a.meeting.start - b.meeting.start);
    studentsWithoutMeetings.sort((a, b) => a.first_name.localeCompare(b.first_name));

    return (
        <div className={`p-4 border-t`}>
            <h4 className={`font-bold`}>שיחות אישיות</h4>

            <ScheduleSection withLabel={false}>
                <div className="bg-stone-100 px-2 py-1 text-sm">
                    חניכים ללא שיחה מתוכננת
                </div>
                {daysOfWeek.map((day, index) => (
                    <div key={day} className="bg-stone-100 text-sm flex items-center justify-center">
                        {day}
                    </div>
                ))}


                <div>
                    {studentsWithoutMeetings.map(student => (
                        <StudentMeetingSlot key={student.id} student={student} />
                    ))}
                </div>

                {daysOfWeek.map((day, index) => (
                    <div key={day} className="bg-stone-100 flex flex-col gap-2">
                        {studentsWithMeetings.filter(s => s.meeting?.day_of_the_week === index + 1).map(student => (
                            <StudentMeetingSlot key={student.id} student={student} meeting={student.meeting} />
                        ))}
                    </div>
                ))}
            </ScheduleSection>
        </div>
    );
}

const displayTime = time => time.split(':')[0] + ':' + time.split(':')[1]

function StudentMeetingSlot({ student, meeting }) {
    const { open, close, Popper, baseRef } = usePopper();

    return (
        <>
            <div className="bg-stone-200 px-2 py-1 border border-stone-300 flex gap-2 text-sm cursor-pointer hover:bg-stone-300 transition-colors"
                onClick={open}
                ref={baseRef}
            >
                <span className="">{student.first_name} {student.last_name}</span>
                {meeting && (
                    <span className="text-stone-600">
                        {displayTime(meeting.start)} - {displayTime(meeting.end)}
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
    const [time, setTime] = useState({ start: meeting ? meeting.start : '09:30', end: meeting ? meeting.end : '10:00' });
    const [day, setDay] = useState(meeting ? meeting.day_of_the_week : 1);

    const onDelete = () => {
        meetingsActions.deleteMeeting(meeting.id);
        onClose();
    }

    const onSave = () => {
        const formatTime = (time) => time.split(':')[0] + ':' + time.split(':')[1];
        if (meeting) {
            meetingsActions.updateMeeting(meeting.id, { start: formatTime(time.start), end: formatTime(time.end), day_of_the_week: day });
        } else {
            meetingsActions.createMeeting(student, day, formatTime(time.start), formatTime(time.end));
        }
        onClose();
    }

    return (
        <div className="flex flex-col gap-2">
            <h4 className="font-bold">שיחה עם {student.first_name}</h4>
            {!meeting && (
                <>
                    <p className="text-sm text-stone-600">אין שיחה מתוכננת כרגע.</p>
                    <p className="text-sm text-stone-600">ניתן לתאם שיחה חדשה עם החניך.</p>
                </>
            )}
            <TimeRange
                defaultValue={time}
                onUpdate={(newTime) => setTime(newTime)}
            />
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="border border-stone-300 rounded px-2 py-1 w-full">
                {daysOfWeek.map((day, index) => (
                    <option key={day} value={index + 1}>{day}</option>
                ))}
            </select>
            <div className="flex justify-end">
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