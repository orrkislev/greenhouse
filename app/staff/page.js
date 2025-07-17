'use client'

import { useState } from "react";
import WithAuth from "@/components/auth/SignIn";
import StaffGroups from "./components/StaffGroups";
import StaffStudents from "./components/StaffStudents";
import { tw } from "@/utils/tw";
import useStaffStudentsData from "./utils/useStaffStudentsData";
import { useUser } from "@/utils/useUser";

const TabContainer = tw`flex bg-gray-100 rounded-lg p-1`;
const TabButton = tw`px-6 py-2 rounded-lg font-medium transition-all 
    ${props => props.$active == 'true' ? "bg-white text-blue-600 shadow-sm"
        : "text-gray-600 hover:text-gray-800"}
`;

export default function StaffPage() {
    const { students } = useStaffStudentsData()
    const [activeTab, setActiveTab] = useState("groups");
    const [mode, setMode] = useState("schedule");

    console.log("StaffPage", students);

    return (
        <WithAuth role='staff'>
            <div className="min-h-screen p-4" dir="rtl">
                <div className="max-w-7xl mx-auto">
                    {/* Header with tabs and mode toggle */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center">
                            {/* Tab Navigation */}
                            <TabContainer>
                                <TabButton
                                    onClick={() => setActiveTab("groups")}
                                    $active={activeTab === "groups" ? 'true' : 'false'}
                                >
                                    קבוצות
                                </TabButton>
                                <TabButton
                                    onClick={() => setActiveTab("students")}
                                    $active={activeTab === "students" ? 'true' : 'false'}
                                >
                                    חניכים
                                </TabButton>
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

                    {activeTab === "groups" && (
                        <StaffGroups students={students} mode={mode} />
                    )}
                    {activeTab === "students" && (
                        <StaffStudents
                            students={students}
                            mode={mode}
                        />
                    )}
                </div>
            </div>
        </WithAuth>
    );
}