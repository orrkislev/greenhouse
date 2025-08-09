'use client'

import AdminGroups from "./components/AdminGroups"
import { useState } from "react"
import AdminStaff from "./components/AdminStaff"
import AdminYearSchedule from "./components/AdminYearSchedule"
import AdminProjects from "./components/AdminProjects"
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"

export default function AdminPage() {
    const [view, setView] = useState('groups');

    return (
        <DashboardLayout>
            <DashboardPanel>
                <DashboardPanelButton onClick={() => setView('groups')} $active={view === 'groups'}>חניכים</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('staff')} $active={view === 'staff'}>צוות</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('year-schedule')} $active={view === 'year-schedule'}>תכנון שנתי</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('projects')} $active={view === 'projects'}>פרויקטים</DashboardPanelButton>
            </DashboardPanel>
            <DashboardMain>
                {view === 'groups' && <AdminGroups />}
                {view === 'staff' && <AdminStaff />}
                {view === 'year-schedule' && <AdminYearSchedule />}
                {view === 'projects' && <AdminProjects />}
            </DashboardMain>
        </DashboardLayout>
    )
}