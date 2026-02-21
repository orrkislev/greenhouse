'use client';

import { useState } from "react";
import ContextBar from "@/components/ContextBar";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import Schedule from "./components/Schedule";
import ScheduleContext from "../schedule/components/ScheduleContext";
import Term from "./term/Term";


export default function SchedulePage() {
    const [view, setView] = useState('week');


    return (
        <>
            <DashboardLayout>
                <DashboardPanel>
                    <DashboardPanelButton onClick={() => setView('week')} $active={view === 'week'}>שבוע</DashboardPanelButton>
                    <DashboardPanelButton onClick={() => setView('semester')} $active={view === 'semester'}>תקופה</DashboardPanelButton>
                </DashboardPanel>
                <DashboardMain>
                    {view === 'week' ? <Schedule view="week" /> : <Term />}
                </DashboardMain>
            </DashboardLayout>
            <ContextBar>
                <ScheduleContext />
            </ContextBar>
        </>
    )
}