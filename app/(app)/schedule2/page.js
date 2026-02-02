'use client';

import { tw } from "@/utils/tw";
import { useState } from "react";
import ContextBar from "@/components/ContextBar";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton } from "@/components/DashboardLayout";
import Schedule from "./components/Schedule2";
import ScheduleContext from "../schedule/components/ScheduleContext";

const ScheduleOuter = tw`w-full h-full pr-2 md:pr-16 pt-4 md:pt-8`;

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
                    <Schedule />
                </DashboardMain>
            </DashboardLayout>
            <ContextBar>
                <ScheduleContext />
            </ContextBar>
        </>
    )
}