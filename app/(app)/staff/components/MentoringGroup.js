'use client'

import MentoringGroup_Students from "./MentoringGroup_Students";
// import MentoringGroup_Meetings from "./MentoringGroup_Meetings";
import MentoringGroup_Header from "./MentoringGroup_Header";
import { useEffect } from "react";
import { groupsActions } from "@/utils/useGroups";


export default function MentoringGroup({ group }) {
    useEffect(() => {
        groupsActions.loadClassStudents(group);
    }, [group])

    const updateMessage = (message) => {
        groupsActions.updateGroup(group, { message });
    }

    return (
        <div className="flex flex-col gap-4">
            <MentoringGroup_Header group={group} />
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
            <MentoringGroup_Students group={group} />
            {/* <MentoringGroup_Meetings group={group} /> */}
        </div>
    );
}
