'use client'

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StaffGroup from "./components/StaffGroup";
import StaffStudents from "./components/StaffStudents";
import { useMentorships } from "@/utils/store/useMentorships";
import { groupsActions, useUserGroups } from "@/utils/store/useGroups";
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import Staff_Admin from "./components/Staff_Admin";
import { isAdmin } from "@/utils/store/useUser";
import { Plus } from "lucide-react";

export default function StaffPage() {
    const groups = useUserGroups();
    const students = useMentorships(state => state.mentorships);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("students");

    // Initialize activeTab from URL on mount
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        } else if (groups.length > 0) {
            setActiveTab(groups[0]?.id);
        }
    }, [groups.length, searchParams]);

    // Update URL when activeTab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const selectedGroup = groups.find(g => g.id === activeTab);

    return (
        <DashboardLayout>
            <DashboardPanel>
                {groups.map(group => (
                    <DashboardPanelButton key={group.id} onClick={() => handleTabChange(group.id)} $active={activeTab === group.id}>
                        {group.type == 'major' && 'מגמת '}
                        {group.type == 'class' && 'קבוצת '}
                        {group.type == 'club' && 'מועדון '}
                        {group.name}
                    </DashboardPanelButton>
                ))}
                <DashboardPanelButton onClick={() => handleTabChange('students')} $active={activeTab === 'students'}>ליווי</DashboardPanelButton>
                {isAdmin() && (
                    <DashboardPanelButton onClick={() => handleTabChange('admin')} $active={activeTab === 'admin'}>תיכון החממה</DashboardPanelButton>
                )}
                <DashboardPanelButton onClick={() => groupsActions.createGroup('לימוד', 'club')}>
                    <Plus className="w-4 h-4" />
                </DashboardPanelButton>
            </DashboardPanel>
            <DashboardMain className='p-4'>
                {activeTab === 'students' && <StaffStudents students={students} />}
                {activeTab === 'admin' && <Staff_Admin />}
                {selectedGroup && <StaffGroup group={selectedGroup} />}
            </DashboardMain>
        </DashboardLayout>
    );
}