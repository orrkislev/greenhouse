'use client'

import { useEffect, useState } from "react";
import StaffGroup from "./components/StaffGroup";
import StaffStudents from "./components/StaffStudents";
import { useMentorships } from "@/utils/store/useMentorships";
import { useUserGroups } from "@/utils/store/useGroups";
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import Staff_Admin from "./components/Staff_Admin";
import { isAdmin } from "@/utils/store/useUser";

export default function StaffPage() {
    const groups = useUserGroups();
    const students = useMentorships(state => state.mentorships);
    const [activeTab, setActiveTab] = useState("students");

    useEffect(() => {
        setActiveTab(groups.length > 0 ? groups[0].id : "students");
    }, [groups.length]);

    const selectedGroup = groups.find(g => g.id === activeTab);

    return (
        <DashboardLayout>
            <DashboardPanel>
                {groups.map(group => (
                    <DashboardPanelButton key={group.id} onClick={() => setActiveTab(group.id)} $active={activeTab === group.id}>
                        {group.type == 'major' && 'מגמת '}
                        {group.type == 'class' && 'קבוצת '}
                        {group.name}
                    </DashboardPanelButton>
                ))}
                <DashboardPanelButton onClick={() => setActiveTab('students')} $active={activeTab === 'students'}>ליווי</DashboardPanelButton>
                {isAdmin() && (
                    <DashboardPanelButton onClick={() => setActiveTab('admin')} $active={activeTab === 'admin'}>תיכון החממה</DashboardPanelButton>
                )}
            </DashboardPanel>
            <DashboardMain>
                {activeTab === 'students' && <StaffStudents students={students} />}
                {activeTab === 'admin' && <Staff_Admin />}
                {selectedGroup && <StaffGroup group={selectedGroup} />}
            </DashboardMain>
        </DashboardLayout>
    );
}