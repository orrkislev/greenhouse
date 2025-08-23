'use client'

import AdminGroups from "./components/AdminGroups"
import { useEffect, useState } from "react"
import AdminStaff from "./components/AdminStaff"
import AdminYearSchedule from "./components/AdminYearSchedule"
import AdminProjects from "./components/AdminProjects"
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardMain } from "@/components/DashboardLayout"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AdminPage() {
    const searchParams = useSearchParams()

    const view = searchParams.get('view') || 'groups'

    return (
        <DashboardLayout>
            <DashboardPanel>
                <Link href={`/admin?view=groups`}>
                    <DashboardPanelButton $active={view === 'groups'}>חניכים</DashboardPanelButton>
                </Link>
                <Link href={`/admin?view=staff`}>
                    <DashboardPanelButton $active={view === 'staff'}>צוות</DashboardPanelButton>
                </Link>
                <Link href={`/admin?view=year-schedule`}>
                    <DashboardPanelButton $active={view === 'year-schedule'}>תכנון שנתי</DashboardPanelButton>
                </Link>
                <Link href={`/admin?view=projects`}>
                    <DashboardPanelButton $active={view === 'projects'}>פרויקטים</DashboardPanelButton>
                </Link>
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