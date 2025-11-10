'use client'

import { use, useState } from "react";
import StudentCard from "./StudentCard";
import ScreenTopBar from "./ScreenTopBar";
import { useScreenData, useColumnLayout } from "./useScreenData";

export default function ScreenPage({ params }) {
    const { groupId } = use(params);
    const { group, students, isLoading } = useScreenData(groupId);
    const columns = useColumnLayout(students);
    const [viewMode, setViewMode] = useState('events'); // 'events', 'project', 'research'

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold text-gray-700">טוען נתונים...</h2>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-700 mb-4">אוי לא מצאנו את הקבוצה</h1>
                    <p className="text-gray-500">נסה לרענן את הדף</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-gray-900 to-stone-900 overflow-hidden flex flex-col">
            <ScreenTopBar group={group} viewMode={viewMode} setViewMode={setViewMode} />

            {/* Content */}
            <div className="flex-1 overflow-hidden p-3">
                {columns.length > 0 ? (
                    <div className="flex flex-row gap-2 items-start justify-center h-full mt-8">
                        {columns.map((columnStudents, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-2 flex-1 max-w-[280px] overflow-y-auto">
                                {columnStudents.map(student => (
                                    <StudentCard key={student.id} student={student} viewMode={viewMode} />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xl text-gray-400">אין תלמידים בקבוצה</p>
                    </div>
                )}
            </div>
        </div>
    );
}
