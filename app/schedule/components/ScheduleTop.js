import { useWeek } from "@/app/schedule/utils/useWeek";
import { tw } from "@/utils/tw";
import { ScheduleSection } from "./Layout";


const DayColumn = tw`bg-[#F3ECE6] py-2 flex flex-col items-center justify-start text-black`;

export const daysOfTheWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'סופשבוע'];
export default function ScheduleTop({ view }) {
    const week = useWeek((state) => state.week);

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
                {labels.map((label, dayIndex) => (
                    <DayColumn key={dayIndex} className={`col-${dayIndex + 1} ${dayIndex === 5 ? 'bg-[#E4D4C7]' : ''}`}>
                        {view === 'week' && (
                            <>
                                <div className='text-lg font-semibold'>{label.dayOfTheWeek}</div>
                                <div className="text-xs">{label.weekday}</div>
                            </>
                        )}
                        {view === 'semester' && (
                            <div className='text-lg font-semibold'>{label.semester}</div>
                        )}
                    </DayColumn>
                ))}
        </ScheduleSection>
    );
}
