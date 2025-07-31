'use client'

import AdminGroups from "./components/AdminGroups"
import { useState } from "react"
import AdminStaff from "./components/AdminStaff"
import AdminYearSchedule from "./components/AdminYearSchedule"
import AdminProjects from "./components/AdminProjects"
import AdminDashboard from "./components/AdminDashboard"
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"

export default function AdminPage() {
    const [view, setView] = useState('staff');

    return (
        <DashboardLayout>
            <DashboardPanel>
                <DashboardPanelButton onClick={() => setView('dashboard')} $active={view === 'dashboard'}>ראשי</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('groups')} $active={view === 'groups'}>חניכים</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('staff')} $active={view === 'staff'}>צוות</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('year-schedule')} $active={view === 'year-schedule'}>תכנון שנתי</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('projects')} $active={view === 'projects'}>פרויקטים</DashboardPanelButton>
            </DashboardPanel>
            <DashboardMain>
                {view === 'dashboard' && <AdminDashboard />}
                {view === 'groups' && <AdminGroups />}
                {view === 'staff' && <AdminStaff />}
                {view === 'year-schedule' && <AdminYearSchedule />}
                {view === 'projects' && <AdminProjects />}
            </DashboardMain>
        </DashboardLayout>
    )
}