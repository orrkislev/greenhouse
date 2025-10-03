import { tw } from "@/utils/tw";
import { getTimeString, useTime } from "@/utils/store/useTime";
import { useMeetings } from "@/utils/store/useMeetings";
import { ScheduleSection } from "../Layout";
import { useUser } from "@/utils/store/useUser";

const MeetingContainer = tw`flex flex-col items-center justify-center text-stone-800 text-xs p-2
    gap-2 divide-y divide-black/10 z-[10]
    bg-[#D5D2FD]
    `;

export default function Meetings() {
    const week = useTime((state) => state.week);
    const meetings = useMeetings();
    const user = useUser(state => state.user);

    const getOtherParticipant = (meeting) => {
        if (meeting.created_by === user.id) return meeting.other_participants[0].first_name + ' ' + meeting.other_participants[0].last_name;
        return meeting.created_by.first_name + ' ' + meeting.created_by.last_name;
    }

    return (
        <ScheduleSection name="פגישות" edittable={false}>
            {week.map((date, index) => (
                <MeetingContainer key={`meeting-${index}`} className={`pointer-events-none col-${index + 1}`}>
                    {meetings.filter(meeting => meeting.day_of_the_week === index + 1).map((meeting, i) => (
                        <div key={i} className="text-xs text-stone-700 text-center flex gap-2">
                            <div>{getTimeString(meeting.start)} - {getTimeString(meeting.end)}</div>
                            {getOtherParticipant(meeting)}
                        </div>
                    ))}
                </MeetingContainer>
            ))}
        </ScheduleSection>
    );
}


