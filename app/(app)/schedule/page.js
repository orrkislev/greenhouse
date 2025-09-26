'use client';

import { tw } from "@/utils/tw";
import Gantt from "./components/Gantt";
import Events from "./components/events/Events";
import ScheduleTop from "./components/ScheduleTop";
import { useState } from "react";
import GroupSchedules from "./components/GroupSchedule/GroupSchedules";
import Meetings from "./components/meetings/Meetings";
import GoogleCalendar from "./components/Google/GoogleCalendar";
import Notes from "./components/notes/Notes";
import Term from "./components/term/Term";
import ContextBar, { PageMain } from "@/components/ContextBar";
import { DashboardLayout, DashboardPanel, DashboardPanelButton, DashboardTitle } from "@/components/DashboardLayout";
import ScheduleContext from "./components/ScheduleContext";

const ScheduleOuter = tw`w-full h-full pr-16 pt-8`;

export default function SchedulePage() {
    const [view, setView] = useState('week');

    return (
        <>
        <PageMain>
            <DashboardLayout>
            <DashboardTitle>לוח זמנים</DashboardTitle>
            <DashboardPanel>
                <DashboardPanelButton onClick={() => setView('week')} $active={view === 'week'}>שבוע</DashboardPanelButton>
                <DashboardPanelButton onClick={() => setView('semester')} $active={view === 'semester'}>תקופה</DashboardPanelButton>
            </DashboardPanel>
            <ScheduleOuter>

                <ScheduleTop view={view} />

                {view === 'week' && (
                    <>
                        <Notes />
                        <Meetings />
                        <Events />
                        <GoogleCalendar />
                        <GroupSchedules />
                        <Gantt />
                    </>
                )}
                {view === 'semester' && (
                    <>
                        <Term />
                    </>
                    )}
                </ScheduleOuter>
            </DashboardLayout>
        </PageMain>
        <ContextBar>
            <ScheduleContext />
        </ContextBar>
        </>
    )
}