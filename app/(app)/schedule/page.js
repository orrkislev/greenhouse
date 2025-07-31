'use client';

import { tw } from "@/utils/tw";
import Gantt from "./components/Gantt";
import { ScheduleEvents } from "./components/events/Events";
import ScheduleTop from "./components/ScheduleTop";
// import Semester from "./Semester/Semester";
import { useState } from "react";
import GroupSchedules from "./components/GroupSchedule/GroupSchedules";
import Meetings from "./components/meetings/Meetings";
import GoogleCalendar from "./components/Google/GoogleCalendar";
import Notes from "./components/notes/Notes";

const ScheduleOuter = tw`w-full h-full px-16 pt-8`;

export default function SchedulePage() {
    const [view, setView] = useState('week');

    return (
        <>
            <ScheduleOuter>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl">לוח זמנים</h1>
                    <div className="flex space-x-4">
                        <button
                            className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            onClick={() => setView('week')}
                        >
                            שבוע
                        </button>
                        <button
                            className={`px-4 py-2 rounded ${view === 'semester' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            onClick={() => setView('semester')}
                        >
                            תקופה
                        </button>
                    </div>
                </div>
                <ScheduleTop view={view} />

                {view === 'week' && (
                    <>
                        <Notes />
                        <Meetings />
                        <ScheduleEvents />
                        <GoogleCalendar />
                        <GroupSchedules />
                        <Gantt />
                    </>
                )}
                {view === 'semester' && (
                    <>
                        {/* <Semester /> */}
                    </>
                )}
            </ScheduleOuter>
        </>

    )
}