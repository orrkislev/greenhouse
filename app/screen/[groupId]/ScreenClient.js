'use client'

import { useState, useEffect, useMemo } from "react";
import StudentCard from "./StudentCard";
import ScreenTopBar from "./ScreenTopBar";

export default function ScreenClient({ group }) {
    const [view, setView] = useState('events');
    const [rotate, setRotate] = useState(false);
    const [includeStaff, setIncludeStaff] = useState(false);

    // Calculate column layout
    const columns = useMemo(() => {
        if (group.students.length === 0) return [];

        let columnCount;
        if (group.students.length <= 5) columnCount = 2;
        else if (group.students.length <= 10) columnCount = 3;
        else if (group.students.length <= 15) columnCount = 4;
        else columnCount = 5;

        const cols = Array.from({ length: columnCount }, () => []);
        group.students
            .filter(student => includeStaff ? true : student.role === 'student')
            .sort((a, b) => a.first_name.localeCompare(b.first_name))
            .forEach((student, index) => {
                cols[index % columnCount].push(student);
            });

        return cols;
    }, [group.students, includeStaff]);

    // Auto-rotation logic
    useEffect(() => {
        if (!rotate) return;

        const viewModes = ['events', 'project', 'research'];

        const interval = setInterval(() => {
            setView(prevView => {
                const prevIndex = viewModes.indexOf(prevView);
                const nextIndex = (prevIndex + 1) % viewModes.length;
                return viewModes[nextIndex];
            });
        }, rotate * 10000);

        return () => clearInterval(interval);
    }, [rotate]);

    const toggleStaff = () => {
        setIncludeStaff(prev => !prev);
    };

    const toggleRotate = () => {
        setRotate(prev => !prev);
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-gray-900 to-stone-900 overflow-hidden flex flex-col">
            <ScreenTopBar
                group={group}
                viewMode={view}
                setViewMode={setView}
                includeStaff={includeStaff}
                toggleStaff={toggleStaff}
                isRotating={rotate}
                toggleRotate={toggleRotate}
            />

            {/* Content */}
            <div className="flex-1 overflow-hidden p-3">
                {columns.length > 0 ? (
                    <div className="flex flex-row gap-2 items-start justify-center h-full mt-8">
                        {columns.map((columnStudents, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-2 flex-1 max-w-[280px] overflow-y-auto">
                                {columnStudents.map(student => (
                                    <StudentCard key={student.id} student={student} viewMode={view} />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-xl text-muted-foreground">אין תלמידים בקבוצה</p>
                    </div>
                )}
            </div>
        </div>
    );
}
