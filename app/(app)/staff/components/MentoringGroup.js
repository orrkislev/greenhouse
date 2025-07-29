'use client'

import MentoringGroup_Students from "./MentoringGroup_Students";
import MentoringGroup_Meetings from "./MentoringGroup_Meetings";
import MentoringGroup_Header from "./MentoringGroup_Header";
import { useEffect } from "react";
import { groupsActions } from "@/utils/useGroups";


export default function MentoringGroup({ group, mode }) {

    useEffect(() => {
        if (!group) return;
        groupsActions.loadClassStudents(group.id);
    }, [group])

    const styles = mode === "schedule" ? {
        border: "border-green-200",
        header: "bg-green-50 text-green-800",
        accent: "text-green-600"
    } : {
        border: "border-purple-200",
        header: "bg-purple-50 text-purple-800",
        accent: "text-purple-600"
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 ${styles.border} overflow-hidden hover:shadow-md transition-shadow`}>
            
            <MentoringGroup_Header
                group={group}
                styles={styles}
            />

            <MentoringGroup_Students
                group={group}
                mode={mode}
                styles={styles}
            />

            {mode === 'schedule' && (
                <MentoringGroup_Meetings
                    group={group}
                    styles={styles}
                />
            )}

        </div>
    );
}
