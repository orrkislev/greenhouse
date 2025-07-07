import { useUser } from "@/utils/store/user";
import { useEffect, useRef, useState } from "react";
import { getGroupData, getGroupSchedule, isGroupAdmin, updateGroupSchedule } from "./groupschedule actions";
import { ScheduleSection } from "../Layout";
import { tw } from "@/utils/tw";
import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { formatDate } from "@/utils/utils";

export default function OtherSchedules() {
    const groups = useUser(state => state.user.groups);
    
    return groups.map((group, index) => (
        <GroupSchedule key={index} groupName={group} />
    ));
}




function GroupSchedule({ groupName }) {
    const userId = useUser(state => state.user.id);
    const [groupData, setGroupData] = useState(null);
    const week = useWeek(state => state.week);

    useEffect(() => {
        getGroupData(groupName).then(data => {
            setGroupData(data);
        })
    }, [groupName]);

    if (!groupData || !week || week.length === 0) {
        return <div className="p-4 border rounded mb-4">Loading...</div>;
    }

    const edittable =  isGroupAdmin(groupData, userId)

    return (
        <ScheduleSection edittable={edittable} name={groupName}>
            {week.map((day, index) => (
                <GroupCell key={index} date={day} groupName={groupName} edittable={edittable} />
            ))}
        </ScheduleSection>
    );
}


const GroupCellDiv = tw`bg-[#C4BBB2] p-2 flex items-center justify-center text-xs text-center text-gray-800
    ${props => !props.$edittable ? 'bg-[#C4BBB2]/60' : ''}
    `;

function GroupCell({ date, groupName, edittable }) {
    const [text, setText] = useState("");
    const lastText = useRef("");

    useEffect(() => {
        getGroupSchedule(groupName, formatDate(date)).then(scheduleText => {
            setText(scheduleText || "");
            lastText.current = scheduleText || "";
        })
    }, [date, groupName]);

    const onBlur = () => {
        if (text !== lastText.current) {
            updateGroupSchedule(groupName, formatDate(date), text)
            lastText.current = text;
        }
    };

    return (
        <GroupCellDiv $edittable={edittable}>
            {edittable ? (
                <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={onBlur}
                    className="focus:bg-white/50 w-full"
                />
            ) : (
                <span className="flex-1 ml-2 whitespace-pre-line">{text}</span>
            )}
        </GroupCellDiv>
    );
}