'use client'

import { groupsActions, useMentorGroups } from "@/utils/store/useGroups";
import { use, useEffect } from "react";

export default function ScreenPage({ params }) {
    const { groupId } = use(params);
    const groups = useMentorGroups();
    const group = groups.find(g => g.id === groupId);

    useEffect(()=>{
        if (!group) return;
        groupsActions.loadClassStudents(group);
    }, [group]);

    if (!group) {
        return <div>אוי לא מוצאים את הקבוצה</div>
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <h1 className="text-4xl font-bold">{group.name}</h1>
            {group.students && group.students.map(student => (
                <div key={student.id}>{student.firstName} {student.lastName}</div>
            ))}
        </div>
    )
}