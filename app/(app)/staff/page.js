'use client'

import { useEffect, useMemo, useState } from "react";
import MentoringGroup from "./components/MentoringGroup";
import StaffStudents from "./components/StaffStudents";
import { tw } from "@/utils/tw";
import { staffActions, useStaff } from "@/utils/useStaff";
import { useGroups } from "@/utils/useGroups";

const TabContainer = tw`flex bg-gray-100 rounded-lg p-1`;
const TabButton = tw`px-6 py-2 rounded-lg font-medium transition-all 
    ${props => props.$active == 'true' ? "bg-white text-blue-600 shadow-sm"
        : "text-gray-600 hover:text-gray-800"}
`;


export default function StaffPage() {
    const groups = useGroups(state => state.groups);
    const students = useStaff(state => state.students);
    const [activeTab, setActiveTab] = useState("students");
    const [mode, setMode] = useState("schedule");

    const mentoringGroups = useMemo(() => groups.filter(g => g.isMentor), [groups]);

    useEffect(() => {
        staffActions.getMentoringStudents();
    }, []);

    useEffect(() => {
        setActiveTab(mentoringGroups.length > 0 ? mentoringGroups[0].id : "students");
    }, [mentoringGroups]);


    return (
        <div className="min-h-screen p-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header with tabs and mode toggle */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        {/* Tab Navigation */}
                        <TabContainer>
                                {mentoringGroups.map(group => (
                                    <TabButton
                                        key={group.id}
                                        onClick={() => setActiveTab(group.id)}
                                        $active={activeTab === group.id ? 'true' : 'false'}
                                    >
                                        {group.name}
                                    </TabButton>
                                ))}
                                {students.length > 0 && (
                                <TabButton
                                    onClick={() => setActiveTab("students")}
                                    $active={activeTab === "students" ? 'true' : 'false'}
                                >
                                        ליווי
                                    </TabButton>
                                )}
                        </TabContainer>

                        {/* Mode Toggle */}
                        <TabContainer>
                            <TabButton
                                onClick={() => setMode("schedule")}
                                $active={mode === "schedule" ? 'true' : 'false'}
                            >
                                לוז
                            </TabButton>
                            <TabButton
                                onClick={() => setMode("project")}
                                $active={mode === "project" ? 'true' : 'false'}
                            >
                                פרויקט
                            </TabButton>
                        </TabContainer>
                    </div>
                </div>


                {activeTab === "students" ? (
                    <StaffStudents
                        students={[]}
                        mode={mode}
                    />
                ) : (
                    <MentoringGroup
                        group={mentoringGroups.find(g => g.id === activeTab)}
                        mode={mode}
                    />
                )}
            </div>
        </div>
    );
}