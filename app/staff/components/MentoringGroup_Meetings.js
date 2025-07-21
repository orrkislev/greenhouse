import { ScheduleEvents } from "@/app/schedule/components/events/Events";
import { ScheduleSection } from "@/app/schedule/components/Layout";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimeRangePicker from "@/components/ui/timerange-picker";
import { eventsActions } from "@/utils/useEvents";
import { meetingsActions, useMeetings } from "@/utils/useMeetings";
import { tasksActions } from "@/utils/useTasks";
import { useEffect, useState } from "react";

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];
export default function MentoringGroup_Meetings({ group, styles }) {
    const week = useWeek(state => state.week);
    const meetings = useMeetings(state => state.meetings);

    useEffect(() => {
        eventsActions.loadWeekEvents(week);
        tasksActions.loadWeekTasks(week);
        meetingsActions.loadMeetings();
    }, [week])

    const studentsWithMeetings = []
    const studentsWithoutMeetings = []
    if (!group.students) return null;
    group.students.map(student => {
        const meeting = meetings.find(m => m.participants.length == 2 && m.participants.includes(student.id));
        if (meeting) studentsWithMeetings.push({ ...student, meeting: meeting });
        else studentsWithoutMeetings.push(student);
    });

    studentsWithMeetings.sort((a, b) => a.meeting.start - b.meeting.start);
    studentsWithoutMeetings.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return (
        <div className={`p-4 border-t ${styles.border}`}>
            <h4 className={`font-bold ${styles.accent}`}>שיחות אישיות</h4>

            <ScheduleSection withLabel={false}>
                <div className="bg-gray-100 px-2 py-1 text-sm">
                    חניכים
                </div>
                {daysOfWeek.map((day, index) => (
                    <div key={day} className="bg-gray-100 text-sm flex items-center justify-center">
                        {day}
                    </div>
                ))}


                <div>
                    {studentsWithoutMeetings.map(student => (
                        <StudentNoMeetingSlot key={student.id} student={student} />
                    ))}
                </div>

                {daysOfWeek.map((day, index) => (
                    <div key={day} className="bg-gray-100 flex flex-col gap-2">
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
                <div className="bg-gray-200 px-2 py-1 border border-gray-300 flex gap-2 text-sm cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="">{student.firstName} {student.lastName}</span>
                    <span className="text-gray-600">אין שיחה מתוכננת</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold">שיחה עם {student.firstName}</h4>
                    <p className="text-sm text-gray-600">אין שיחה מתוכננת כרגע.</p>
                    <p className="text-sm text-gray-600">ניתן לתאם שיחה חדשה עם החניך.</p>
                    <div>
                        <label className="block text-sm mb-1">בחר יום:</label>
                        <select
                            value={day}
                            onChange={(e) => setDay(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
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
                                meetingsActions.createMeeting([student.id], day, time.start, time.end)
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
        console.log("Updating meeting time:", newTime);
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
                <div className="bg-gray-200 px-2 py-1 border border-gray-300 flex gap-2 text-sm cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="">{student.firstName} {student.lastName}</span>
                    <span className="text-gray-600">
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