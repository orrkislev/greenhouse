'use client'

import StaffGroup_Students from "./StaffGroup_Students";
// import StaffGroup_Meetings from "./StaffGroup_Meetings";
import StaffGroup_Header from "./StaffGroup_Header";
import { useEffect } from "react";
import { groupsActions } from "@/utils/store/useGroups";


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
                <div className='flex-1 flex gap-4 p-4 border border-gray-200'>
                    <div className=''>הודעה</div>
                    <div className=''>
                        <textarea defaultValue={group.message} onBlur={(e) => updateMessage(e.target.value)} className="w-full h-full" />
                    </div>
                </div>
                <div className='flex-1 flex gap-4 p-4 border border-gray-200'>
                    <div className=''>משימות</div>
                </div>
            </div>
            <StaffGroup_Students group={group} />
            {/* <StaffGroup_Meetings group={group} /> */}
        </div>
    );
}
