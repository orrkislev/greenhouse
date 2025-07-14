import { tw } from "@/utils/tw";
import { endOfWeek, isToday, startOfWeek } from "date-fns";
import { useEffect } from "react";
import { ScheduleSection } from "../Layout";
import { useGantt } from "../../utils/useGantt";

const SemesterCell = tw`text-center bg-[#F3C5C599] z-1 border border-white min-h-16 text-xs p-2 pt-6
${props => props.$isWeekend ? 'bg-[#F3C5C5]' : ''}
${props => props.$isInSemester == false ? 'bg-gray-100' : ' '}
${props => props.$isPast ? 'stripes' : ''}
${props => props.$isToday ? 'bg-[#FF8585]' : ''}
    `;
const SemesterDate = tw`text-xs p-1 z-2 pointer-events-none opacity-50`;

const WeekMarker = tw`border border-white bg-[#F3C5C5] text-center text-xs font-bold z-3 rounded-full w-8 h-8 flex items-center justify-center
    transform translate-x-3/4 translate-y-1/2
    `;

export default function Semester() {
    const semesterData = {
        start: "01-07-2025",
        end: "31-08-2025",
        name: "החופש הגדול",
    }
    const gantt = useGantt();

    useEffect(() => {
        if (!gantt) return;
        gantt.fetchGanttEvents(semesterData.start, semesterData.end);
    }, [gantt]);

    // Function to calculate all weeks in the semester
    const calculateSemesterWeeks = () => {
        const endDate = semesterData.end;

        // Find the first Sunday (start of first week)
        const firstSunday = startOfWeek(semesterData.start)

        const weeks = [];
        let currentWeekStart = new Date(firstSunday);
        while (currentWeekStart <= endDate) {

            const week = {
                weekNumber: weeks.length + 1,
                startDate: currentWeekStart,
                endDate: endOfWeek(currentWeekStart),
                days: []
            };

            // Add each day of the week
            for (let i = 0; i < 6; i++) {
                const currentDay = new Date(currentWeekStart);
                currentDay.setDate(currentWeekStart.getDate() + i);

                const dayInfo = {
                    date: currentDay,
                    dateString: currentDay.getDate().toString().padStart(2, '0') + '/' + (currentDay.getMonth() + 1).toString().padStart(2, '0'),
                    dayOfWeek: currentDay.getDay(),
                    isWeekend: currentDay.getDay() === 5 || currentDay.getDay() === 6, // Friday (5) or Saturday (6)
                    isInSemester: currentDay >= semesterData.start && currentDay <= semesterData.end,
                    col: i + 1, // 1-based index for row
                    row: weeks.length + 1, // 1-based index for column (week number)
                    isPast: currentDay < new Date(new Date().setHours(0, 0, 0, 0)), // Check if the day is in the past
                    isToday: isToday(currentDay),
                };

                week.days.push(dayInfo);
            }

            weeks.push(week);

            // Move to next week (add 7 days)
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }

        return weeks;
    }

    const weeks = calculateSemesterWeeks();
    const days = weeks.map(week => week.days).flat();

    return (
        <ScheduleSection>
            {days.map((day, index) => (
                <SemesterCell key={index} className={`col-${day.col} row-${day.row}`}
                    $isInSemester={day.isInSemester}
                    $isWeekend={day.isWeekend}
                    $isPast={day.isPast}
                    $isToday={day.isToday}>

                    {gantt.gantt[day.date] && gantt.gantt[day.date].map((event, eventIndex) => (
                        <div key={eventIndex} className="text-xs text-gray-700 text-center">
                            {event}
                        </div>
                    ))}
                </SemesterCell>
            ))}

            {days.map((day, index) => (
                <SemesterDate key={index} className={`col-${day.col} row-${day.row}`}>
                    {day.dateString}
                </SemesterDate>
            ))}

            {weeks.map((week, index) => (
                <WeekMarker key={index} className={`col-1 row-${week.weekNumber}`}>
                    {week.weekNumber}
                </WeekMarker>
            ))}
        </ScheduleSection>
    )
}