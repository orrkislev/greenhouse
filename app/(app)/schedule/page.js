'use client';

import { tw } from "@/utils/tw";
import Gantt from "./components/Gantt";
import Events from "./components/events/Events";
import ScheduleTop from "./components/ScheduleTop";
import { useState } from "react";
import GroupSchedules from "./components/GroupSchedule/GroupSchedules";
import Meetings from "./components/meetings/Meetings";
import GoogleCalendar from "./components/Google/GoogleCalendar";
import Term from "./components/term/Term";
import ContextBar, { PageMain } from "@/components/ContextBar";
import { DashboardLayout, DashboardMain, DashboardPanel, DashboardPanelButton, DashboardTitle } from "@/components/DashboardLayout";
import ScheduleContext from "./components/ScheduleContext";

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
                <DashboardMain className='p-4 pr-1'>
                    <ScheduleOuter>

                        <ScheduleTop view={view} />

                        {view === 'week' && (
                            <>
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
                </DashboardMain>
            </DashboardLayout>
            <ContextBar>
                <ScheduleContext />
            </ContextBar>
        </>
    )
}