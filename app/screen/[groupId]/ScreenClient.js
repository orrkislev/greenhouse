'use client'

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import StudentCard from "./StudentCard";
import ScreenTopBar from "./ScreenTopBar";

export default function ScreenClient({ groups = [] }) {
    const searchParams = useSearchParams();

    // Parse URL parameters
    const initialView = searchParams.get('view') === 'projects' ? 'project' : (searchParams.get('view') || 'project');
    const initialIncludeStaff = searchParams.get('staff') === 'true' || searchParams.get('staff') === 'yes';

    // Parse rotate parameter
    // If param exists but is empty/true (e.g. ?rotate), default to 15s
    // If param exists and is a number, use it
    // If param is 'yes', default to 15s
    // Default (missing or 'no') is 0/false (disabled)
    const rotateParam = searchParams.get('rotate');
    let initialRotate = 0;
    if (rotateParam === '' || rotateParam === 'true' || rotateParam === 'yes') {
        initialRotate = 15;
    } else if (rotateParam && !isNaN(parseInt(rotateParam))) {
        initialRotate = parseInt(rotateParam);
    }

    const [view, setView] = useState(initialView);
    const [shouldRotate, setShouldRotate] = useState(initialRotate > 0);
    const [rotateInterval, setRotateInterval] = useState(initialRotate || 15); // Store interval separately
    const [includeStaff, setIncludeStaff] = useState(initialIncludeStaff);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

    const currentGroup = groups[currentGroupIndex];

    // Calculate column layout
    const columns = useMemo(() => {
        if (!currentGroup || currentGroup.students.length === 0) return [];

        let columnCount;
        if (currentGroup.students.length <= 5) columnCount = 2;
        else if (currentGroup.students.length <= 10) columnCount = 3;
        else if (currentGroup.students.length <= 15) columnCount = 4;
        else columnCount = 5;

        const cols = Array.from({ length: columnCount }, () => []);
        currentGroup.students
            .filter(student => includeStaff ? true : student.role === 'student')
            .sort((a, b) => a.first_name.localeCompare(b.first_name))
            .forEach((student, index) => {
                cols[index % columnCount].push(student);
            });

        return cols;
    }, [currentGroup, includeStaff]);

    // Auto-rotation logic
    useEffect(() => {
        if (!shouldRotate) return;

        const interval = setInterval(() => {
            if (groups.length > 1) {
                // Rotate groups
                setCurrentGroupIndex(prev => (prev + 1) % groups.length);
            } else {
                // Rotate view modes (only if single group)
                const viewModes = ['events', 'project', 'research'];
                setView(prevView => {
                    const prevIndex = viewModes.indexOf(prevView);
                    const nextIndex = (prevIndex + 1) % viewModes.length;
                    return viewModes[nextIndex];
                });
            }
        }, rotateInterval * 1000);

        return () => clearInterval(interval);
    }, [shouldRotate, rotateInterval, groups.length]);

    const toggleStaff = () => {
        setIncludeStaff(prev => !prev);
    };

    const toggleRotate = () => {
        setShouldRotate(prev => !prev);
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-gray-900 to-stone-900 overflow-hidden flex flex-col">
            <ScreenTopBar
                group={currentGroup}
                viewMode={view}
                setViewMode={setView}
                includeStaff={includeStaff}
                toggleStaff={toggleStaff}
                isRotating={shouldRotate}
                toggleRotate={toggleRotate}
            />

            {/* Content */}
            <div className="flex-1 overflow-hidden p-3">
                {columns.length > 0 ? (
                    <div className="flex flex-row gap-2 items-start justify-center h-full mt-8">
                        {columns.map((columnStudents, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-2 flex-1 max-w-[280px] overflow-y-auto">
                                {columnStudents.map((student, idx) => (
                                    <StudentCard key={idx} student={student} viewMode={view} />
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
