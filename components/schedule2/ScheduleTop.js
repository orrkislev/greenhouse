import { useWeek } from "@/utils/store/scheduleDisplayStore";
import { tw } from "@/utils/tw";

export const ScheduleGrid = tw`grid grid-cols-6 w-full relative h-full grid-cols-[repeat(6,1fr)] mb-2`;
const DayColumn = tw`bg-[#F3ECE6] row-start-1 row-end-[9] z-5  py-2
    border-l-2 border-white
    flex flex-col items-center justify-start text-black
`;

export const daysOfTheWeek = ['א', 'ב', 'ג', 'ד', 'ה', 'סופשבוע'];
export default function ScheduleTop({ view }) {
    const week = useWeek((state) => state.week);

    return (
        <ScheduleGrid>
            {week.map((day, dayIndex) => (
                <DayColumn key={dayIndex} className={`col-${dayIndex + 1} ${dayIndex === 5 ? 'bg-[#E4D4C7]' : ''}`}>
                    {view === 'week' && (
                        <>
                            <div className='text-lg font-semibold'>{daysOfTheWeek[dayIndex]}</div>
                            <div className="text-xs">{day.toLocaleDateString('he-IL', { month: 'long', day: 'numeric' })}</div>
                        </>
                    )}
                    {view === 'semester' && (
                        <div className='text-lg font-semibold'>{day.toLocaleDateString('he-IL', { weekday: 'long' })}</div>
                    )}
                </DayColumn>
            ))}
        </ScheduleGrid>
    );
}
