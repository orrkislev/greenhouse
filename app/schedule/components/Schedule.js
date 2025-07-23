'use client';

import { tw } from "@/utils/tw";
import Gantt from "./Gantt";
import Tasks from "./tasks/Tasks";
import { ScheduleEvents } from "./events/Events";
import ScheduleTop from "./ScheduleTop";
import Semester from "./Semester/Semester";
import { useState } from "react";
import { AddSchedule } from "./GroupSchedule/AddSchedule";
import GroupSchedules from "./GroupSchedule/GroupSchedules";
import Meetings from "./meetings/Meetings";
import GoogleCalendar from "./Google/GoogleCalendar";

const ScheduleOuter = tw`w-full h-full px-16 pt-8`;

export default function Schedule() {
    const [view, setView] = useState('week');

    return (
        <>
            <ScheduleOuter>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">לוח זמנים</h1>
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
                        <Tasks />
                        <Meetings />
                        <ScheduleEvents />
                        <GoogleCalendar />
                        <GroupSchedules />
                        {/* <Gantt /> */}
                        <AddSchedule />
                    </>
                )}
                {view === 'semester' && (
                    <>
                        <Semester />
                    </>
                )}
            </ScheduleOuter>
        </>

    )
}