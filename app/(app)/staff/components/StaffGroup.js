'use client'

import StaffGroup_Students from "./StaffGroup_Students";
// import StaffGroup_Meetings from "./StaffGroup_Meetings";
import StaffGroup_Header from "./StaffGroup_Header";
import { useEffect } from "react";
import { groupsActions } from "@/utils/store/useGroups";
import StaffGroup_Meetings from "./StaffGroup_Meetings";
import Box2 from "@/components/Box2";


export default function StaffGroup({ group }) {
    useEffect(() => {
        groupsActions.loadClassStudents(group);
    }, [group])

    const updateMessage = (message) => {
        groupsActions.updateGroup(group, { message });
    }

    return (
        <div className="flex flex-col gap-4">
            <StaffGroup_Header group={group} />
            <div className="flex gap-4 ">
                <Box2 label="הודעה" className="flex-1">
                    <div className=''>
                        <textarea defaultValue={group.message} onBlur={(e) => updateMessage(e.target.value)} className="w-full h-full" />
                    </div>
                </Box2>
                <Box2 label="משימות" className="flex-1">
                    {/* TODO */}
                    <div>אפשר לקבוע משימות לכל התלמידים בקבוצה</div>
                    <div>אפשר לעקוב אחר משימות מסויימות</div>
                </Box2>
            </div>
            <StaffGroup_Students group={group} />
            <StaffGroup_Meetings group={group} />
        </div>
    );
}
