'use client'

import WithAuth from "@/components/WithAuth"
import AdminGroups from "./components/AdminGroups"
import { useEffect, useState } from "react"
import AdminStaff from "./components/AdminStaff"
import AdminYearSchedule from "./components/AdminYearSchedule"
import { tw } from "@/utils/tw"
import { membersActions } from "@/utils/useMembers"

const DashboardLayout = tw`flex h-screen border-t border-gray-200 mt-4`;
const DashboardPanel = tw`flex flex-col pr-4 pt-4 z-2`;
const DashboardPanelButton = tw`
    text-xs text-gray-500 hover:bg-gray-600 px-4 py-2 cursor-pointer
    border-b border-r border-gray-300
    transition-colors duration-200
    ${props => props.$active ? 'bg-white text-black font-semibold z-5 scale-110 border-t' : ''}
`;
const DashboardMain = tw`flex-1 p-4 bg-white border-r border-gray-200 overflow-y-auto z-1`;



export default function AdminPage() {
    return (
        <WithAuth role="admin">
            <AdminPageActual />
        </WithAuth>
    )
}

function AdminPageActual() {
    const [view, setView] = useState('staff');

    useEffect(() => {
        membersActions.initialize();
    }, [])

    return (
        <DashboardLayout>
            <DashboardPanel>
                <DashboardPanelButton className='border-t' onClick={() => setView('dashboard')} $active={view === 'dashboard'}>ראשי</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('groups')} $active={view === 'groups'}>קבוצות</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('staff')} $active={view === 'staff'}>צוות</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('year-schedule')} $active={view === 'year-schedule'}>תכנון שנתי</DashboardPanelButton>
            </DashboardPanel>
            <DashboardMain>
                {view === 'dashboard' && <div>Dashboard Content</div>}
                {view === 'groups' && <AdminGroups />}
                {view === 'staff' && <AdminStaff />}
                {view === 'year-schedule' && <AdminYearSchedule />}
            </DashboardMain>
        </DashboardLayout>
    )
}