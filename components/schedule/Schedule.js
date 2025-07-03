'use client';

import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { tw } from "@/utils/tw";
import Gantt from "./Gantt";
import Tasks from "./tasks/Tasks";
import Events from "./events/Events";

const ScheduleOuter = tw`w-full h-full px-16 pt-8`;
const ScheduleContainer = tw`grid grid-cols-7 w-full relative h-full gap-x-2 gap-y-2 grid-cols-[1fr_repeat(6,_minmax(0,2fr))]`;
const DayColumn = tw`bg-slate-800/10 rounded-t-lg rounded-b-lg mb-[-1em] row-start-1 row-end-[9] z-5 backdrop-blur-2xs
    shadow-[0_0px_20px_rgba(255,255,255,.8)_inset] flex flex-col items-center justify-start
`;
const DayHeader = tw`flex items-center justify-center gap-2 z-10`;
export const SectionTitle = tw`flex items-center justify-end text-gray-800 text-sm mb-4 col-1 z-10`;

const daysOfTheWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'ו-ש'];
export default function Schedule({ edittable = false }) {
    const week = useWeek((state) => state.week);

    return (
        <ScheduleOuter>
            <ScheduleContainer>
                {week.map((day, dayIndex) => (
                    <DayColumn key={dayIndex} className={`col-${dayIndex + 2} ${dayIndex === 5 ? 'bg-sky-900/30' : ''}`} />
                ))}


                {week.map((day, dayIndex) => (
                    <DayHeader key={dayIndex} className={`col-${dayIndex + 2} row-1`}>
                        <div className='text-gray-800 text-lg font-semibold'>{daysOfTheWeek[dayIndex]}</div>
                        <div className="text-gray-500 text-xs">{day.toLocaleDateString('he-IL', { month: 'long', day: 'numeric' })}</div>
                    </DayHeader>
                ))}

                <Gantt />
                <Tasks />
                <Events edittable={edittable} />

            </ScheduleContainer>
        </ScheduleOuter>
    )
}