
import { ScheduleSection } from "@/app/(app)/schedule/components/Layout";
import Button, { IconButton } from "@/components/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { meetingsActions, useMeetings } from "@/utils/store/useMeetings";
import { X } from "lucide-react";
import { useState } from "react";

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

export default function StaffGroup_Meetings({ group }) {
    const meetings = useMeetings();

    const studentsWithMeetings = []
    const studentsWithoutMeetings = []
    if (!group.students) return null;
    group.students.map(student => {
        const meeting = meetings.find(m => m.student === student.id);
        if (meeting) studentsWithMeetings.push({ ...student, meeting: meeting });
        else studentsWithoutMeetings.push(student);
    });

    studentsWithMeetings.sort((a, b) => a.meeting.start - b.meeting.start);
    studentsWithoutMeetings.sort((a, b) => a.firstName.localeCompare(b.firstName));

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
                        <StudentNoMeetingSlot key={student.id} student={student} />
                    ))}
                </div>

                {daysOfWeek.map((day, index) => (
                    <div key={day} className="bg-stone-100 flex flex-col gap-2">
                        {studentsWithMeetings.filter(s => s.meeting?.day === index + 1).map(student => (
                            <StudentMeetingSlot key={student.id} student={student} meeting={student.meeting} />
                        ))}
                    </div>
                ))}
            </ScheduleSection>
        </div>
    );
}

function StudentNoMeetingSlot({ student }) {
    const [isOpen, setIsOpen] = useState(false);
    const [time, setTime] = useState({ start: '09:30', end: '10:00' });
    const [day, setDay] = useState(0);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="bg-stone-200 px-2 py-1 border border-stone-300 flex gap-2 text-sm cursor-pointer hover:bg-stone-300 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="">{student.firstName} {student.lastName}</span>
                    <span className="text-stone-600"></span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold">שיחה עם {student.firstName}</h4>
                    <p className="text-sm text-stone-600">אין שיחה מתוכננת כרגע.</p>
                    <p className="text-sm text-stone-600">ניתן לתאם שיחה חדשה עם החניך.</p>
                    <div>
                        <label className="block text-sm mb-1">בחר יום:</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(Number(e.target.value))}
                            className="border border-stone-300 rounded px-2 py-1 w-full"
                        >
                            {Array.from({ length: 5 }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {daysOfWeek[i]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <TimeRangePicker
                        value={time}
                        onChange={(newTime) => setTime(newTime)}
                    />
                    <div className="flex justify-end">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            onClick={() => {
                                meetingsActions.createMeeting(student, day, time.start, time.end)
                                setIsOpen(false);
                            }}
                        >
                            תאם שיחה
                        </button>
                        <button
                            className="ml-2 text-red-500 hover:underline"
                            onClick={() => setIsOpen(false)}
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}


function StudentMeetingSlot({ student, meeting }) {
    const [isOpen, setIsOpen] = useState(false)

    const onTimeChange = (newTime) => {
        meetingsActions.updateMeeting(meeting.id, {
            start: newTime.start,
            end: newTime.end,
        });
        // setIsOpen(false);
    }
    const onDelete = () => {
        meetingsActions.deleteMeeting(meeting.id);
        // setIsOpen(false);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="bg-stone-200 px-2 py-1 border border-stone-300 flex gap-2 text-sm cursor-pointer hover:bg-stone-300 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="">{student.firstName} {student.lastName}</span>
                    <span className="text-stone-600">
                        {daysOfWeek[meeting.day]} {meeting.start} - {meeting.end}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold">שיחה עם {student.firstName}</h4>
                    <TimeRangePicker
                        value={{ start: meeting.start, end: meeting.end }}
                        onChange={onTimeChange}
                    />
                    <div className="flex justify-end">
                        <button className="text-red-500 hover:underline" onClick={onDelete}>
                            מחיקת שיחה
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function EditMeeting({ student, meeting, onClose }) {
    const [time, setTime] = useState({ start: meeting ? meeting.start : '09:30', end: meeting ? meeting.end : '10:00' });
    const [day, setDay] = useState(meeting ? meeting.day : 1);

    const onTimeChange = (newTime) => {
        setTime(newTime);
    }

    const onDelete = () => {
        meetingsActions.deleteMeeting(meeting.id);
        onClose();
    }

    const onSave = () => {
        if (meeting) {
            meetingsActions.updateMeeting(meeting.id, { start: time.start, end: time.end, day: day });
        } else {
            meetingsActions.createMeeting(student, day, time.start, time.end);
        }
        onClose();
    }

    return (
        <div className="flex flex-col gap-2 relative pt-8 p-2 border border-stone-300 rounded">
            <h4 className="font-bold">שיחה עם {student.firstName}</h4>
            <TimeRangePicker
                value={time}
                onChange={onTimeChange}
            />
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="border border-stone-300 rounded px-2 py-1 w-full">
                {daysOfWeek.map((day, index) => (
                    <option key={day} value={index + 1}>{day}</option>
                ))}
            </select>
            <div className="flex justify-end">
                <Button onClick={onSave}>
                    שמירה
                </Button>
                {meeting && (
                    <Button onClick={onDelete}>
                        מחיקת שיחה
                    </Button>
                )}
            </div>
            <IconButton icon={X} onClick={onClose} className="absolute top-2 right-2" />
        </div>
    )
}