'use client'

import { use, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StudentCard from "./StudentCard";
import ScreenTopBar from "./ScreenTopBar";
import { useScreenData, useColumnLayout } from "./useScreenData";

export default function ScreenPage({ params }) {
    const { groupId } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Read staff parameter from URL (defaults to false)
    const includeStaff = searchParams.get('staff') === '1';
    
    // Read rotate parameter from URL
    const rotateParam = searchParams.get('rotate');
    const rotateSeconds = rotateParam ? parseInt(rotateParam, 10) : 0;
    const isRotating = rotateSeconds > 0;
    
    const { group, students, isLoading } = useScreenData(groupId, includeStaff);
    const columns = useColumnLayout(students);
    const [viewMode, setViewMode] = useState('events'); // 'events', 'project', 'research'
    
    // Auto-rotation logic
    useEffect(() => {
        if (!isRotating || rotateSeconds <= 0) return;
        
        const viewModes = ['events', 'project', 'research'];
        
        const interval = setInterval(() => {
            setViewMode(prevMode => {
                const prevIndex = viewModes.indexOf(prevMode);
                const nextIndex = (prevIndex + 1) % viewModes.length;
                return viewModes[nextIndex];
            });
        }, rotateSeconds * 1000);
        
        return () => clearInterval(interval);
    }, [isRotating, rotateSeconds]);
    
    const toggleStaff = () => {
        const newIncludeStaff = !includeStaff;
        const params = new URLSearchParams(searchParams.toString());
        if (newIncludeStaff) {
            params.set('staff', '1');
        } else {
            params.delete('staff');
        }
        router.push(`/screen/${groupId}${params.toString() ? '?' + params.toString() : ''}`);
    };
    
    const toggleRotate = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (isRotating) {
            params.delete('rotate');
        } else {
            params.set('rotate', '15');
        }
        router.push(`/screen/${groupId}${params.toString() ? '?' + params.toString() : ''}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold text-foreground">טוען נתונים...</h2>
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">אוי לא מצאנו את הקבוצה</h1>
                    <p className="text-muted-foreground">נסה לרענן את הדף</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-gray-900 to-stone-900 overflow-hidden flex flex-col">
            <ScreenTopBar 
                group={group} 
                viewMode={viewMode} 
                setViewMode={setViewMode}
                includeStaff={includeStaff}
                toggleStaff={toggleStaff}
                isRotating={isRotating}
                toggleRotate={toggleRotate}
            />

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
                        <p className="text-xl text-muted-foreground">אין תלמידים בקבוצה</p>
                    </div>
                )}
            </div>
        </div>
    );
}
