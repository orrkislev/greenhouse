'use client'

import { useEffect, useMemo, useState } from "react";
import StaffGroup from "./components/StaffGroup";
import StaffStudents from "./components/StaffStudents";
import { staffActions, useStaff } from "@/utils/store/useStaff";
import { groupsActions, useGroups } from "@/utils/store/useGroups";
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import { useUser } from "@/utils/store/useUser";
import Staff_Admin from "./components/Staff_Admin";

export default function StaffPage() {
    const user = useUser(state => state.user);
    const groups = useGroups(state => state.groups);
    const students = useStaff(state => state.students);
    const [activeTab, setActiveTab] = useState("students");

    const staffGroups = useMemo(() => groups.filter(g => g.isMentor), [groups]);

    useEffect(() => {
        groupsActions.loadGroups();
        staffActions.getMentoringStudents();
    }, []);

    useEffect(() => {
        setActiveTab(staffGroups.length > 0 ? staffGroups[0].id : "students");
    }, [staffGroups]);

    const selectedGroup = staffGroups.find(g => g.id === activeTab) || groups.find(g => g.id === activeTab);

    return (
        <DashboardLayout>
            <DashboardPanel>
                {staffGroups.map(group => (
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
                {selectedGroup && <StaffGroup group={selectedGroup} />}
            </DashboardMain>
        </DashboardLayout>
    );
}