'use client'

import { useEffect, useMemo, useState } from "react";
import MentoringGroup from "./components/MentoringGroup";
import StaffStudents from "./components/StaffStudents";
import { staffActions, useStaff } from "@/utils/useStaff";
import { groupsActions, useGroups } from "@/utils/useGroups";
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import { useUser } from "@/utils/useUser";
import Staff_Admin from "./components/Staff_Admin";

export default function StaffPage() {
    const user = useUser(state => state.user);
    const groups = useGroups(state => state.groups);
    const students = useStaff(state => state.students);
    const [activeTab, setActiveTab] = useState("students");

    const mentoringGroups = useMemo(() => groups.filter(g => g.isMentor), [groups]);

    useEffect(() => {
        groupsActions.loadGroups();
        staffActions.getMentoringStudents();
    }, []);

    useEffect(() => {
        setActiveTab(mentoringGroups.length > 0 ? mentoringGroups[0].id : "students");
    }, [mentoringGroups]);

    const selectedGroup = mentoringGroups.find(g => g.id === activeTab) || groups.find(g => g.id === activeTab);

    return (
        <DashboardLayout>
            <DashboardPanel>
                {mentoringGroups.map(group => (
                    <DashboardPanelButton key={group.id} onClick={() => setActiveTab(group.id)} $active={activeTab === group.id}>{group.name}</DashboardPanelButton>
                ))}
                {students.length > 0 && (
                    <DashboardPanelButton onClick={() => setActiveTab('students')} $active={activeTab === 'students'}>ליווי</DashboardPanelButton>
                )}
                {user.roles.includes('admin') && (
                    <DashboardPanelButton onClick={() => setActiveTab('admin')} $active={activeTab === 'admin'}>תיכון החממה</DashboardPanelButton>
                )}
            </DashboardPanel>
            <DashboardMain>
                {activeTab === 'students' && <StaffStudents students={students} />}
                {activeTab === 'admin' && <Staff_Admin />}
                {selectedGroup && <MentoringGroup group={selectedGroup} />}
            </DashboardMain>
        </DashboardLayout>
    );
}