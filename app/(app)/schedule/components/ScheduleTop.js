import { timeActions, useTime } from "@/utils/store/useTime";
import { tw } from "@/utils/tw";
import { ScheduleSection } from "./Layout";
import { ChevronLeft, ChevronRight } from "lucide-react";


const DayColumn = tw`bg-[#F3ECE6] py-2 flex flex-col items-center justify-start text-black`;

export const daysOfTheWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'סופשבוע'];
export default function ScheduleTop({ view }) {
    const week = useTime(state => state.week);

    const labels = week.map((date, i) => {
        const dateObj = new Date(date);
        return {
            dayOfTheWeek: daysOfTheWeek[i],
            weekday: dateObj.toLocaleDateString('he-IL', { month: 'long', day: 'numeric' }),
            semester: dateObj.toLocaleDateString('he-IL', { weekday: 'long' }),
        };
    });

    return (
        <ScheduleSection className='border-t'>
                <ChevronRight className="w-6 h-6 absolute top-1/2 -translate-y-1/2 right-0 cursor-pointer hover:bg-white hover:scale-110 transition-all rounded-full p-1" onClick={() => timeActions.prevWeek()} />
                <ChevronLeft className="w-6 h-6 absolute top-1/2 -translate-y-1/2 left-0 cursor-pointer hover:bg-white hover:scale-110 transition-all rounded-full p-1" onClick={() => timeActions.nextWeek()} />
                {labels.map((label, dayIndex) => (
                    <DayColumn key={dayIndex} className={`col-${dayIndex + 1} ${dayIndex === 5 ? 'bg-[#E4D4C7]' : ''}`}>
                        <div className='text-lg font-semibold'>{label.dayOfTheWeek}</div>
                        {view === 'week' && <div className="text-xs">{label.weekday}</div>}
                    </DayColumn>
                ))}
        </ScheduleSection>
    );
}
