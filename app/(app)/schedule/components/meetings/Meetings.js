import { tw } from "@/utils/tw";
import { getTimeString, useTime } from "@/utils/store/useTime";
import { useMeetings, meetingsActions } from "@/utils/store/useMeetings";
import { ScheduleSection } from "../Layout";
import { isStaff, userActions } from "@/utils/store/useUser";
import Button from "@/components/Button";
import { CalendarCheck, Edit2, UserRound } from "lucide-react";
import usePopper from "@/components/Popper";
import TimeRange from "@/components/TimeRange";
import { useState } from "react";
import { mentorshipsActions, useMentorships } from "@/utils/store/useMentorships";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const MeetingContainer = tw`flex flex-col items-center justify-center text-foreground text-xs p-2
    gap-1 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD] group/meeting-container
    `;

export default function Meetings() {
    const week = useTime((state) => state.week);
    const meetings = useMeetings();


    return (
        <ScheduleSection name="פגישות" edittable={false}>
            {week.map((date, index) => (
                <MeetingContainer key={`meeting-${index}`} className={`col-${index + 1}`}>
                    {meetings.filter(meeting => meeting.day_of_the_week === index + 1).map((meeting) => (
                        <Meeting key={meeting.id} meeting={meeting} />
                    ))}
                    {isStaff() && <NewMeetingButton dayOfWeek={index + 1} />}
                </MeetingContainer>
            ))}
        </ScheduleSection>
    );
}

const getOtherParticipant = (meeting) => {
    if (!meeting.other_participants || meeting.other_participants.length === 0) return null;
    return meeting.other_participants?.[0];
}

function Meeting({ meeting }) {
    const student = getOtherParticipant(meeting);
    const { open, close, Popper, baseRef } = usePopper();

    if (!student) return null;

    const handleGoToStudent = (e) => {
        e.stopPropagation();
        if (isStaff()) {
            userActions.switchToStudent(student);
        }
    }

    return (
        <>
            <div ref={baseRef} className="w-full relative text-xs text-foreground text-center px-2 py-1 transition-colors group/meeting">

                {isStaff() && (
                    <div className="flex justify-between w-full">
                        <Edit2 onClick={open}
                            className='p-1 rounded-lg w-6 h-0 group-hover/meeting:h-6 transition-all duration-300 hover:bg-white cursor-pointer' />
                        <UserRound onClick={handleGoToStudent}
                            className='p-1 rounded-lg w-6 h-0 group-hover/meeting:h-6 transition-all duration-300 hover:bg-white cursor-pointer' />
                    </div>
                )}

                <div>{getTimeString(meeting.start)} {" - "}
                    <span className="font-semibold">{student.first_name} {student.last_name}</span>
                </div>
            </div>

            <Popper>
                <EditMeeting meeting={meeting} student={student} onClose={close} />
            </Popper>
        </>
    )
}

const daysOfWeek = ['א', 'ב', 'ג', 'ד', 'ה'];

function EditMeeting({ meeting, student, onClose }) {
    const [time, setTime] = useState({ start: meeting.start, end: meeting.end });
    const [day, setDay] = useState(meeting.day_of_the_week);

    const onDelete = () => {
        meetingsActions.deleteMeeting(meeting.id);
        onClose();
    }

    const onSave = () => {
        const formatTime = (time) => time.split(':').slice(0, 2).join(':');
        meetingsActions.updateMeeting(meeting.id, {
            start: formatTime(time.start),
            end: formatTime(time.end),
            day_of_the_week: day
        });
        onClose();
    }

    return (
        <div className="flex flex-col gap-2">
            <h4 className="font-bold text-base md:text-lg">שיחה עם {student.first_name} {student.last_name}</h4>
            <TimeRange
                defaultValue={time}
                onUpdate={(newTime) => setTime(newTime)}
            />
            <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="border border-border rounded px-2 py-1 w-full text-sm md:text-base"
            >
                {daysOfWeek.map((dayName, index) => (
                    <option key={dayName} value={index + 1}>יום {dayName}</option>
                ))}
            </select>
            <div className="flex flex-col md:flex-row gap-2 md:justify-end">
                <Button onClick={onSave} data-role="save">
                    שמירה <CalendarCheck className="w-4 h-4" />
                </Button>
                <Button onClick={onDelete} data-role="delete" variant="destructive">
                    מחיקה
                </Button>
            </div>
        </div>
    )
}

function NewMeetingButton({ dayOfWeek }) {
    const { open, close, Popper, baseRef } = usePopper({
        onOpen: async () => {
            await mentorshipsActions.getAllStudents();
        }
    });

    return (
        <>
            <div onClick={open} ref={baseRef} className="w-full h-0 cursor-pointer hover:bg-muted rounded-md flex items-center justify-center group-hover/meeting-container:h-4 overflow-hidden  transition-all duration-300">
                +
            </div>
            <Popper>
                <NewMeetingForm onClose={close} dayOfWeek={dayOfWeek} />
            </Popper>
        </>
    )
}

function NewMeetingForm({ onClose, dayOfWeek }) {
    const allStudents = useMentorships(state => state.allStudents);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [time, setTime] = useState({ start: '09:30', end: '10:00' });
    const [day, setDay] = useState(dayOfWeek);

    const onSave = () => {
        if (!selectedStudent) return;

        const formatTime = (time) => time.split(':').slice(0, 2).join(':');
        meetingsActions.createMeeting(
            selectedStudent,
            day,
            formatTime(time.start),
            formatTime(time.end)
        );
        onClose();
    }

    return (
        <div className="flex flex-col gap-2">
            <h4 className="font-bold text-base md:text-lg">פגישה חדשה</h4>

            {!selectedStudent ? (
                <Command>
                    <CommandInput placeholder="חפש חניך..." />
                    <CommandList>
                        {allStudents.length === 0 ? (
                            <CommandEmpty>טוען חניכים...</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                {allStudents.map(student => (
                                    <CommandItem
                                        key={student.id}
                                        onSelect={() => setSelectedStudent(student)}
                                        value={`${student.first_name} ${student.last_name}`}
                                    >
                                        {student.first_name} {student.last_name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            ) : (
                <>
                    <div className="text-sm">
                        חניך: <span className="font-semibold">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="mr-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            שנה
                        </button>
                    </div>

                    <TimeRange
                        defaultValue={time}
                        onUpdate={(newTime) => setTime(newTime)}
                    />

                    <select
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="border border-border rounded px-2 py-1 w-full text-sm md:text-base"
                    >
                        {daysOfWeek.map((dayName, index) => (
                            <option key={dayName} value={index + 1}>יום {dayName}</option>
                        ))}
                    </select>

                    <div className="flex flex-col md:flex-row gap-2 md:justify-end">
                        <Button onClick={onSave} data-role="save">
                            שמירה <CalendarCheck className="w-4 h-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}