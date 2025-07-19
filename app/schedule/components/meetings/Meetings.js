import { tw } from "@/utils/tw";
import { useWeek } from "@/app/schedule/utils/useWeek";
import { useMeetings } from "@/utils/useMeetings";
import { ScheduleSection } from "../Layout";
import { useUser } from "@/utils/useUser";

const MeetingContainer = tw`flex flex-col items-center justify-center text-gray-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD]
    `;

export default function Meetings() {
    const week = useWeek((state) => state.week);
    const meetings = useMeetings(state => state.meetings);
    const user = useUser(state => state.user);

    return (
        <ScheduleSection name="פגישות" edittable={false}>
            {week.map((date, index) => (
                <MeetingContainer key={`meeting-${index}`} className={`pointer-events-none col-${index + 1}`}>
                    {meetings.filter(meeting => meeting.day === index + 1).map((meeting, i) => (
                        <div key={i} className="text-xs text-gray-700 text-center flex gap-2">
                            <div>{meeting.start} - {meeting.end}</div>
                            {meeting.participants.filter(p => p !== user?.id).map((p, j) => (
                                <div key={j}>{p}</div>
                            ))}
                        </div>
                    ))}
                </MeetingContainer>
            ))}
        </ScheduleSection>
    );
}


